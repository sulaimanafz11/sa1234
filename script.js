// RIHLA waitlist handler.
// Replace FORM_ENDPOINT with a Formspree/Getform/your own endpoint to collect
// submissions by email. Until then, entries are stored in localStorage so the
// page works end-to-end for demos.
const FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxxx"

const form = document.getElementById("waitlist-form");
const success = document.getElementById("waitlist-success");

function saveLocally(entry) {
  try {
    const key = "rihla:waitlist";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.push({ ...entry, at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list));
  } catch (_) {
    /* storage unavailable — fine for a landing page */
  }
}

async function submit(event) {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form).entries());
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Reserving…";

  try {
    if (FORM_ENDPOINT) {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error("Submission failed");
    }
    saveLocally(data);

    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Reserve my place";
    alert("Something went wrong. Please try again in a moment.");
  }
}

form.addEventListener("submit", submit);

// Smooth scroll for in-page nav links.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
