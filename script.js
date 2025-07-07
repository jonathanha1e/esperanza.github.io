let flowData = {};
let currentStep = "start";
let stepHistory = [];

fetch('flow.json')
  .then(res => res.json())
  .then(data => {
    flowData = data;
    renderStep(currentStep);
  });

function renderStep(step) {
  const lang = document.getElementById("languageToggle").value;
  const stepData = flowData[step];
  const questionBox = document.getElementById("questionBox");
  const outcomeBox = document.getElementById("outcomeBox");
  const hearingBox = document.getElementById("hearingDateBox");
  const questionText = document.getElementById("questionText");
  const outcomeText = document.getElementById("outcomeText");

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

    if (stepData.link) {
      linkBtn.href = stepData.link;
      linkBtn.classList.remove("hidden");
    } else {
      linkBtn.classList.add("hidden");
    }

    if (stepData.next) {
      nextBtn.dataset.next = stepData.next;
      nextBtn.classList.remove("hidden");
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

function restart() {
  currentStep = "start";
  stepHistory = [];
  renderStep(currentStep);
}

function speakText() {
  const text = document.getElementById("questionText").innerText;
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  } else {
    alert("Sorry, your browser doesn't support text-to-speech.");
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