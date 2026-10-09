// TIMER LOGIC 

const Timer = {
  totalSeconds: 30,
  remaining: 30,
  isRunning: false,
  intervalId: null,

  setTime(seconds) {
    this.totalSeconds = seconds;
    this.remaining = seconds;
    this.isRunning = false;
    clearInterval(this.intervalId);
  },

start() {
  if (this.isRunning || this.remaining <= 0) return;
  this.isRunning = true;

  this.intervalId = setInterval(() => {
    this.remaining--;

    onTick(this.remaining);

    if (this.remaining <= 0) {
      this.pause();   
      onTimerEnd();
    }
  }, 1000);
},

  pause() {
    this.isRunning = false;
    clearInterval(this.intervalId);
  },

  reset() {
    this.pause();
    this.remaining = this.totalSeconds;
  },

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }
};

// UI UPDATES

const display = document.getElementById("timerDisplay");
const statusEl = document.getElementById("status");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const presetBtns = document.querySelectorAll(".preset-btn");
const setCustomBtn = document.getElementById("setCustomBtn");
const customMin = document.getElementById("customMinutes");
const customSec = document.getElementById("customSeconds");

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateDisplay(seconds) {
  display.textContent = formatTime(seconds);

  if (seconds <= 10 && seconds > 0) {
    display.classList.add("ending");
  } else {
    display.classList.remove("ending");
  }
}

function updateStatus(text) {
  statusEl.textContent = text;
}

function updateStartPauseButton() {
  if (Timer.isRunning) {
    startPauseBtn.textContent = "Pause";
  } else {
    startPauseBtn.textContent = "Start";
  }
}

function onTick(remaining) {
  updateDisplay(remaining);
}

function onTimerEnd() {
  updateDisplay(0);
  updateStatus("Time's up!");
  updateStartPauseButton();
  document.body.classList.add("finished");
  playAlarm();
}

function playAlarm() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  ctx.resume().then(() => {
    const playTone = (freq, delay) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }, delay);
    };

    playTone(880, 0);     
    playTone(880, 350);  
    playTone(988, 700);    
  });
} 
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  audioCtx.resume().then(() => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);

    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.frequency.value = 1000;
      gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.5);
    }, 400);
  });

// EVENT LISTENERS

function setNewTime(seconds) {
  Timer.setTime(seconds);
  updateDisplay(seconds);
  updateStatus("Ready");
  updateStartPauseButton();
  document.body.classList.remove("finished");
  display.classList.remove("ending");

// Highlight active preset
  presetBtns.forEach(btn => {
    btn.classList.toggle("active", Number(btn.dataset.seconds) === seconds);
  });
}

// Preset buttons
presetBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const seconds = Number(btn.dataset.seconds);
    setNewTime(seconds);
  });
});

// Custom time
setCustomBtn.addEventListener("click", () => {
  const mins = Number(customMin.value) || 0;
  const secs = Number(customSec.value) || 0;
  const total = mins * 60 + secs;

  if (total > 0) {
    setNewTime(total);
    customMin.value = "";
    customSec.value = "";
  }
});

// Start / Pause
startPauseBtn.addEventListener("click", () => {
  Timer.toggle();
  updateStartPauseButton();
  updateStatus(Timer.isRunning ? "Running..." : "Paused");
});

// Reset
resetBtn.addEventListener("click", () => {
  Timer.reset();
  updateDisplay(Timer.remaining);
  updateStatus("Ready");
  updateStartPauseButton();
  document.body.classList.remove("finished");
  display.classList.remove("ending");
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;

  if (e.code === "Space") {
    e.preventDefault();
    Timer.toggle();
    updateStartPauseButton();
    updateStatus(Timer.isRunning ? "Running..." : "Paused");
  }

  if (e.code === "KeyR") {
    Timer.reset();
    updateDisplay(Timer.remaining);
    updateStatus("Ready");
    updateStartPauseButton();
    document.body.classList.remove("finished");
    display.classList.remove("ending");
  }
});
setNewTime(30);