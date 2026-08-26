const fields = ["name", "role", "email", "phone", "location", "summary", "education", "skills", "project"];
const templateButtons = document.querySelectorAll("[data-template]");
let selectedTemplate = "classic";

function text(id) { return document.getElementById(id).value.trim(); }
function escapeHTML(value) { const el = document.createElement("div"); el.textContent = value; return el.innerHTML; }

function updateScore() {
  const checks = [
    [text("name"), "Add your full name."], [text("role"), "Add the role you want."],
    [text("email") && text("phone"), "Add both email and phone."], [text("summary").length >= 80, "Write a stronger 2–3 line profile."],
    [text("education"), "Add your degree and graduation year."], [text("skills").split(",").filter(Boolean).length >= 3, "List at least three relevant skills."],
    [text("project").length >= 80, "Explain one project and the result."]
  ];
  const complete = checks.filter(([passed]) => passed).length;
  const score = Math.round((complete / checks.length) * 100);
  document.getElementById("resume-score").textContent = `${score}%`;
  document.getElementById("score-message").textContent = score >= 85 ? "Strong first draft. Proofread it and tailor it to each job." : "A few focused changes will make this stronger.";
  document.getElementById("score-tips").innerHTML = checks.filter(([passed]) => !passed).slice(0, 3).map(([, tip]) => `<li>${escapeHTML(tip)}</li>`).join("") || "<li>Looks complete. Keep every claim honest and relevant.</li>";
}

function updatePreview() {
  document.getElementById("preview-name").textContent = text("name") || "Your name";
  document.getElementById("preview-role").textContent = text("role") || "Your target role";
  document.getElementById("preview-contact").textContent = [text("location"), text("phone"), text("email")].filter(Boolean).join(" · ") || "Your contact details";
  ["summary", "education", "project"].forEach((field) => { document.getElementById(`preview-${field}`).textContent = text(field) || "Add your details here."; });
  const skills = text("skills").split(",").map(s => s.trim()).filter(Boolean);
  document.getElementById("preview-skills").innerHTML = skills.length ? skills.map(s => `<span>${escapeHTML(s)}</span>`).join("") : "<span>Add relevant skills</span>";
  document.getElementById("resume-paper").dataset.template = selectedTemplate;
  localStorage.setItem("resumeKitDraft", JSON.stringify({ ...Object.fromEntries(fields.map(id => [id, text(id)])), selectedTemplate }));
  updateScore();
}

function restoreDraft() {
  try { const draft = JSON.parse(localStorage.getItem("resumeKitDraft")); if (draft) { fields.forEach(id => { if (draft[id]) document.getElementById(id).value = draft[id]; }); selectedTemplate = draft.selectedTemplate || selectedTemplate; } } catch (_) { /* Keep the builder usable if a saved draft is broken. */ }
}

restoreDraft();
templateButtons.forEach(button => { button.classList.toggle("active", button.dataset.template === selectedTemplate); button.addEventListener("click", () => { selectedTemplate = button.dataset.template; templateButtons.forEach(item => item.classList.toggle("active", item === button)); updatePreview(); }); });
fields.forEach(id => document.getElementById(id).addEventListener("input", updatePreview));
document.getElementById("download").addEventListener("click", () => { document.title = `${text("name") || "resume"}-resume`; window.print(); });

document.getElementById("generate-letter").addEventListener("click", () => {
  const name = text("name") || "[Your name]";
  const role = text("job-title") || text("role") || "the advertised role";
  const company = text("company") || "your company";
  const skill = text("job-skill") || text("skills") || "the relevant skills";
  const project = text("project") || "my academic and personal projects";
  document.getElementById("letter-result").value = `Dear Hiring Team at ${company},\n\nI am writing to apply for the ${role} position. As a ${text("role") || "student and fresher"}, I am interested in contributing my skills in ${skill}.\n\nThrough ${project}, I have developed practical experience and learned to communicate, solve problems, and improve my work through feedback. I am eager to bring this mindset to ${company} and learn from your team.\n\nThank you for considering my application. I would welcome the opportunity to discuss how I can contribute.\n\nSincerely,\n${name}`;
});
document.getElementById("copy-letter").addEventListener("click", async () => { const output = document.getElementById("letter-result"); if (!output.value) return; await navigator.clipboard.writeText(output.value); document.getElementById("copy-letter").textContent = "Copied"; setTimeout(() => { document.getElementById("copy-letter").textContent = "Copy draft"; }, 1600); });

const ignoredWords = new Set(["and", "the", "for", "with", "that", "this", "you", "your", "are", "our", "from", "have", "will", "who", "but", "not", "all", "job", "role", "work", "team", "their", "about", "into", "using", "looking", "skills", "skill", "experience", "candidate", "intern", "internship", "years", "year", "able", "required", "responsibilities", "requirements"]);
function keywords(value) { return [...new Set((value.toLowerCase().match(/[a-z][a-z+#.-]{1,}/g) || []).filter(word => !ignoredWords.has(word)))]; }
document.getElementById("match-keywords").addEventListener("click", () => {
  const jobWords = keywords(text("job-description"));
  const resumeWords = new Set(keywords([text("role"), text("summary"), text("skills"), text("project")].join(" ")));
  const matched = jobWords.filter(word => resumeWords.has(word)).slice(0, 12);
  const missing = jobWords.filter(word => !resumeWords.has(word)).slice(0, 12);
  const result = document.getElementById("match-result");
  if (!jobWords.length) { result.innerHTML = "<p>Add a job description first.</p>"; return; }
  result.innerHTML = `<p><strong>${matched.length} relevant terms found.</strong> Add a missing term only when it truthfully describes your skills or project work.</p><div class="match-columns"><div><h3>Already in your resume</h3><p>${matched.length ? matched.map(escapeHTML).join(" · ") : "No clear matches yet."}</p></div><div><h3>Consider if true</h3><p>${missing.length ? missing.map(escapeHTML).join(" · ") : "Great coverage for this description."}</p></div></div>`;
});

async function shareSite() {
  const shareData = { title: "ResuKite — Free Fresher Resume Builder", text: "Build a free ATS-friendly resume for internships and first jobs.", url: "https://resukite.github.io/" };
  if (navigator.share) { try { await navigator.share(shareData); return; } catch (_) { /* A cancelled share should not show an error. */ } }
  await navigator.clipboard.writeText(shareData.url);
  document.getElementById("share-site").textContent = "Link copied";
  setTimeout(() => { document.getElementById("share-site").innerHTML = "Share ResuKite <span>↗</span>"; }, 1600);
}
document.getElementById("share-site").addEventListener("click", shareSite);
document.getElementById("copy-site-link").addEventListener("click", async () => { await navigator.clipboard.writeText("https://resukite.github.io/"); const button = document.getElementById("copy-site-link"); button.textContent = "Copied"; setTimeout(() => { button.textContent = "Copy site link"; }, 1600); });
updatePreview();
