const stageNameInput = document.getElementById("stageName");
const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");
const newTimerBtn = document.getElementById("newTimerBtn");
const timerList = document.getElementById("timerList");

let timers = [];

newTimerBtn.addEventListener("click", function() {
  const stageName = stageNameInput.value.trim();
  const minutes = Number(minutesInput.value);
  const seconds = Number(secondsInput.value);

  if (stageName === "") {
    alert("ステージ名を入力してください");
    return;
  }

  if (minutes < 0 || seconds < 0) {
    alert("時間は0以上で入力してください");
    return;
  }

  if (minutes === 0 && seconds === 0) {
    alert("時間を入力してください");
    return;
  }

  if (seconds >= 60) {
    alert("秒は0〜59で入力してください");
    return;
  }

  const totalSeconds = minutes * 60 + seconds;

  const timer = {
    id: Date.now(),
    stageName: stageName,
    totalSeconds: totalSeconds,
    remainingSeconds: totalSeconds,
    isRunning: false,
    endTime: null
  };

  timers.push(timer);

  saveTimers();
  renderTimers();

  stageNameInput.value = "";
  minutesInput.value = "";
  secondsInput.value = "";
});

function renderTimers() {
  updateTimers();

  timerList.innerHTML = "";

  timers.forEach(function(timer) {
    const timerCard = document.createElement("div");
    timerCard.className = "timer-card";

    if (timer.remainingSeconds === 0) {
      timerCard.classList.add("done");
    }

    timerCard.innerHTML = `
      <h2>${escapeHtml(timer.stageName)}</h2>
      <p class="time">${formatTime(timer.remainingSeconds)}</p>
      <p class="status">${getStatus(timer)}</p>

      <button onclick="startTimer(${timer.id})" class="startBtn">Start</button>
      <button onclick="resetTimer(${timer.id})" class="resetBtn">Reset</button>
      <button onclick="deleteTimer(${timer.id})" class="deleteBtn">Delete</button>
    `;

    timerList.appendChild(timerCard);
  });
}

function startTimer(id) {
  const timer = timers.find(function(timer) {
    return timer.id === id;
  });

  if (!timer) {
    return;
  }

  if (timer.isRunning) {
    return;
  }

  if (timer.remainingSeconds === 0) {
    return;
  }

  timer.isRunning = true;
  timer.endTime = Date.now() + timer.remainingSeconds * 1000;

  saveTimers();
  renderTimers();
}

function resetTimer(id) {
  const timer = timers.find(function(timer) {
    return timer.id === id;
  });

  if (!timer) {
    return;
  }

  timer.remainingSeconds = timer.totalSeconds;
  timer.isRunning = false;
  timer.endTime = null;

  saveTimers();
  renderTimers();
}

function deleteTimer(id) {
  timers = timers.filter(function(timer) {
    return timer.id !== id;
  });

  saveTimers();
  renderTimers();
}

function updateTimers() {
  const now = Date.now();

  timers.forEach(function(timer) {
    if (!timer.isRunning) {
      return;
    }

    const remaining = Math.ceil((timer.endTime - now) / 1000);

    if (remaining <= 0) {
      timer.remainingSeconds = 0;
      timer.isRunning = false;
      timer.endTime = null;
    } else {
      timer.remainingSeconds = remaining;
    }
  });

  saveTimers();
}

function getStatus(timer) {
  if (timer.remainingSeconds === 0) {
    return "ドロップ可能！";
  }

  if (timer.isRunning) {
    return "カウント中";
  }

  return "待機中";
}

function saveTimers() {
  localStorage.setItem("dropTimers", JSON.stringify(timers));
}

function loadTimers() {
  const savedTimers = localStorage.getItem("dropTimers");

  if (savedTimers) {
    timers = JSON.parse(savedTimers);
  }
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const displayMinutes = String(minutes).padStart(2, "0");
  const displaySeconds = String(seconds).padStart(2, "0");

  return `${displayMinutes}:${displaySeconds}`;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadTimers();
renderTimers();

setInterval(function() {
  renderTimers();
}, 1000);