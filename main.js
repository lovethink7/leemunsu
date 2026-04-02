const MODEL_BASE_URL = "https://teachablemachine.withgoogle.com/models/cnu9ByevZ/";
const themeStorageKey = "rps-ai-theme";
const computerChoices = ["가위", "바위", "보"];
const labelAliases = {
  scissors: "가위",
  scissor: "가위",
  가위: "가위",
  rock: "바위",
  바위: "바위",
  paper: "보",
  보: "보",
};

const themeToggle = document.querySelector("#themeToggle");
const cameraButton = document.querySelector("#cameraButton");
const playButton = document.querySelector("#playButton");
const refreshButton = document.querySelector("#refreshButton");
const webcamContainer = document.querySelector("#webcam-container");
const labelContainer = document.querySelector("#label-container");
const statusText = document.querySelector("#statusText");
const roundGuide = document.querySelector("#roundGuide");
const userHand = document.querySelector("#userHand");
const userConfidence = document.querySelector("#userConfidence");
const computerHand = document.querySelector("#computerHand");
const computerHint = document.querySelector("#computerHint");
const roundResult = document.querySelector("#roundResult");
const resultDetail = document.querySelector("#resultDetail");
const winsCount = document.querySelector("#winsCount");
const drawsCount = document.querySelector("#drawsCount");
const lossesCount = document.querySelector("#lossesCount");

let model;
let webcam;
let maxPredictions = 0;
let predictionBars = [];
let animationFrameId = 0;
let currentBestPrediction = null;
const stats = { wins: 0, draws: 0, losses: 0 };

function getPreferredTheme() {
  const savedTheme = window.localStorage.getItem(themeStorageKey);
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = theme;
  if (!themeToggle) return;
  themeToggle.textContent = isDark ? "화이트 모드" : "다크 모드";
  themeToggle.setAttribute("aria-label", isDark ? "화이트 모드 전환" : "다크 모드 전환");
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

function normalizeHand(label) {
  return labelAliases[label.trim().toLowerCase()] || labelAliases[label.trim()] || null;
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function createPredictionBar() {
  const row = document.createElement("article");
  row.className = "prediction-row";

  const name = document.createElement("div");
  name.className = "prediction-name";

  const track = document.createElement("div");
  track.className = "prediction-track";

  const fill = document.createElement("div");
  fill.className = "prediction-fill";
  track.appendChild(fill);

  const value = document.createElement("div");
  value.className = "prediction-value";

  row.append(name, track, value);
  labelContainer.appendChild(row);
  return { name, fill, value };
}

function setStatus(message) {
  if (statusText) statusText.textContent = message;
}

function setPredictionState(prediction) {
  currentBestPrediction = prediction;
  if (!userHand || !userConfidence || !playButton || !refreshButton || !roundGuide) return;

  if (!prediction) {
    userHand.textContent = "대기 중";
    userConfidence.textContent = "신뢰도 0%";
    playButton.disabled = true;
    refreshButton.disabled = true;
    roundGuide.textContent = "먼저 카메라를 시작하고 손 모양을 보여주세요.";
    return;
  }

  userHand.textContent = prediction.normalizedLabel || prediction.className;
  userConfidence.textContent = `신뢰도 ${formatPercent(prediction.probability)}`;
  playButton.disabled = !prediction.normalizedLabel;
  refreshButton.disabled = false;
  roundGuide.textContent = prediction.normalizedLabel
    ? "현재 인식된 손으로 바로 대결할 수 있습니다."
    : "모델 최고 확률 클래스가 가위, 바위, 보 중 하나로 매핑되지 않았습니다.";
}

function updateStats() {
  if (winsCount) winsCount.textContent = String(stats.wins);
  if (drawsCount) drawsCount.textContent = String(stats.draws);
  if (lossesCount) lossesCount.textContent = String(stats.losses);
}

function compareHands(player, computer) {
  if (player === computer) return "draw";
  if ((player === "가위" && computer === "보") || (player === "바위" && computer === "가위") || (player === "보" && computer === "바위")) {
    return "win";
  }
  return "loss";
}

function renderRoundResult(outcome, player, computer, confidence) {
  if (!roundResult || !resultDetail) return;
  if (outcome === "win") {
    roundResult.textContent = "승리";
    resultDetail.textContent = `${player}가 ${computer}를 이겼습니다. 모델 신뢰도는 ${formatPercent(confidence)}입니다.`;
    stats.wins += 1;
    return;
  }
  if (outcome === "draw") {
    roundResult.textContent = "무승부";
    resultDetail.textContent = `둘 다 ${player}를 냈습니다. 다시 한 판 가도 됩니다.`;
    stats.draws += 1;
    return;
  }
  roundResult.textContent = "패배";
  resultDetail.textContent = `${computer}가 ${player}를 이겼습니다. 손을 조금 더 선명하게 보여주고 다시 시도해보세요.`;
  stats.losses += 1;
}

function ensurePredictionBars() {
  if (!labelContainer || predictionBars.length > 0) return;
  for (let index = 0; index < maxPredictions; index += 1) {
    predictionBars.push(createPredictionBar());
  }
}

async function predict() {
  if (!model || !webcam || !labelContainer) return;
  const predictions = await model.predict(webcam.canvas);
  predictions.sort((left, right) => right.probability - left.probability);
  ensurePredictionBars();

  predictions.forEach((prediction, index) => {
    const bar = predictionBars[index];
    if (!bar) return;
    const normalizedLabel = normalizeHand(prediction.className);
    bar.name.textContent = normalizedLabel || prediction.className;
    bar.fill.style.width = formatPercent(prediction.probability);
    bar.value.textContent = formatPercent(prediction.probability);
  });

  const bestPrediction = predictions[0];
  setPredictionState({
    className: bestPrediction.className,
    normalizedLabel: normalizeHand(bestPrediction.className),
    probability: bestPrediction.probability,
  });
}

async function loop() {
  webcam.update();
  await predict();
  animationFrameId = window.requestAnimationFrame(loop);
}

async function init() {
  if (!cameraButton || !webcamContainer || !labelContainer) return;
  if (webcam) return;

  cameraButton.disabled = true;
  cameraButton.textContent = "카메라 준비 중";
  setStatus("모델과 카메라를 불러오는 중입니다.");

  try {
    const modelURL = `${MODEL_BASE_URL}model.json`;
    const metadataURL = `${MODEL_BASE_URL}metadata.json`;
    model = await window.tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    webcam = new window.tmImage.Webcam(320, 320, true);
    await webcam.setup();
    await webcam.play();

    webcamContainer.innerHTML = "";
    webcam.canvas.className = "webcam-canvas";
    webcamContainer.appendChild(webcam.canvas);

    cameraButton.textContent = "카메라 연결 완료";
    if (refreshButton) refreshButton.disabled = false;
    setStatus("실시간 인식이 시작되었습니다. 손 모양을 화면 중앙에 맞춰주세요.");

    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = window.requestAnimationFrame(loop);
  } catch (error) {
    console.error(error);
    cameraButton.disabled = false;
    cameraButton.textContent = "카메라 다시 시도";
    setStatus("카메라 또는 모델을 불러오지 못했습니다. 브라우저 권한과 네트워크를 확인해주세요.");
  }
}

function playRound() {
  if (!currentBestPrediction || !currentBestPrediction.normalizedLabel) {
    if (roundGuide) {
      roundGuide.textContent = "가위, 바위, 보 중 하나가 확실히 인식될 때까지 손 모양을 다시 맞춰주세요.";
    }
    return;
  }
  const computer = computerChoices[Math.floor(Math.random() * computerChoices.length)];
  const player = currentBestPrediction.normalizedLabel;
  const outcome = compareHands(player, computer);
  if (computerHand) computerHand.textContent = computer;
  if (computerHint) computerHint.textContent = "컴퓨터가 무작위로 선택했습니다.";
  renderRoundResult(outcome, player, computer, currentBestPrediction.probability);
  updateStats();
}

function refreshCurrentState() {
  if (roundResult) roundResult.textContent = "준비 중";
  if (resultDetail) resultDetail.textContent = "모델이 가장 높은 확률로 인식한 손 모양으로 승패를 계산합니다.";
  if (computerHand) computerHand.textContent = "?";
  if (computerHint) computerHint.textContent = "랜덤 선택";
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  });
}

if (playButton) playButton.addEventListener("click", playRound);
if (refreshButton) refreshButton.addEventListener("click", refreshCurrentState);

applyTheme(getPreferredTheme());
setPredictionState(null);
updateStats();
window.init = init;
