let flowData = {};
let currentStep = "start";
let stepHistory = [];

window.onload = function () {
  loadIntroAndBind();

  fetch('/flow')
    .then(res => res.json())
    .then(data => {
      flowData = data;
      console.log("✅ Flow loaded:", Object.keys(flowData));
    });

  document.getElementById("hearBtn").onclick = speakText;
  document.getElementById("restartBtn").onclick = restart;
  document.getElementById("backBtn").onclick = goBack;
  document.getElementById("calculateBtn").onclick = calculateDeadline;
};

function loadIntroAndBind() {
  const intro = document.getElementById("introContent");
  if (!intro) return;
  console.log("📥 Loading intro...");
  fetch(intro.dataset.md + '?_=' + new Date().getTime())
    .then(res => res.text())
    .then(md => {
      intro.innerHTML = marked.parse(md);
      const startBtn = document.getElementById("startBtn");
      if (startBtn) {
        console.log("✅ Binding start button after intro load");
        startBtn.onclick = () => {
          intro.classList.add("hidden");
          document.getElementById("faqBtn").classList.add("hidden");
          document.getElementById("questionBox").classList.remove("hidden");
          document.getElementById("navButtons").classList.remove("hidden");
          currentStep = "start";
          renderStep(currentStep);
        };
      } else {
        console.error("❌ Start button not found after intro markdown injection");
      }
    })
    .catch(err => {
      console.error("❌ Markdown fetch failed:", err);
      intro.innerHTML = "<p>Error al cargar la introducción.</p>";
    });
}

function restart() {
  window.location.href = window.location.href.split("?")[0];
}

function renderStep(step) {
  const stepData = flowData[step];
  if (!stepData) {
    console.error("❌ No step data found for", step);
    return;
  }

  console.log("➡️ Rendering step:", step, stepData);
  const questionBox = document.getElementById("questionBox");
  const outcomeBox = document.getElementById("outcomeBox");
  const hearingBox = document.getElementById("hearingDateBox");
  const questionText = document.getElementById("questionText");
  const outcomeText = document.getElementById("outcomeText");
  const heading = document.getElementById("pageHeading");

  document.getElementById("navButtons").classList.remove("hidden");
  heading.innerText = stepData.heading_es || "";

  if (stepData.special === "hearing_date") {
    questionBox.classList.add("hidden");
    outcomeBox.classList.add("hidden");
    hearingBox.classList.remove("hidden");
    document.getElementById("hearingPrompt").innerText = "¿Cuándo es su próxima audiencia?";


    const hearingMd = document.getElementById("hearingMarkdown");
hearingMd.innerHTML = "";
if (stepData.markdown) {
  fetch(stepData.markdown + "?_=" + new Date().getTime())
    .then(res => res.text())
    .then(md => {
      hearingMd.innerHTML = marked.parse(md);
    })
    .catch(err => {
      console.error("Error loading hearing markdown:", err);
    });
}

    return;
  }

  if (stepData.question_es) {
    questionBox.classList.remove("hidden");
    outcomeBox.classList.add("hidden");
    hearingBox.classList.add("hidden");
    questionText.innerText = stepData.question_es;


    const questionMd = document.getElementById("questionMarkdown");
questionMd.innerHTML = ""; // clear existing

if (stepData.markdown) {
  fetch(stepData.markdown + "?_=" + new Date().getTime())
    .then(res => res.text())
    .then(md => {
      questionMd.innerHTML = marked.parse(md);
      questionMd.querySelectorAll("a").forEach(a => a.setAttribute("target", "_blank"));
    })
    .catch(err => {
      console.error("Error loading question markdown:", err);
    });
}




    document.getElementById("yesBtn").onclick = () => goTo(stepData.yes);
    document.getElementById("noBtn").onclick = () => goTo(stepData.no);

    if (stepData["not sure"]) {
      document.getElementById("notSureBtn").classList.remove("hidden");
      document.getElementById("notSureBtn").onclick = () => goTo(stepData["not sure"]);
    } else {
      document.getElementById("notSureBtn").classList.add("hidden");
    }

    return;
  }

  questionBox.classList.add("hidden");
  hearingBox.classList.add("hidden");
  outcomeBox.classList.remove("hidden");

  const linkBtn = document.getElementById("outcomeLink");
  const nextBtn = document.getElementById("nextBtn");

  outcomeText.innerHTML = ""; // clear existing content

  if (stepData.markdown) {
    const url = stepData.markdown + "?_=" + new Date().getTime();
    console.log("📦 Fetching markdown for step:", url);
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Markdown fetch failed: " + res.status);
        return res.text();
      })
      .then(md => {
        console.log("✅ Markdown loaded for step:", step);
        outcomeText.innerHTML = marked.parse(md);
        outcomeText.querySelectorAll("a").forEach(a => a.setAttribute("target", "_blank"));
      })
      .catch(err => {
        console.error("❌ Error loading markdown:", err);
        outcomeText.innerHTML = "<p>❌ No se pudo cargar el contenido.</p>";
      });
  } else if (stepData.outcome_es) {
    console.log("📄 Showing fallback text outcome");
    outcomeText.textContent = stepData.outcome_es;
  } else {
    outcomeText.innerHTML = "<p>⚠️ Sin contenido disponible.</p>";
  }

  if (stepData.link) {
    linkBtn.href = stepData.link;
    linkBtn.innerText = stepData.link_label_es || "🔗 Buscar su información";
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
    restart();
  }
}

function speakText() {
  let text = "";

  // Try to read question text first
  const question = document.getElementById("questionBox");
  if (!question.classList.contains("hidden")) {
    text = document.getElementById("questionText").innerText;

    // Also read explanation markdown if present
    const md = document.getElementById("outcomeText");
    if (md && md.innerText.trim()) {
      text += " " + md.innerText.trim();
    }
  }

  // If it's an outcome step
  const outcome = document.getElementById("outcomeBox");
  if (!text && !outcome.classList.contains("hidden")) {
    text = document.getElementById("outcomeText").innerText;
  }

  // If it's the hearing date input page
  const hearing = document.getElementById("hearingDateBox");
  if (!text && !hearing.classList.contains("hidden")) {
    text = document.getElementById("hearingPrompt").innerText;
    const hearingMd = document.getElementById("hearingMarkdown");
    if (hearingMd && hearingMd.innerText.trim()) {
      text += " " + hearingMd.innerText.trim();
    }
  }

  // Speak it
  if (text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    speechSynthesis.speak(utterance);
  } else {
    console.warn("No visible text to read.");
  }
}

function addDays(startDate, days) {
  let date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date;
}

function calculateDeadline() {
  const input = document.getElementById('hearingDate').value;
  const resultBox = document.getElementById('hearingResult');
  resultBox.innerHTML = "";

  if (!input) {
    resultBox.innerHTML = "<p>⚠️ Por favor ingrese una fecha de audiencia.</p>";
    return;
  }

  const today = new Date();
  const hearingDate = new Date(input);
  const cutoff = addDays(today, 15);

  const resultText = document.createElement("p");
  const actionBtn = document.createElement("button");

  if (hearingDate < today) {
    resultText.innerText = "⚠️ Su fecha de corte ya pasó. ¿Desea presentar una moción para reabrir?";
    actionBtn.innerText = "Moción para reabrir";
    actionBtn.onclick = () => window.open("https://www.justice.gov/eoir/eoir-policy-manual/part-i-7", "_blank");
  } else if (hearingDate <= cutoff) {
    resultText.innerText = "⏳ Su audiencia es pronto, y ha perdido el plazo para presentarse por video.";
    actionBtn.innerText = "Recursos para representar a sí mismo";
    actionBtn.onclick = () => window.open("https://www.justice.gov/eoir/self-help-resources", "_blank");
  } else {
    resultText.innerText = "✅ Su audiencia se acerca, y aún tiene tiempo para pedir presentarse por video.";
    actionBtn.innerText = "Cambiar su audiencia a formato por video";
    actionBtn.onclick = () => window.open("https://esperanza.github.io/audiencia-video.html", "_blank");
  }

  resultBox.appendChild(resultText);
  resultBox.appendChild(actionBtn);
}