#!/usr/bin/env python3
"""
Outlook Invoice Analyzer
Extracts invoice PDFs from Outlook, analyzes them with Claude AI,
and produces a structured Excel report.

Usage:
    python invoice_analyzer.py

Requires a .env file — see .env.example.
"""

import base64
import json
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

import anthropic
import msal
import openpyxl
import requests
from dotenv import load_dotenv
from openpyxl.chart import BarChart, Reference
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

load_dotenv()

# ── Configuration ─────────────────────────────────────────────────────────────

TENANT_ID = os.getenv("AZURE_TENANT_ID", "common")
CLIENT_ID = os.getenv("AZURE_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", "./output"))
DAYS_BACK = int(os.getenv("DAYS_BACK", "30"))
SEARCH_FOLDERS = [f.strip() for f in os.getenv("SEARCH_FOLDERS", "Inbox").split(",")]
INVOICE_KEYWORDS = ["invoice", "inv #", "bill", "receipt", "statement", "remittance"]

GRAPH_SCOPES = ["https://graph.microsoft.com/Mail.Read"]
GRAPH_BASE = "https://graph.microsoft.com/v1.0"
TOKEN_CACHE_PATH = Path.home() / ".outlook_invoice_analyzer_cache.json"

# ── Microsoft Graph authentication ────────────────────────────────────────────


def _load_token_cache() -> msal.SerializableTokenCache:
    cache = msal.SerializableTokenCache()
    if TOKEN_CACHE_PATH.exists():
        cache.deserialize(TOKEN_CACHE_PATH.read_text())
    return cache


def _save_token_cache(cache: msal.SerializableTokenCache) -> None:
    if cache.has_state_changed:
        TOKEN_CACHE_PATH.write_text(cache.serialize())


def get_graph_token() -> str:
    """Acquire a Microsoft Graph access token.

    Uses client-credentials flow when AZURE_CLIENT_SECRET is set (service
    account / daemon), otherwise falls back to interactive device-code flow
    so any user can sign in from a terminal.  Token is cached on disk so
    subsequent runs are silent.
    """
    if not CLIENT_ID:
        sys.exit(
            "Error: AZURE_CLIENT_ID is not set. "
            "Register an app in Azure AD and add it to your .env file."
        )

    cache = _load_token_cache()

    if CLIENT_SECRET:
        app = msal.ConfidentialClientApplication(
            CLIENT_ID,
            authority=f"https://login.microsoftonline.com/{TENANT_ID}",
            client_credential=CLIENT_SECRET,
            token_cache=cache,
        )
        scopes = ["https://graph.microsoft.com/.default"]
        result = app.acquire_token_for_client(scopes=scopes)
    else:
        app = msal.PublicClientApplication(
            CLIENT_ID,
            authority=f"https://login.microsoftonline.com/{TENANT_ID}",
            token_cache=cache,
        )
        scopes = GRAPH_SCOPES
        accounts = app.get_accounts()
        result = app.acquire_token_silent(scopes, account=accounts[0]) if accounts else None

        if not result:
            flow = app.initiate_device_flow(scopes=scopes)
            if "user_code" not in flow:
                sys.exit(f"Auth error: {flow.get('error_description')}")
            print("\n" + flow["message"] + "\n")
            result = app.acquire_token_by_device_flow(flow)

    _save_token_cache(cache)

    if "access_token" not in result:
        sys.exit(f"Could not acquire token: {result.get('error_description', result)}")
    return result["access_token"]


def _graph_get(token: str, url: str, params: dict | None = None) -> dict:
    resp = requests.get(
        url,
        headers={"Authorization": f"Bearer {token}"},
        params=params or {},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


# ── Outlook email fetching ────────────────────────────────────────────────────


def _looks_like_invoice(subject: str, preview: str) -> bool:
    text = (subject + " " + preview).lower()
    return any(kw in text for kw in INVOICE_KEYWORDS)


def fetch_invoice_emails(token: str) -> list[dict]:
    """Return emails that have PDF attachments and look like invoices."""
    cutoff = (datetime.utcnow() - timedelta(days=DAYS_BACK)).strftime(
        "%Y-%m-%dT00:00:00Z"
    )
    print(f"\nSearching the last {DAYS_BACK} days for invoice emails...")
    found: list[dict] = []

    for folder_name in SEARCH_FOLDERS:
        folder_data = _graph_get(
            token,
            f"{GRAPH_BASE}/me/mailFolders",
            params={"$filter": f"displayName eq '{folder_name}'"},
        )
        folders = folder_data.get("value", [])
        if not folders:
            print(f"  Folder '{folder_name}' not found — skipping.")
            continue

        folder_id = folders[0]["id"]
        url: str | None = f"{GRAPH_BASE}/me/mailFolders/{folder_id}/messages"
        params: dict = {
            "$filter": f"hasAttachments eq true and receivedDateTime ge {cutoff}",
            "$select": "id,subject,receivedDateTime,from,bodyPreview",
            "$top": 100,
            "$orderby": "receivedDateTime desc",
        }

        while url:
            page = _graph_get(token, url, params)
            for msg in page.get("value", []):
                if _looks_like_invoice(msg["subject"], msg.get("bodyPreview", "")):
                    found.append(msg)
            url = page.get("@odata.nextLink")
            params = {}

        print(f"  '{folder_name}': {len(found)} potential invoice email(s)")

    return found


def download_pdf_attachments(token: str, message_id: str) -> list[tuple[str, bytes]]:
    """Return (filename, bytes) pairs for every PDF attached to the message."""
    data = _graph_get(token, f"{GRAPH_BASE}/me/messages/{message_id}/attachments")
    pdfs = []
    for att in data.get("value", []):
        name: str = att.get("name", "")
        if name.lower().endswith(".pdf") and att.get("contentBytes"):
            pdfs.append((name, base64.b64decode(att["contentBytes"])))
    return pdfs


# ── Claude AI analysis ────────────────────────────────────────────────────────

_EXTRACTION_PROMPT = """You are an expert accounts-payable analyst.
Extract every piece of invoice data from the attached PDF document.

Return a single JSON object with EXACTLY these fields (use null for anything absent):

{
  "invoice_number": "string or null",
  "vendor_name": "string or null",
  "vendor_address": "string or null",
  "vendor_email": "string or null",
  "bill_to": "string or null",
  "invoice_date": "YYYY-MM-DD or null",
  "due_date": "YYYY-MM-DD or null",
  "currency": "ISO-4217 code e.g. USD GBP EUR AED or null",
  "subtotal": number_or_null,
  "tax_amount": number_or_null,
  "discount": number_or_null,
  "total_amount": number_or_null,
  "amount_paid": number_or_null,
  "amount_due": number_or_null,
  "payment_terms": "string or null",
  "po_number": "string or null",
  "line_items": [
    {
      "description": "string",
      "quantity": number_or_null,
      "unit_price": number_or_null,
      "amount": number_or_null
    }
  ],
  "notes": "string or null",
  "confidence": "high | medium | low"
}

Return ONLY the raw JSON object — no markdown fences, no explanation."""


def analyze_invoice_pdf(client: anthropic.Anthropic, pdf_bytes: bytes, filename: str) -> dict:
    """Send a PDF to Claude and return structured invoice data."""
    pdf_b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")

    message = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_b64,
                        },
                        "cache_control": {"type": "ephemeral"},
                    },
                    {"type": "text", "text": _EXTRACTION_PROMPT},
                ],
            }
        ],
    )

    raw = message.content[0].text.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        data = {"parse_error": raw[:500], "confidence": "low"}

    data["source_file"] = filename
    return data


# ── Excel report helpers ──────────────────────────────────────────────────────

_DARK = "1A1A2E"
_MID = "16213E"
_ACCENT = "E94560"
_ALT = "F7F7F7"

_H_FONT = Font(color="FFFFFF", bold=True, size=11)
_BOLD = Font(bold=True)
_H_ALIGN = Alignment(horizontal="center", vertical="center", wrap_text=True)
_C_ALIGN = Alignment(horizontal="center", vertical="center")
_L_ALIGN = Alignment(vertical="center", wrap_text=True)
_MONEY_FMT = "#,##0.00"
_thin = Side(style="thin", color="CCCCCC")
_BORDER = Border(left=_thin, right=_thin, top=_thin, bottom=_thin)


def _hcell(ws, row: int, col: int, value) -> None:
    c = ws.cell(row=row, column=col, value=value)
    c.font = _H_FONT
    c.fill = PatternFill("solid", fgColor=_DARK)
    c.alignment = _H_ALIGN
    c.border = _BORDER


def _dcell(ws, row: int, col: int, value, alt: bool = False) -> None:
    c = ws.cell(row=row, column=col, value=value)
    c.alignment = _L_ALIGN
    c.border = _BORDER
    if alt:
        c.fill = PatternFill("solid", fgColor=_ALT)


def _mcell(ws, row: int, col: int, value, alt: bool = False) -> None:
    """Money cell — right-aligned number with currency format."""
    if value is None:
        c = ws.cell(row=row, column=col, value="—")
        c.alignment = _C_ALIGN
    else:
        c = ws.cell(row=row, column=col, value=float(value))
        c.number_format = _MONEY_FMT
        c.alignment = _C_ALIGN
    c.border = _BORDER
    if alt:
        c.fill = PatternFill("solid", fgColor=_ALT)


# ── Sheet writers ─────────────────────────────────────────────────────────────


def _summary_sheet(ws, invoices: list[dict]) -> None:
    ws.title = "Invoice Summary"
    ws.sheet_view.showGridLines = False
    ws.freeze_panes = "A3"

    ws.row_dimensions[1].height = 36
    ws.merge_cells(f"A1:N1")
    c = ws["A1"]
    c.value = f"Invoice Analysis Report  ·  {datetime.now():%d %b %Y %H:%M}"
    c.font = Font(color="FFFFFF", bold=True, size=14)
    c.fill = PatternFill("solid", fgColor=_DARK)
    c.alignment = Alignment(horizontal="center", vertical="center")

    headers = [
        "Source File", "Invoice #", "Vendor", "Invoice Date", "Due Date",
        "Currency", "Subtotal", "Tax", "Discount", "Total", "Amount Due",
        "Payment Terms", "PO Number", "Confidence",
    ]
    ws.row_dimensions[2].height = 28
    for col, h in enumerate(headers, 1):
        _hcell(ws, 2, col, h)

    money_cols = {7, 8, 9, 10, 11}
    for r, inv in enumerate(invoices, 3):
        alt = r % 2 == 0
        row_vals = [
            inv.get("source_file", ""),
            inv.get("invoice_number", ""),
            inv.get("vendor_name", ""),
            inv.get("invoice_date", ""),
            inv.get("due_date", ""),
            inv.get("currency", ""),
            inv.get("subtotal"),
            inv.get("tax_amount"),
            inv.get("discount"),
            inv.get("total_amount"),
            inv.get("amount_due"),
            inv.get("payment_terms", ""),
            inv.get("po_number", ""),
            (inv.get("confidence") or "").upper(),
        ]
        ws.row_dimensions[r].height = 20
        for col, val in enumerate(row_vals, 1):
            if col in money_cols:
                _mcell(ws, r, col, val, alt)
            else:
                _dcell(ws, r, col, val, alt)

    col_widths = [28, 16, 28, 14, 14, 10, 14, 12, 12, 14, 14, 18, 14, 12]
    for i, w in enumerate(col_widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

    # Totals row
    last_data_row = 2 + len(invoices)
    tr = last_data_row + 1
    ws.row_dimensions[tr].height = 24
    ws.merge_cells(f"A{tr}:{get_column_letter(6)}{tr}")
    c = ws[f"A{tr}"]
    c.value = "TOTALS"
    c.font = _H_FONT
    c.fill = PatternFill("solid", fgColor=_MID)
    c.alignment = Alignment(horizontal="right", vertical="center")

    for mc in money_cols:
        ltr = get_column_letter(mc)
        cell = ws.cell(row=tr, column=mc, value=f"=SUM({ltr}3:{ltr}{last_data_row})")
        cell.number_format = _MONEY_FMT
        cell.font = _H_FONT
        cell.fill = PatternFill("solid", fgColor=_MID)
        cell.alignment = _C_ALIGN
        cell.border = _BORDER


def _vendor_sheet(ws, invoices: list[dict]) -> None:
    ws.title = "By Vendor"
    ws.sheet_view.showGridLines = False
    ws.freeze_panes = "A3"

    vendor_stats: dict[str, dict] = {}
    for inv in invoices:
        vendor = (inv.get("vendor_name") or "Unknown").strip()
        if vendor not in vendor_stats:
            vendor_stats[vendor] = {"count": 0, "total": 0.0, "currency": inv.get("currency", "")}
        vendor_stats[vendor]["count"] += 1
        vendor_stats[vendor]["total"] += float(inv.get("total_amount") or 0)

    vendors = sorted(vendor_stats.items(), key=lambda x: x[1]["total"], reverse=True)

    ws.row_dimensions[1].height = 36
    ws.merge_cells("A1:D1")
    c = ws["A1"]
    c.value = "Spend by Vendor"
    c.font = Font(color="FFFFFF", bold=True, size=14)
    c.fill = PatternFill("solid", fgColor=_DARK)
    c.alignment = Alignment(horizontal="center", vertical="center")

    for col, h in enumerate(["Vendor", "Invoice Count", "Total Spend", "Currency"], 1):
        _hcell(ws, 2, col, h)
        ws.row_dimensions[2].height = 28

    for r, (vendor, s) in enumerate(vendors, 3):
        alt = r % 2 == 0
        _dcell(ws, r, 1, vendor, alt)
        c2 = ws.cell(row=r, column=2, value=s["count"])
        c2.alignment = _C_ALIGN
        c2.border = _BORDER
        if alt:
            c2.fill = PatternFill("solid", fgColor=_ALT)
        _mcell(ws, r, 3, s["total"], alt)
        c4 = ws.cell(row=r, column=4, value=s["currency"])
        c4.alignment = _C_ALIGN
        c4.border = _BORDER
        if alt:
            c4.fill = PatternFill("solid", fgColor=_ALT)
        ws.row_dimensions[r].height = 20

    for col, w in zip("ABCD", [36, 16, 18, 12]):
        ws.column_dimensions[col].width = w

    # Bar chart
    if vendors:
        chart = BarChart()
        chart.type = "col"
        chart.title = "Total Spend by Vendor"
        chart.y_axis.title = "Amount"
        chart.x_axis.title = "Vendor"
        chart.style = 10
        chart.height = 14
        chart.width = 24
        data_ref = Reference(ws, min_col=3, min_row=2, max_row=2 + len(vendors))
        cats_ref = Reference(ws, min_col=1, min_row=3, max_row=2 + len(vendors))
        chart.add_data(data_ref, titles_from_data=True)
        chart.set_categories(cats_ref)
        ws.add_chart(chart, "F2")


def _line_items_sheet(ws, invoices: list[dict]) -> None:
    ws.title = "Line Items"
    ws.sheet_view.showGridLines = False
    ws.freeze_panes = "A3"

    ws.row_dimensions[1].height = 36
    ws.merge_cells("A1:F1")
    c = ws["A1"]
    c.value = "Invoice Line Items"
    c.font = Font(color="FFFFFF", bold=True, size=14)
    c.fill = PatternFill("solid", fgColor=_DARK)
    c.alignment = Alignment(horizontal="center", vertical="center")

    for col, h in enumerate(["Invoice #", "Vendor", "Description", "Qty", "Unit Price", "Amount"], 1):
        _hcell(ws, 2, col, h)
        ws.row_dimensions[2].height = 28

    r = 3
    for inv in invoices:
        for item in inv.get("line_items") or []:
            alt = r % 2 == 0
            _dcell(ws, r, 1, inv.get("invoice_number", ""), alt)
            _dcell(ws, r, 2, inv.get("vendor_name", ""), alt)
            _dcell(ws, r, 3, item.get("description", ""), alt)
            qty = ws.cell(row=r, column=4, value=item.get("quantity"))
            qty.alignment = _C_ALIGN
            qty.border = _BORDER
            if alt:
                qty.fill = PatternFill("solid", fgColor=_ALT)
            _mcell(ws, r, 5, item.get("unit_price"), alt)
            _mcell(ws, r, 6, item.get("amount"), alt)
            ws.row_dimensions[r].height = 20
            r += 1

    for col, w in zip("ABCDEF", [16, 28, 48, 8, 14, 14]):
        ws.column_dimensions[col].width = w


def _raw_json_sheet(ws, invoices: list[dict]) -> None:
    ws.title = "Raw JSON"
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 24
    ws.column_dimensions["B"].width = 120

    ws.cell(row=1, column=1, value="Source File").font = _BOLD
    ws.cell(row=1, column=2, value="Extracted JSON").font = _BOLD

    for r, inv in enumerate(invoices, 2):
        ws.cell(row=r, column=1, value=inv.get("source_file", ""))
        c = ws.cell(row=r, column=2, value=json.dumps(inv, indent=2, default=str))
        c.alignment = Alignment(vertical="top", wrap_text=False)
        ws.row_dimensions[r].height = 20


# ── Report builder ────────────────────────────────────────────────────────────


def build_excel_report(invoices: list[dict], output_path: Path) -> None:
    wb = openpyxl.Workbook()
    wb.remove(wb.active)

    _summary_sheet(wb.create_sheet(), invoices)
    _vendor_sheet(wb.create_sheet(), invoices)
    _line_items_sheet(wb.create_sheet(), invoices)
    _raw_json_sheet(wb.create_sheet(), invoices)

    wb.save(output_path)
    print(f"\n  Saved → {output_path.resolve()}")


# ── Entry point ───────────────────────────────────────────────────────────────


def main() -> None:
    if not ANTHROPIC_API_KEY:
        sys.exit("Error: ANTHROPIC_API_KEY is not set in your .env file")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    pdf_dir = OUTPUT_DIR / "pdfs"
    pdf_dir.mkdir(exist_ok=True)

    print("=" * 60)
    print("  OUTLOOK INVOICE ANALYZER")
    print("=" * 60)

    print("\nAuthenticating with Microsoft Graph...")
    token = get_graph_token()
    print("  Authenticated.")

    emails = fetch_invoice_emails(token)
    if not emails:
        print("\nNo invoice emails found in the specified folders.")
        return

    ai_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    invoices: list[dict] = []
    pdf_count = 0

    print(f"\nAnalyzing invoices with Claude AI ({len(emails)} email(s))...")
    for email in emails:
        pdfs = download_pdf_attachments(token, email["id"])
        for filename, pdf_bytes in pdfs:
            pdf_count += 1
            short_subject = email["subject"][:55]
            print(f"\n  [{pdf_count}] {filename}")
            print(f"       From: {short_subject}")

            safe_name = re.sub(r"[^\w\-.]", "_", filename)
            (pdf_dir / safe_name).write_bytes(pdf_bytes)

            try:
                inv = analyze_invoice_pdf(ai_client, pdf_bytes, filename)
                inv["email_subject"] = email["subject"]
                inv["email_received"] = email.get("receivedDateTime", "")
                inv["sender_email"] = (
                    email.get("from", {}).get("emailAddress", {}).get("address", "")
                )
                invoices.append(inv)
                print(
                    f"       Vendor : {inv.get('vendor_name', 'Unknown')}\n"
                    f"       Total  : {inv.get('currency', '')} {inv.get('total_amount', '—')}\n"
                    f"       Conf.  : {inv.get('confidence', '?')}"
                )
            except Exception as exc:
                print(f"       ERROR  : {exc}")
                invoices.append(
                    {
                        "source_file": filename,
                        "parse_error": str(exc),
                        "confidence": "low",
                        "email_subject": email["subject"],
                    }
                )

    if not invoices:
        print("\nNo PDFs found in the matched emails.")
        return

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = OUTPUT_DIR / f"invoice_analysis_{ts}.xlsx"
    print(f"\nBuilding Excel report for {len(invoices)} invoice(s)...")
    build_excel_report(invoices, report_path)

    print()
    print("=" * 60)
    print(f"  Processed : {pdf_count} PDF(s) from {len(emails)} email(s)")
    print(f"  Report    : {report_path.resolve()}")
    print(f"  PDFs      : {pdf_dir.resolve()}")
    print("=" * 60)


if __name__ == "__main__":
    main()
