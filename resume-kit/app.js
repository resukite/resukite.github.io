const fields = ["name", "role", "email", "phone", "location", "summary", "education", "skills", "project"];

function text(id) { return document.getElementById(id).value.trim(); }

function updatePreview() {
  document.getElementById("preview-name").textContent = text("name") || "Your name";
  document.getElementById("preview-role").textContent = text("role") || "Your target role";
  document.getElementById("preview-contact").textContent = [text("location"), text("phone"), text("email")].filter(Boolean).join(" · ") || "Your contact details";
  ["summary", "education", "project"].forEach((field) => {
    document.getElementById(`preview-${field}`).textContent = text(field) || "Add your details here.";
  });
  const skills = text("skills").split(",").map(s => s.trim()).filter(Boolean);
  document.getElementById("preview-skills").innerHTML = skills.length ? skills.map(s => `<span>${escapeHTML(s)}</span>`).join("") : "<span>Add relevant skills</span>";
  localStorage.setItem("resumeKitDraft", JSON.stringify(Object.fromEntries(fields.map(id => [id, text(id)]))));
}

function escapeHTML(value) { const el = document.createElement("div"); el.textContent = value; return el.innerHTML; }

function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem("resumeKitDraft"));
    if (draft) fields.forEach(id => { if (draft[id]) document.getElementById(id).value = draft[id]; });
  } catch (_) { /* A broken draft should never stop the builder. */ }
}

restoreDraft();
fields.forEach(id => document.getElementById(id).addEventListener("input", updatePreview));
document.getElementById("download").addEventListener("click", () => {
  document.title = `${text("name") || "resume"}-resume`;
  window.print();
});
updatePreview();
