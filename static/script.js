let flowData = {};
let currentStep = "start";
let stepHistory = [];

window.onload = function () {
  fetch('/flow')
    .then(res => res.json())
    .then(data => {
      flowData = data;

      document.getElementById("startBtn").onclick = () => {
        document.getElementById("introBox").classList.add("hidden");
        document.getElementById("faqBtn").classList.add("hidden"); // hide when starting
        document.getElementById("questionBox").classList.remove("hidden");
        document.getElementById("navButtons").classList.remove("hidden");
        renderStep(currentStep);
      };

      document.getElementById("hearBtn").onclick = speakText;
      document.getElementById("restartBtn").onclick = restart;
      document.getElementById("backBtn").onclick = goBack;
      document.getElementById("calculateBtn").onclick = calculateDeadline;
    });
};

function renderStep(step) {
  const lang = "es"; // Hardcoded to Spanish
  const stepData = flowData[step];
  if (!stepData) return;

  const questionBox = document.getElementById("questionBox");
  const outcomeBox = document.getElementById("outcomeBox");
  const hearingBox = document.getElementById("hearingDateBox");
  const questionText = document.getElementById("questionText");
  const outcomeText = document.getElementById("outcomeText");


  if (stepData.special === "hearing_date") {
    questionBox.classList.add("hidden");
    outcomeBox.classList.add("hidden");
    hearingBox.classList.remove("hidden");
    document.getElementById("hearingPrompt").innerText = "¿Cuándo es su próxima audiencia?";
    return;
  }

  if (stepData.question) {
    questionBox.classList.remove("hidden");
    outcomeBox.classList.add("hidden");
    hearingBox.classList.add("hidden");
    questionText.innerText = stepData.question_es;

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
    outcomeText.innerText = stepData.outcome_es;

    const linkBtn = document.getElementById("outcomeLink");
    const nextBtn = document.getElementById("nextBtn");

    if (stepData.link) {
      linkBtn.href = stepData.link;
      linkBtn.classList.remove("hidden");
    } else {
      linkBtn.classList.add("hidden");
    }

    if (stepData.next) {
      nextBtn.dataset.next = stepData.next;
      nextBtn.classList.remove("hidden");
      nextBtn.onclick = () => goTo(stepData.next);
    } else {
      nextBtn.dataset.next = "";
      nextBtn.classList.add("hidden");
    }
  }
}

function goTo(step) {
  if (!step) return;
  stepHistory.push(currentStep);
  currentStep = step;
  renderStep(currentStep);
}

function goBack() {
  if (stepHistory.length > 0) {
    currentStep = stepHistory.pop();
    renderStep(currentStep);
  } else {
    restart(); // If no history, reset to intro
  }
}

function restart() {
  currentStep = "start";
  stepHistory = [];

  document.getElementById("introBox").classList.remove("hidden");
  document.getElementById("faqBtn").classList.remove("hidden"); // hide when starting
  document.getElementById("questionBox").classList.add("hidden");
  document.getElementById("outcomeBox").classList.add("hidden");
  document.getElementById("hearingDateBox").classList.add("hidden");
  document.getElementById("navButtons").classList.add("hidden");
}

function speakText() {
  const text = document.getElementById("questionText").innerText;
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    speechSynthesis.speak(utterance);
  }
}

function calculateDeadline() {
  const lang = "es";
  const input = document.getElementById('hearingDate').value;
  const resultBox = document.getElementById('hearingResult');
  resultBox.innerHTML = "";

  if (!input) {
    resultBox.innerText = "Por favor ingrese una fecha.";
    return;
  }

  const today = new Date();
  const hearingDate = new Date(input);
  const resultText = document.createElement("p");
  const actionBtn = document.createElement("button");

  if (hearingDate < today) {
    resultText.innerText = "⚠️ Su fecha de corte ya pasó. ¿Desea presentar una moción para reabrir?";
    actionBtn.innerText = "Moción para reabrir";
    actionBtn.onclick = () => window.open("https://www.justice.gov/eoir/eoir-policy-manual/part-i-7", "_blank");
  } else {
    const cutoff = addDays(today, 15);
    if (hearingDate <= cutoff) {
      resultText.innerText = "⏳ Su audiencia es pronto, y ha perdido el plazo para presentarse por video.";
      actionBtn.innerText = "Recursos para representar a sí mismo";
      actionBtn.onclick = () => window.open("https://www.justice.gov/eoir/self-help-resources", "_blank");
    } else {
      resultText.innerText = "✅ Su audiencia se acerca, y aún tiene tiempo para pedir presentarse por video.";
      actionBtn.innerText = "Moción para presentarse por video";
      actionBtn.onclick = () => window.open("https://www.justice.gov/eoir/appear-telephonically-or-via-video", "_blank");
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
