const numbersContainer = document.querySelector("#numbers");
const bonusContainer = document.querySelector("#bonus");
const generateButton = document.querySelector("#generateButton");
const themeToggle = document.querySelector("#themeToggle");
const themeStorageKey = "lotto-theme";

function getPreferredTheme() {
  const savedTheme = window.localStorage.getItem(themeStorageKey);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = isDark ? "화이트 모드" : "다크 모드";
  themeToggle.setAttribute("aria-label", isDark ? "화이트 모드 전환" : "다크 모드 전환");
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

function createBall(number, extraClass = "") {
  const ball = document.createElement("span");
  ball.className = `ball ${extraClass}`.trim();
  ball.textContent = String(number);
  return ball;
}

function pickLottoNumbers() {
  const pool = Array.from({ length: 45 }, (_, index) => index + 1);

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  const mainNumbers = pool.slice(0, 6).sort((a, b) => a - b);
  const bonusNumber = pool[6];

  return { mainNumbers, bonusNumber };
}

function renderNumbers() {
  const { mainNumbers, bonusNumber } = pickLottoNumbers();

  numbersContainer.innerHTML = "";
  bonusContainer.innerHTML = "";

  mainNumbers.forEach((number) => {
    numbersContainer.appendChild(createBall(number));
  });

  bonusContainer.appendChild(createBall(bonusNumber, "bonus-ball"));
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  window.localStorage.setItem(themeStorageKey, nextTheme);
  applyTheme(nextTheme);
});

applyTheme(getPreferredTheme());
generateButton.addEventListener("click", renderNumbers);
renderNumbers();
