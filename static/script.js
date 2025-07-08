let flowData = {};
let currentStep = "start";
let stepHistory = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("questionBox").classList.add("hidden");
  document.getElementById("outcomeBox").classList.add("hidden");
  document.getElementById("hearingDateBox").classList.add("hidden");
  document.getElementById("bottomButtons").classList.add("hidden");

  fetch('/flow')
    .then(res => res.json())
    .then(data => {
      flowData = data;
    });
});

function startFlow() {
  document.getElementById("introBox").classList.add("hidden");
  document.getElementById("bottomButtons").classList.remove("hidden");
  renderStep(currentStep);
}

function restart() {
  currentStep = "start";
  stepHistory = [];

  document.getElementById("questionBox").classList.add("hidden");
  document.getElementById("outcomeBox").classList.add("hidden");
  document.getElementById("hearingDateBox").classList.add("hidden");
  document.getElementById("bottomButtons").classList.add("hidden");

  document.getElementById("introBox").classList.remove("hidden");
}

function renderStep(step) {
  const lang = document.getElementById("languageToggle").value;
  const stepData = flowData[step];

  const questionBox = document.getElementById("questionBox");
  const outcomeBox = document.getElementById("outcomeBox");
  const hearingBox = document.getElementById("hearingDateBox");
  const questionText = document.getElementById("questionText");
  const outcomeText = document.getElementById("outcomeText");

  document.getElementById("bottomButtons").classList.remove("hidden");

  if (stepData.special === "hearing_date") {
    questionBox.classList.add("hidden");
    outcomeBox.classList.add("hidden");
    hearingBox.classList.remove("hidden");
    document.getElementById("hearingPrompt").innerText = lang === "es"
      ? "¿Cuándo es su próxima audiencia?"
      : "When is your next hearing?";
    return;
  }

  if (stepData.question) {
    questionBox.classList.remove("hidden");
    outcomeBox.classList.add("hidden");
    hearingBox.classList.add("hidden");

    questionText.innerText = lang === "es" ? stepData.question_es : stepData.question;
    document.getElementById("yesBtn").innerText = lang === "es" ? "Sí" : "Yes";
    document.getElementById("noBtn").innerText = lang === "es" ? "No" : "No";
    document.getElementById("notSureBtn").innerText = lang === "es" ? "No estoy seguro" : "Not sure";

    document.getElementById("yesBtn").onclick = () => goTo(stepData.yes);
    document.getElementById("noBtn").onclick = () => goTo(stepData.no);

    if (stepData["not sure"]) {
      document.getElementById("notSureBtn").classList.remove("hidden");
      document.getElementById("notSureBtn").onclick = () => goTo(stepData["not sure"]);
    } else {
      document.getElementById("notSureBtn").classList.add("hidden");
    }
  } else if (stepData.outcome) {
    questionBox.classList.add("hidden");
    outcomeBox.classList.remove("hidden");
    hearingBox.classList.add("hidden");

    outcomeText.innerText = lang === "es" ? stepData.outcome_es : stepData.outcome;

    const linkBtn = document.getElementById("outcomeLink");
const nextBtn = document.getElementById("nextBtn");
const customBtn = document.getElementById("customActionBtn");

// ✅ Handle custom asylum button
if (stepData.action) {
  customBtn.innerText = lang === "es" ? stepData.action.label_es : stepData.action.label_en;
  customBtn.onclick = () => window.open(stepData.action.link, "_blank");
  customBtn.classList.remove("hidden");
} else {
  customBtn.classList.add("hidden");
}

// ✅ Show link button ONLY if there's a link and no action
if (stepData.link && !stepData.action) {
  linkBtn.href = stepData.link;
  linkBtn.classList.remove("hidden");
} else {
  linkBtn.classList.add("hidden");
}

    if (stepData.next) {
      nextBtn.dataset.next = stepData.next;
      nextBtn.classList.remove("hidden");
      nextBtn.innerText = lang === "es" ? "Siguiente" : "Next";
    } else {
      nextBtn.dataset.next = "";
      nextBtn.classList.add("hidden");
    }
  }
}

function goTo(step) {
  stepHistory.push(currentStep);
  currentStep = step;
  renderStep(currentStep);
}

function goBack() {
  if (stepHistory.length > 0) {
    currentStep = stepHistory.pop();
    renderStep(currentStep);
  }
}

function goToNext() {
  const nextStep = document.getElementById("nextBtn").dataset.next;
  if (nextStep) {
    goTo(nextStep);
  }
}

function calculateDeadline() {
  const lang = document.getElementById("languageToggle").value;
  const input = document.getElementById('hearingDate').value;
  const resultBox = document.getElementById('hearingResult');
  resultBox.innerHTML = "";

  if (!input) {
    resultBox.innerText = lang === "es" ? "Por favor ingrese una fecha." : "Please enter a date.";
    return;
  }

  const today = new Date();
  const hearingDate = new Date(input);
  const resultText = document.createElement("p");
  const actionBtn = document.createElement("button");

  if (hearingDate < today) {
    resultText.innerText = lang === "es"
      ? "⚠️ Su fecha de corte ya pasó. ¿Desea presentar una moción para reabrir?"
      : "⚠️ Your court date has passed. Do you want to file a motion to reopen?";
    actionBtn.innerText = lang === "es" ? "Moción para reabrir" : "Motion to Reopen";
    actionBtn.onclick = () => window.open("https://www.justice.gov/eoir/eoir-policy-manual/part-i-7", "_blank");
  } else {
    const cutoff = addDays(today, 15);
    if (hearingDate <= cutoff) {
      resultText.innerText = lang === "es"
        ? "⏳ Su audiencia es pronto, y ha perdido el plazo para presentarse por video."
        : "⏳ Your court date is soon, and you've missed the window to appear via video.";
      actionBtn.innerText = lang === "es" ? "Recursos para representar a sí mismo" : "Pro Se Resources";
      actionBtn.onclick = () => window.open("https://www.justice.gov/eoir/self-help-resources", "_blank");
    } else {
      resultText.innerText = lang === "es"
        ? "✅ Su audiencia se acerca, y aún tiene tiempo para pedir presentarse por video."
        : "✅ Your court date is coming up, and you still have time to file a motion to appear via video.";
      actionBtn.innerText = lang === "es" ? "Moción para presentarse por video" : "Motion to Appear via Video";
      actionBtn.onclick = () => window.open("motion-to-appear-by-video.pdf", "_blank");
    }
  }

  resultBox.appendChild(resultText);
  resultBox.appendChild(actionBtn);
}

function addDays(startDate, days) {
  let date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date;
}

function translateUI() {
  const lang = document.getElementById("languageToggle").value;
  const introBox = document.getElementById("introBox");

  if (!introBox.classList.contains("hidden")) {
    introBox.querySelector("h1").innerText =
      lang === "es" ? "Herramienta de Información Migratoria" : "Immigration Info Tool";

    introBox.querySelector("p").innerText =
      lang === "es"
        ? "Esta herramienta le ayudará a entender su situación migratoria en los Estados Unidos y le dará información sobre posibles próximos pasos. No es asesoría legal, pero puede ayudarle a prepararse."
        : "This tool will help you understand your immigration situation in the U.S. and give you information about possible next steps. It is not legal advice, but it can help you prepare.";

    introBox.querySelector("a").innerText = lang === "es" ? "Preguntas frecuentes" : "FAQ";
    introBox.querySelector("button").innerText = lang === "es" ? "Continuar" : "Continue";
  } else {
    renderStep(currentStep);
  }

  document.getElementById("backBtn").innerText = lang === "es" ? "Atrás" : "Back";
  document.getElementById("hearBtn").innerText = lang === "es" ? "Escuchar" : "Listen";
  document.getElementById("restartBtn").innerText = lang === "es" ? "Empezar de nuevo" : "Start Over";
}

function speakText() {
  const lang = document.getElementById("languageToggle").value;
  let text = "";

  if (!document.getElementById("questionBox").classList.contains("hidden")) {
    text = document.getElementById("questionText").innerText;
  } else if (!document.getElementById("outcomeBox").classList.contains("hidden")) {
    text = document.getElementById("outcomeText").innerText;
  } else if (!document.getElementById("hearingDateBox").classList.contains("hidden")) {
    text = document.getElementById("hearingPrompt").innerText;
  } else if (!document.getElementById("introBox").classList.contains("hidden")) {
    text = lang === "es"
      ? "Esta herramienta le ayudará a entender su situación migratoria en los Estados Unidos y le dará información sobre posibles próximos pasos."
      : "This tool will help you understand your immigration situation in the United States and provide next steps.";
  }

  if (text && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "es" ? "es-ES" : "en-US";
    speechSynthesis.speak(utterance);
  } else {
    alert(lang === "es"
      ? "Tu navegador no soporta texto a voz."
      : "Your browser doesn't support text-to-speech.");
  }
}