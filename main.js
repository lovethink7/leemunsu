const menuCategory = document.querySelector("#menuCategory");
const menuName = document.querySelector("#menuName");
const menuDescription = document.querySelector("#menuDescription");
const menuTags = document.querySelector("#menuTags");
const menuReason = document.querySelector("#menuReason");
const menuPairing = document.querySelector("#menuPairing");
const alternativesContainer = document.querySelector("#alternatives");
const recommendButton = document.querySelector("#recommendButton");
const themeToggle = document.querySelector("#themeToggle");
const themeStorageKey = "dinner-theme";

const dinnerMenus = [
  {
    name: "제육볶음 정식",
    category: "한식",
    description: "불향 도는 매콤한 제육에 상추와 쌈장을 곁들이면 실패 확률이 거의 없는 저녁입니다.",
    reason: "하루 피로가 쌓였을 때 자극 있는 한식이 만족감이 높습니다.",
    pairing: "계란찜, 된장찌개, 시원한 콜라",
    tags: ["든든함", "매콤함", "빠른 만족"],
  },
  {
    name: "마라탕 + 꿔바로우",
    category: "중식",
    description: "얼얼한 국물과 바삭한 튀김 조합이라 배달 만족도가 높은 편입니다.",
    reason: "스트레스 받은 날에는 강한 향과 식감 대비가 분명한 메뉴가 잘 맞습니다.",
    pairing: "중국당면 추가, 단무지, 제로 사이다",
    tags: ["얼얼함", "배달 최적", "포만감"],
  },
  {
    name: "연어 포케",
    category: "가벼운 저녁",
    description: "부담 없이 깔끔하지만 재료가 다양해서 한 끼로 허전하지 않은 메뉴입니다.",
    reason: "늦은 저녁엔 무겁지 않으면서도 단백질이 있는 선택이 체감이 좋습니다.",
    pairing: "아보카도 추가, 미소장국, 탄산수",
    tags: ["가벼움", "깔끔함", "밸런스"],
  },
  {
    name: "돈코츠 라멘",
    category: "일식",
    description: "진한 국물과 쫄깃한 면 조합이 저녁 한 끼 집중도를 끌어올립니다.",
    reason: "비슷한 반복 식사에 질렸다면 국물 면 요리가 기분 전환에 좋습니다.",
    pairing: "교자, 반숙란 추가, 시원한 우롱차",
    tags: ["국물", "진한 맛", "쫄깃함"],
  },
  {
    name: "수제버거 세트",
    category: "양식",
    description: "패티 풍미와 감자튀김, 탄산 조합이 분명해서 고민 없이 만족하기 쉽습니다.",
    reason: "복잡하게 생각하기 싫을 땐 직관적인 메뉴가 가장 빠른 해답입니다.",
    pairing: "치즈프라이, 피클, 콜라",
    tags: ["직관적", "고기", "주말 느낌"],
  },
  {
    name: "김치찌개 + 계란말이",
    category: "집밥 무드",
    description: "따뜻한 국물과 익숙한 반찬 조합으로 안정감 있는 저녁을 만듭니다.",
    reason: "비 오는 날이나 피곤한 날엔 익숙한 집밥 계열이 가장 편합니다.",
    pairing: "햄구이, 김, 따뜻한 밥 한 공기",
    tags: ["따뜻함", "안정감", "집밥"],
  },
  {
    name: "치킨 시저 샐러드 랩",
    category: "간단한 저녁",
    description: "식사 시간을 짧게 쓰고 싶을 때 먹기 편하면서도 포만감이 괜찮습니다.",
    reason: "야식으로 넘어가기 전 선을 지키고 싶을 때 적당한 선택입니다.",
    pairing: "웨지감자, 아이스티, 추가 치킨",
    tags: ["간편함", "담백함", "빠른 식사"],
  },
  {
    name: "삼겹살 + 비빔면",
    category: "회식 감성",
    description: "기름진 고기와 새콤한 면 조합이 강해서 만족감이 확실한 편입니다.",
    reason: "오늘은 참지 말고 제대로 먹고 싶은 날에 가장 설득력 있는 카드입니다.",
    pairing: "상추쌈, 구운 김치, 하이볼",
    tags: ["고기", "확실한 만족", "주말 저녁"],
  },
];

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

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function createTag(tag) {
  const element = document.createElement("span");
  element.className = "tag";
  element.textContent = tag;
  return element;
}

function createAlternativeCard(menu) {
  const article = document.createElement("article");
  article.className = "alternative-card";

  const category = document.createElement("p");
  category.className = "alternative-category";
  category.textContent = menu.category;

  const title = document.createElement("h3");
  title.className = "alternative-title";
  title.textContent = menu.name;

  const text = document.createElement("p");
  text.className = "alternative-text";
  text.textContent = menu.description;

  article.append(category, title, text);
  return article;
}

function renderRecommendation() {
  const shuffledMenus = shuffle(dinnerMenus);
  const featuredMenu = shuffledMenus[0];
  const alternatives = shuffledMenus.slice(1, 4);

  menuCategory.textContent = featuredMenu.category;
  menuName.textContent = featuredMenu.name;
  menuDescription.textContent = featuredMenu.description;
  menuReason.textContent = featuredMenu.reason;
  menuPairing.textContent = featuredMenu.pairing;

  menuTags.innerHTML = "";
  featuredMenu.tags.forEach((tag) => {
    menuTags.appendChild(createTag(tag));
  });

  alternativesContainer.innerHTML = "";
  alternatives.forEach((menu) => {
    alternativesContainer.appendChild(createAlternativeCard(menu));
  });
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  window.localStorage.setItem(themeStorageKey, nextTheme);
  applyTheme(nextTheme);
});

recommendButton.addEventListener("click", renderRecommendation);

applyTheme(getPreferredTheme());
renderRecommendation();
