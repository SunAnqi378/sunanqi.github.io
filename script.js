document.addEventListener("DOMContentLoaded", () => {
  const boardEl = document.querySelector("#board");
  const messageEl = document.querySelector("#message");
  const resetBtn = document.querySelector("#resetBtn");
  const undoBtn = document.querySelector("#undoBtn");
  const hintBtn = document.querySelector("#hintBtn");
  const soundBtn = document.querySelector("#soundBtn");
  const autoBtn = document.querySelector("#autoBtn");
  const levelSelect = document.querySelector("#level");
  const moveInfoEl = document.querySelector("#moveInfo");
  const minInfoEl = document.querySelector("#minInfo");
  const winPanel = document.querySelector("#winPanel");
  const playAgainBtn = document.querySelector("#playAgainBtn");

  const BOARD_WIDTH = 900;
  const BOARD_HEIGHT = 430;
  const DISK_HEIGHT = 32;
  const DISK_GAP = 34;
  const FIRST_LEVEL_BOTTOM = 72;
  const PEG_NAMES = ["A", "B", "C"];
  const PEG_CENTERS = {
    A: 180,
    B: 450,
    C: 720
  };
  const SNAP_RADIUS = 135;
const MIN_DISKS = 3;
const MAX_DISKS = 8;

const MIN_DISK_WIDTH = 96;
const MAX_DISK_WIDTH = 252;

  const game = {
    diskCount: 5,
    pegs: {
      A: [],
      B: [],
      C: []
    },
    moves: 0,
    history: [],
    isWin: false,
    isSolving: false,
    soundEnabled: false,
    audioContext: null,
    dragging: null
  };

  function clampDiskCount(count) {
    const n = Number(count);
    if (Number.isNaN(n)) return 3;
    return Math.min(MAX_DISKS, Math.max(MIN_DISKS, n));
  }

  function createInitialPegs(count) {
    const pegs = {
      A: [],
      B: [],
      C: []
    };

    for (let disk = count; disk >= 1; disk -= 1) {
      pegs.A.push(disk);
    }

    return pegs;
  }

  function resetGame(count = game.diskCount) {
    game.diskCount = clampDiskCount(count);
    game.pegs = createInitialPegs(game.diskCount);
    game.moves = 0;
    game.history = [];
    game.isWin = false;
    game.isSolving = false;
    game.dragging = null;

    document.body.classList.remove("celebrate");
    boardEl.classList.remove("is-win");
    winPanel.classList.add("hidden");

    setControlsDisabled(false);
    showMessage("Drag the top disc and move all the discs to the right!", "normal");
    render();
  }

  function clonePegs() {
    return {
      A: game.pegs.A.slice(),
      B: game.pegs.B.slice(),
      C: game.pegs.C.slice()
    };
  }

  function saveHistory() {
    game.history.push({
      pegs: clonePegs(),
      moves: game.moves,
      isWin: game.isWin
    });
  }

  function restoreSnapshot(snapshot) {
    game.pegs = {
      A: snapshot.pegs.A.slice(),
      B: snapshot.pegs.B.slice(),
      C: snapshot.pegs.C.slice()
    };
    game.moves = snapshot.moves;
    game.isWin = snapshot.isWin;
  }

  function getMinMoves() {
    return 2 ** game.diskCount - 1;
  }

  function getDiskWidth(size) {
  if (game.diskCount <= 1) {
    return MAX_DISK_WIDTH;
  }

  const step = (MAX_DISK_WIDTH - MIN_DISK_WIDTH) / (game.diskCount - 1);
  return Math.round(MIN_DISK_WIDTH + (size - 1) * step);
}

  function getDiskColor(size) {
    const colors = [
      "#ff595e",
      "#ffca3a",
      "#8ac926",
      "#1982c4",
      "#6a4c93",
      "#ff924c",
      "#4ecdc4",
      "#f15bb5",
      "#00bbf9",
      "#9b5de5"
    ];
    return colors[(size - 1) % colors.length];
  }

  function getDiskDarkColor(size) {
    const colors = [
      "#d93f45",
      "#d59d19",
      "#65a313",
      "#0f6093",
      "#4b3570",
      "#d66b2c",
      "#299c96",
      "#bd3f91",
      "#008dc2",
      "#6f3fa6"
    ];
    return colors[(size - 1) % colors.length];
  }

  function isTopDisk(pegName, size) {
    const peg = game.pegs[pegName];
    return peg[peg.length - 1] === size;
  }

  function canMove(fromPeg, toPeg) {
    if (fromPeg === toPeg) return false;

    const from = game.pegs[fromPeg];
    const to = game.pegs[toPeg];

    if (from.length === 0) return false;

    const movingDisk = from[from.length - 1];
    const targetTopDisk = to.length > 0 ? to[to.length - 1] : null;

    if (targetTopDisk !== null && movingDisk > targetTopDisk) {
      return false;
    }

    return true;
  }

  function render() {
    document.querySelectorAll(".disk").forEach((disk) => {
      disk.remove();
    });

    PEG_NAMES.forEach((pegName) => {
      const peg = game.pegs[pegName];

      peg.forEach((size, level) => {
        const disk = document.createElement("button");
        const width = getDiskWidth(size);
        const left = PEG_CENTERS[pegName] - width / 2;
        const bottom = FIRST_LEVEL_BOTTOM + level * DISK_GAP;

        disk.type = "button";
        disk.className = "disk";
        disk.textContent = size;
        disk.dataset.size = String(size);
        disk.dataset.peg = pegName;
        disk.style.width = `${width}px`;
        disk.style.left = `${left}px`;
        disk.style.bottom = `${bottom}px`;
        disk.style.setProperty("--disk-color", getDiskColor(size));
        disk.style.setProperty("--disk-dark", getDiskDarkColor(size));

        if (isTopDisk(pegName, size)) {
          disk.classList.add("top");
          disk.title = "You can drag me!";
        } else {
          disk.classList.add("locked");
          disk.title = "Only the top disc can move.";
        }

        disk.addEventListener("pointerdown", startDrag);
        boardEl.appendChild(disk);
      });
    });

    updateInfo();
  }

  function getMoveWord(count) {
    return count === 1 ? "move" : "moves";
  }

  function updateInfo() {
    moveInfoEl.textContent = `You have made ${game.moves} ${getMoveWord(game.moves)}. Keep going!`;
    minInfoEl.textContent = `Minimum: ${getMinMoves()} ${getMoveWord(getMinMoves())}`;
    undoBtn.disabled = game.isSolving || game.history.length === 0;
  }

  function showMessage(text, type = "normal") {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
  }

  function shakeElement(el) {
    if (!el) return;

    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");

    setTimeout(() => {
      el.classList.remove("shake");
    }, 420);
  }

  function setControlsDisabled(disabled) {
    resetBtn.disabled = disabled;
    undoBtn.disabled = disabled || game.history.length === 0;
    hintBtn.disabled = disabled;
    autoBtn.disabled = disabled;
    levelSelect.disabled = disabled;
  }

  function getBoardPoint(event) {
    const rect = boardEl.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * BOARD_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * BOARD_HEIGHT
    };
  }

  function getTargetPeg(x) {
    for (const pegName of PEG_NAMES) {
      if (Math.abs(x - PEG_CENTERS[pegName]) <= SNAP_RADIUS) {
        return pegName;
      }
    }

    return null;
  }

  function startDrag(event) {
    if (game.isSolving || game.isWin) return;

    const diskEl = event.currentTarget;
    const size = Number(diskEl.dataset.size);
    const fromPeg = diskEl.dataset.peg;

    if (!isTopDisk(fromPeg, size)) {
      showMessage("Only the top disc can move!", "warning");
      shakeElement(diskEl);
      playSound("invalid");
      return;
    }

    event.preventDefault();

    const point = getBoardPoint(event);

    game.dragging = {
      diskEl,
      size,
      fromPeg,
      pointerId: event.pointerId
    };

    diskEl.classList.add("dragging");
    diskEl.setPointerCapture(event.pointerId);

    moveDraggedDisk(point.x, point.y);
    showMessage("You picked it up! Now drop it near another pole.", "normal");
    playSound("pick");
  }

  function moveDraggedDisk(x, y) {
    if (!game.dragging) return;

    const diskEl = game.dragging.diskEl;
    const width = diskEl.offsetWidth;

    diskEl.style.left = `${x - width / 2}px`;
    diskEl.style.bottom = `${BOARD_HEIGHT - y - DISK_HEIGHT / 2}px`;
  }

  function moveDrag(event) {
    if (!game.dragging) return;

    event.preventDefault();

    const point = getBoardPoint(event);
    moveDraggedDisk(point.x, point.y);
  }

  function endDrag(event) {
    if (!game.dragging) return;

    event.preventDefault();

    const point = getBoardPoint(event);
    const targetPeg = getTargetPeg(point.x);
    const { diskEl, fromPeg } = game.dragging;

    diskEl.classList.remove("dragging");

    if (targetPeg === null) {
      showMessage("Drop it close to a pole!", "warning");
      shakeElement(diskEl);
      playSound("invalid");

      setTimeout(() => {
        render();
      }, 350);

      game.dragging = null;
      return;
    }

    if (targetPeg === fromPeg) {
      showMessage("The disc went back to the same pole.", "normal");
      render();
      game.dragging = null;
      return;
    }

    if (!canMove(fromPeg, targetPeg)) {
      showMessage("A big disc cannot go on top of a small disc!", "warning");
      shakeElement(diskEl);
      playSound("invalid");

      setTimeout(() => {
        render();
      }, 350);

      game.dragging = null;
      return;
    }

    moveDisk(fromPeg, targetPeg, {
      save: true,
      sound: true,
      message: "Great move!"
    });

    game.dragging = null;
  }

  function moveDisk(fromPeg, toPeg, options = {}) {
    const {
      save = true,
      sound = true,
      message = "Nice move!"
    } = options;

    if (!canMove(fromPeg, toPeg)) {
      showMessage("That move is not allowed.", "warning");
      if (sound) playSound("invalid");
      render();
      return false;
    }

    if (save) {
      saveHistory();
    }

    const disk = game.pegs[fromPeg].pop();
    game.pegs[toPeg].push(disk);
    game.moves += 1;

    showMessage(message, "normal");

    if (sound) {
      playSound("place");
    }

    render();
    checkWin();

    return true;
  }

  function undoMove() {
    if (game.isSolving) return;

    if (game.history.length === 0) {
      showMessage("There is no move to undo yet.", "warning");
      playSound("invalid");
      return;
    }

    const snapshot = game.history.pop();
    restoreSnapshot(snapshot);

    document.body.classList.remove("celebrate");
    boardEl.classList.remove("is-win");
    winPanel.classList.add("hidden");

    showMessage("You went back one move.", "normal");
    playSound("undo");
    render();
  }

  function showHint() {
    if (game.isSolving) return;

    if (game.isWin) {
      showMessage("You have already finished. Brilliant!", "success");
      return;
    }

    const legalMoves = [];

    PEG_NAMES.forEach((fromPeg) => {
      PEG_NAMES.forEach((toPeg) => {
        if (canMove(fromPeg, toPeg)) {
          const disk = game.pegs[fromPeg][game.pegs[fromPeg].length - 1];
          legalMoves.push({
            disk,
            fromPeg,
            toPeg
          });
        }
      });
    });

    if (legalMoves.length === 0) {
      showMessage("There are no moves right now. Try starting again.", "warning");
      return;
    }

    legalMoves.sort((a, b) => a.disk - b.disk);
    const hint = legalMoves[0];

    showMessage(
      `Hint: try moving disc ${hint.disk} from ${hint.fromPeg} to ${hint.toPeg}.`,
      "normal"
    );
  }

  function checkWin() {
    if (game.pegs.C.length !== game.diskCount) return false;

    game.isWin = true;
    boardEl.classList.add("is-win");
    document.body.classList.add("celebrate");
    winPanel.classList.remove("hidden");

    showMessage(
      `Brilliant! You finished the Tower of Hanoi in ${game.moves} ${getMoveWord(game.moves)}!`,
      "success"
    );
    playSound("win");
    createConfetti();

    return true;
  }

  function createConfetti() {
    document.querySelectorAll(".confetti").forEach((item) => item.remove());

    for (let i = 0; i < 36; i += 1) {
      const star = document.createElement("span");
      star.className = "confetti";
      star.textContent = ["⭐", "🌟", "✨", "🎉"][i % 4];
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 0.8}s`;
      star.style.animationDuration = `${1.8 + Math.random() * 1.5}s`;
      document.body.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, 3600);
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function generateHanoiMoves(n, fromPeg, auxPeg, toPeg, result = []) {
    if (n <= 0) return result;

    generateHanoiMoves(n - 1, fromPeg, toPeg, auxPeg, result);
    result.push({
      from: fromPeg,
      to: toPeg
    });
    generateHanoiMoves(n - 1, auxPeg, fromPeg, toPeg, result);

    return result;
  }

  async function startAutoSolve() {
    if (game.isSolving) return;

    resetGame(game.diskCount);

    game.isSolving = true;
    setControlsDisabled(true);
    showMessage("Demo time! Watch how the discs move to the right step by step.", "normal");

    const steps = generateHanoiMoves(game.diskCount, "A", "B", "C", []);

    for (const step of steps) {
      if (!game.isSolving) break;

      await sleep(650);

      moveDisk(step.from, step.to, {
        save: false,
        sound: true,
        message: `Demo: move from ${step.from} to ${step.to}`
      });
    }

    game.isSolving = false;
    setControlsDisabled(false);
    updateInfo();
  }

  function getAudioContext() {
    if (!game.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      game.audioContext = new AudioContextClass();
    }

    return game.audioContext;
  }

  async function ensureAudioReady() {
    const audioContext = getAudioContext();

    if (!audioContext) return null;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return audioContext;
  }

  function playTone(frequency, startTime, duration, type = "sine", volume = 0.1) {
    if (!game.soundEnabled) return;

    const audioContext = getAudioContext();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  function playSound(name) {
    if (!game.soundEnabled) return;

    const audioContext = getAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;

    if (name === "pick") {
      playTone(460, now, 0.06, "triangle", 0.06);
    }

    if (name === "place") {
      playTone(520, now, 0.07, "sine", 0.08);
      playTone(720, now + 0.07, 0.08, "sine", 0.08);
    }

    if (name === "invalid") {
      playTone(210, now, 0.12, "sawtooth", 0.06);
      playTone(160, now + 0.09, 0.14, "sawtooth", 0.05);
    }

    if (name === "undo") {
      playTone(640, now, 0.08, "square", 0.05);
      playTone(430, now + 0.08, 0.1, "square", 0.05);
    }

    if (name === "win") {
      playTone(523.25, now, 0.12, "triangle", 0.09);
      playTone(659.25, now + 0.12, 0.12, "triangle", 0.09);
      playTone(783.99, now + 0.24, 0.12, "triangle", 0.09);
      playTone(1046.5, now + 0.36, 0.22, "triangle", 0.1);
    }
  }

  async function toggleSound() {
    game.soundEnabled = !game.soundEnabled;

    if (game.soundEnabled) {
      await ensureAudioReady();
      soundBtn.textContent = "Sound: On";
      showMessage("Sound is on.", "normal");
      playSound("place");
    } else {
      soundBtn.textContent = "Sound: Off";
      showMessage("Sound is off.", "normal");
    }
  }

  document.addEventListener("pointermove", moveDrag);
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);

  resetBtn.addEventListener("click", () => {
    if (game.isSolving) return;
    resetGame(game.diskCount);
  });

  undoBtn.addEventListener("click", undoMove);

  hintBtn.addEventListener("click", showHint);

  soundBtn.addEventListener("click", toggleSound);

  autoBtn.addEventListener("click", startAutoSolve);

  playAgainBtn.addEventListener("click", () => {
    resetGame(game.diskCount);
  });

  levelSelect.addEventListener("change", () => {
    if (game.isSolving) return;
    resetGame(levelSelect.value);
  });

  resetGame(levelSelect.value);
});