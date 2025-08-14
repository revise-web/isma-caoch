// ====================== DONNÉES DU PROGRAMME ======================
// Plan basé sur tes réponses (muscle + abdos + bras)
const trainingPlan = {
    lundi: ["Pompes x15", "Corde à sauter 2min", "Curl haltères 3kg x12", "Gainage 30s"],
    mardi: ["Squats x20", "Pompes triceps x12", "Abdos crunch x20", "Planche latérale 20s"],
    mercredi: ["Pompes inclinées x15", "Corde à sauter 3min", "Curl haltères 3kg x15", "Mountain climbers 20s"],
    jeudi: ["Squats sautés x15", "Pompes serrées x12", "Abdos vélo x20", "Gainage 40s"],
    vendredi: ["Pompes écartées x15", "Corde à sauter 2min", "Curl haltères 3kg x12", "Planche latérale 25s"],
    samedi: ["Squats x25", "Pompes triceps x12", "Abdos crunch x25", "Mountain climbers 30s"],
    dimanche: ["Repos actif : marche / étirements 15min"]
};

// ====================== VARIABLES ======================
const daySelect = document.getElementById("day-select");
const exerciseList = document.getElementById("exercise-list");
const resetBtn = document.getElementById("reset-day");
const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-timer");
const stopBtn = document.getElementById("stop-timer");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

let timerInterval = null;
let timeLeft = 0;

// ====================== INIT ======================
function init() {
    // Remplir la liste des jours
    Object.keys(trainingPlan).forEach(day => {
        const opt = document.createElement("option");
        opt.value = day;
        opt.textContent = day.charAt(0).toUpperCase() + day.slice(1);
        daySelect.appendChild(opt);
    });

    // Sélectionne le jour actuel automatiquement
    const today = new Date().toLocaleDateString("fr-FR", { weekday: "long" });
    if (trainingPlan[today]) {
        daySelect.value = today;
    } else {
        daySelect.value = "lundi";
    }

    loadExercises(daySelect.value);
}

// ====================== AFFICHER LES EXERCICES ======================
function loadExercises(day) {
    exerciseList.innerHTML = "";
    const exercises = trainingPlan[day] || [];

    exercises.forEach((ex, idx) => {
        const item = document.createElement("label");
        item.className = "checkbox-item";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = localStorage.getItem(`${day}-${idx}`) === "true";
        input.addEventListener("change", () => {
            localStorage.setItem(`${day}-${idx}`, input.checked);
            updateProgress();
        });

        const span = document.createElement("span");
        span.textContent = ex;

        item.appendChild(input);
        item.appendChild(span);
        exerciseList.appendChild(item);
    });

    updateProgress();
}

// ====================== PROGRESSION ======================
function updateProgress() {
    const checkboxes = exerciseList.querySelectorAll("input[type='checkbox']");
    const total = checkboxes.length;
    const done = [...checkboxes].filter(c => c.checked).length;

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    progressFill.style.width = percent + "%";
    progressText.textContent = `${percent}% complété`;
}

// ====================== RESET JOURNÉE ======================
resetBtn.addEventListener("click", () => {
    const day = daySelect.value;
    const checkboxes = exerciseList.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((c, idx) => {
        c.checked = false;
        localStorage.removeItem(`${day}-${idx}`);
    });
    updateProgress();
});

// ====================== TIMER ======================
function startTimer(duration) {
    timeLeft = duration;
    updateTimerDisplay();

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("⏱ Temps écoulé !");
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

startBtn.addEventListener("click", () => {
    const minutes = prompt("Combien de minutes ?");
    if (minutes && !isNaN(minutes)) {
        startTimer(parseInt(minutes) * 60);
    }
});

stopBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
});

// ====================== ÉVÉNEMENTS ======================
daySelect.addEventListener("change", () => {
    loadExercises(daySelect.value);
});

// Lancer l'app
init();
