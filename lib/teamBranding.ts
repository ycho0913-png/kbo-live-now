export interface TeamBrand {
  key: string;
  name: string;
  shortName: string;
  mascot: string;
  symbol: string;
  primary: string;
  secondary: string;
  text: string;
}

const teamBrands: TeamBrand[] = [
  {
    key: "samsung",
    name: "삼성 라이온즈",
    shortName: "삼성",
    mascot: "사자",
    symbol: "🦁",
    primary: "#0b4ea2",
    secondary: "#d7e8ff",
    text: "#ffffff"
  },
  {
    key: "kia",
    name: "KIA 타이거즈",
    shortName: "KIA",
    mascot: "호랑이",
    symbol: "🐯",
    primary: "#c8102e",
    secondary: "#ffe0e5",
    text: "#ffffff"
  },
  {
    key: "lg",
    name: "LG 트윈스",
    shortName: "LG",
    mascot: "트윈스",
    symbol: "👯",
    primary: "#111111",
    secondary: "#ffe0ea",
    text: "#ffffff"
  },
  {
    key: "doosan",
    name: "두산 베어스",
    shortName: "두산",
    mascot: "곰",
    symbol: "🐻",
    primary: "#13294b",
    secondary: "#e4ecf8",
    text: "#ffffff"
  },
  {
    key: "lotte",
    name: "롯데 자이언츠",
    shortName: "롯데",
    mascot: "거인",
    symbol: "🧢",
    primary: "#002f6c",
    secondary: "#ffe5e5",
    text: "#ffffff"
  },
  {
    key: "hanwha",
    name: "한화 이글스",
    shortName: "한화",
    mascot: "독수리",
    symbol: "🦅",
    primary: "#f37321",
    secondary: "#fff1e5",
    text: "#111111"
  },
  {
    key: "ssg",
    name: "SSG 랜더스",
    shortName: "SSG",
    mascot: "랜더스",
    symbol: "🚀",
    primary: "#ce0e2d",
    secondary: "#ffe3e8",
    text: "#ffffff"
  },
  {
    key: "nc",
    name: "NC 다이노스",
    shortName: "NC",
    mascot: "공룡",
    symbol: "🦖",
    primary: "#1d467b",
    secondary: "#f0d28a",
    text: "#ffffff"
  },
  {
    key: "kt",
    name: "KT 위즈",
    shortName: "KT",
    mascot: "마법사",
    symbol: "🪄",
    primary: "#111111",
    secondary: "#e6e6e6",
    text: "#ffffff"
  },
  {
    key: "kiwoom",
    name: "키움 히어로즈",
    shortName: "키움",
    mascot: "영웅",
    symbol: "🛡️",
    primary: "#7a0026",
    secondary: "#f4dde6",
    text: "#ffffff"
  }
];

export function getTeamBrand(teamName: string | null | undefined): TeamBrand {
  const normalized = (teamName ?? "").replace(/\s+/g, "").toLowerCase();
  const found = teamBrands.find((brand) => {
    const shortName = brand.shortName.replace(/\s+/g, "").toLowerCase();
    const fullName = brand.name.replace(/\s+/g, "").toLowerCase();
    return normalized.includes(shortName) || normalized.includes(fullName);
  });

  return (
    found ?? {
      key: "kbo",
      name: teamName || "KBO",
      shortName: teamName || "KBO",
      mascot: "야구",
      symbol: "⚾",
      primary: "#116149",
      secondary: "#e5f3ee",
      text: "#ffffff"
    }
  );
}

export function getAllTeamBrands() {
  return teamBrands;
}
