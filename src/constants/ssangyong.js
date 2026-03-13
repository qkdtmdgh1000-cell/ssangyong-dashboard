export const SSANGYONG = {
  name: '쌍용건설',
  rank2024: 23,
  rankChange3yr: +10,
  revenue2025: 18000,
  operatingProfit2025: 600,
  backlog2025: 90000,
  debtRatio2022: 753,
  debtRatio2025: 150,
  keyProjects: [
    { name: '남부내륙철도 2개 공구', amount: 4500, type: '토목', year: 2026 },
    { name: '남양주 왕숙 공공주택', amount: null, type: '건축', year: 2025 },
    { name: 'ASML 화성 캠퍼스', amount: 3000, type: '건축', year: 2024 },
    { name: '두바이 애비뉴 파크 타워', amount: 3700, type: '해외건축', year: 2026 },
  ],
};

export const SOC_BUDGET = [
  { year: 2022, total: 21.8, road: 7.2, rail: 5.1, port: 2.3, water: 1.8, other: 5.4 },
  { year: 2023, total: 23.1, road: 7.5, rail: 5.4, port: 2.5, water: 1.9, other: 5.8 },
  { year: 2024, total: 24.5, road: 7.8, rail: 5.8, port: 2.6, water: 2.0, other: 6.3 },
  { year: 2025, total: 25.5, road: 8.0, rail: 6.1, port: 2.7, water: 2.1, other: 6.6 },
  { year: 2026, total: 27.5, road: 8.5, rail: 6.8, port: 2.9, water: 2.2, other: 7.1 },
];

export const SCENARIOS = {
  actual: { 2023: 222.3, 2024: 220.5, 2025: 222.3 },
  base: { 2026: 231.2, 2027: 242 },
  optimistic: { 2026: 245, 2027: 260 },
  pessimistic: { 2026: 220, 2027: 225 },
};

// 시공능력평가 상위사 (2024년 기준)
export const COMPETITORS = [
  { name: '삼성물산',   rank2024: 1,  rank2022: 1,  revenue: 117000, opProfit: 4800, debtRatio: 62,  backlog: 520000, specialty: '건축·플랜트' },
  { name: '현대건설',   rank2024: 2,  rank2022: 2,  revenue: 112000, opProfit: 2100, debtRatio: 145, backlog: 430000, specialty: '토목·건축' },
  { name: 'GS건설',    rank2024: 3,  rank2022: 3,  revenue: 87000,  opProfit: -800, debtRatio: 210, backlog: 260000, specialty: '건축·플랜트' },
  { name: 'DL이앤씨',  rank2024: 4,  rank2022: 4,  revenue: 68000,  opProfit: 1400, debtRatio: 118, backlog: 230000, specialty: '플랜트·건축' },
  { name: '포스코이앤씨',rank2024: 5, rank2022: 5,  revenue: 82000,  opProfit: 1900, debtRatio: 178, backlog: 310000, specialty: '플랜트·건축' },
  { name: '롯데건설',   rank2024: 6,  rank2022: 7,  revenue: 52000,  opProfit: 800,  debtRatio: 280, backlog: 190000, specialty: '건축' },
  { name: 'SK에코플랜트',rank2024: 7, rank2022: 8,  revenue: 49000,  opProfit: 1200, debtRatio: 195, backlog: 170000, specialty: '환경·플랜트' },
  { name: '호반건설',   rank2024: 8,  rank2022: 10, revenue: 44000,  opProfit: 2100, debtRatio: 88,  backlog: 130000, specialty: '건축' },
  { name: 'HDC현대산업개발',rank2024:9,rank2022: 9,  revenue: 38000,  opProfit: 1100, debtRatio: 132, backlog: 120000, specialty: '건축' },
  { name: '한화건설',   rank2024: 10, rank2022: 12, revenue: 36000,  opProfit: 600,  debtRatio: 220, backlog: 110000, specialty: '건축·플랜트' },
  { name: '쌍용건설',   rank2024: 23, rank2022: 33, revenue: 18000,  opProfit: 600,  debtRatio: 150, backlog: 90000,  specialty: '토목·건축', highlight: true },
];

// 순위 변동 트래킹 (2020~2024)
export const RANK_HISTORY = [
  { year: 2020, '삼성물산': 1, '현대건설': 2, 'GS건설': 3, '쌍용건설': 40 },
  { year: 2021, '삼성물산': 1, '현대건설': 2, 'GS건설': 3, '쌍용건설': 38 },
  { year: 2022, '삼성물산': 1, '현대건설': 2, 'GS건설': 3, '쌍용건설': 33 },
  { year: 2023, '삼성물산': 1, '현대건설': 2, 'GS건설': 3, '쌍용건설': 28 },
  { year: 2024, '삼성물산': 1, '현대건설': 2, 'GS건설': 3, '쌍용건설': 23 },
];

export const POLICY_EVENTS = [
  { date: '2025-09', title: '9·7 대책', desc: '공공택지 LH 직접시행 전환', impact: 'high' },
  { date: '2025-10', title: '10·15 주택안정화', desc: '수도권 135만호 공급계획', impact: 'high' },
  { date: '2025-11', title: '2026 SOC 예산 확정', desc: '역대 최대 27.5조원', impact: 'high' },
  { date: '2026-01', title: '재정 조기집행', desc: '상반기 65%+ 집행 목표', impact: 'medium' },
];
