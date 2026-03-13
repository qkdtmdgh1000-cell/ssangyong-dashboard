import { SOC_BUDGET, POLICY_EVENTS } from '../constants/ssangyong';
import { COLORS } from '../constants/colors';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList, Cell,
} from 'recharts';
import ChartCard from '../components/common/ChartCard';

const BUDGET_KEYS = [
  { key: 'road', label: '도로', color: COLORS.subsector['도로'] },
  { key: 'rail', label: '철도', color: COLORS.subsector['철도'] },
  { key: 'port', label: '항만', color: COLORS.subsector['항만'] },
  { key: 'water', label: '수자원', color: '#06b6d4' },
  { key: 'other', label: '기타', color: '#a3a3a3' },
];

// 워터폴 차트용 데이터 변환
function buildWaterfall(budgetData) {
  // 2025→2026 분야별 증감 + 전체 합계
  const base = budgetData.find(d => d.year === 2025);
  const cur = budgetData.find(d => d.year === 2026);
  if (!base || !cur) return [];

  let runningTotal = base.total;
  const items = [];

  BUDGET_KEYS.forEach(({ key, label, color }) => {
    const diff = (cur[key] - base[key]);
    items.push({
      name: label,
      base: Math.round(Math.min(runningTotal, runningTotal + diff) * 10) / 10,
      value: Math.round(Math.abs(diff) * 10) / 10,
      diff: Math.round(diff * 10) / 10,
      isPositive: diff >= 0,
      color,
    });
    runningTotal += diff;
  });

  // 시작 / 끝 항목
  return [
    { name: '2025 합계', base: 0, value: base.total, isTotal: true, color: COLORS.primary },
    ...items,
    { name: '2026 합계', base: 0, value: cur.total, isTotal: true, color: COLORS.accent },
  ];
}

// 워터폴 커스텀 툴팁
function WaterfallTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold">{label}</p>
      {d.isTotal ? (
        <p className="text-gray-600 dark:text-gray-300 mt-1">총 예산: <strong>{d.value}조원</strong></p>
      ) : (
        <p className={`mt-1 font-medium ${d.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {d.isPositive ? '+' : ''}{d.diff}조원
        </p>
      )}
    </div>
  );
}

const IMPACT_STYLE = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-700',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
};

export default function PolicyTracker() {
  const waterfallData = buildWaterfall(SOC_BUDGET);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">정책·예산 트래커</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          SOC 예산 추이 · 워터폴 분석 · 주요 정책 타임라인
        </p>
      </div>

      {/* SOC 예산 하이라이트 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '2026 SOC 예산', value: '27.5조', sub: '역대 최대', pos: true },
          { label: '전년比 증가', value: '+2.0조', sub: '+7.8% YoY', pos: true },
          { label: '철도 예산', value: '6.8조', sub: '↑0.7조 (남부내륙·신안산 등)', pos: true },
          { label: '도로 예산', value: '8.5조', sub: '↑0.5조', pos: true },
        ].map(item => (
          <div
            key={item.label}
            className={`rounded-xl border p-4 ${
              item.pos
                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
            }`}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{item.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SOC 예산 연도별 추이 */}
        <ChartCard title="SOC 예산 추이 (2022–2026)" subtitle="분야별 Stacked Bar (조원)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={SOC_BUDGET} margin={{ top: 10, right: 15, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${v}조`} tick={{ fontSize: 10 }} width={40} domain={[0, 32]} />
              <Tooltip formatter={(v, name) => [`${v}조원`, name]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {BUDGET_KEYS.map(({ key, label, color }) => (
                <Bar key={key} dataKey={key} name={label} stackId="a" fill={color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2025→2026 워터폴 차트 */}
        <ChartCard title="2025→2026 SOC 예산 변동" subtitle="분야별 증감 워터폴 차트 (조원)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waterfallData} margin={{ top: 10, right: 15, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={v => `${v}조`} tick={{ fontSize: 10 }} width={40} domain={[0, 32]} />
              <Tooltip content={<WaterfallTooltip />} />
              {/* 투명 베이스 바 (워터폴 효과) */}
              <Bar dataKey="base" stackId="wf" fill="transparent" />
              <Bar dataKey="value" stackId="wf" radius={[3, 3, 0, 0]}>
                {waterfallData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.isTotal ? entry.color
                      : entry.isPositive ? COLORS.positive
                      : COLORS.negative
                    }
                    opacity={entry.isTotal ? 0.85 : 0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block" style={{ background: COLORS.primary }} />합계</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block" style={{ background: COLORS.positive }} />증가</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block" style={{ background: COLORS.negative }} />감소</span>
          </div>
        </ChartCard>
      </div>

      {/* 정책 타임라인 */}
      <ChartCard title="주요 정책 타임라인" subtitle="건설 시장에 영향을 미친 핵심 정책 이벤트">
        <div className="relative">
          {/* 세로 선 */}
          <div className="absolute left-[88px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-4">
            {POLICY_EVENTS.map((ev, i) => (
              <div key={i} className="flex gap-4 items-start">
                {/* 날짜 */}
                <div className="w-20 text-right flex-shrink-0">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {ev.date.replace('-', '.')}
                  </span>
                </div>

                {/* 원 마커 */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    ev.impact === 'high'
                      ? 'bg-red-500 border-red-300'
                      : ev.impact === 'medium'
                      ? 'bg-amber-500 border-amber-300'
                      : 'bg-gray-400 border-gray-200'
                  }`} />
                </div>

                {/* 내용 */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{ev.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${IMPACT_STYLE[ev.impact]}`}>
                      {ev.impact === 'high' ? '고영향' : ev.impact === 'medium' ? '중영향' : '저영향'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{ev.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 인사이트 */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">쌍용건설 관련 기회 요인</p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>SOC 예산 역대 최대 → 남부내륙철도 등 토목 수주 기회 확대</li>
            <li>LH 직접시행 확대 → 공공주택 원도급 수주 증가</li>
            <li>상반기 65%+ 조기집행 → 1~3월 집중 영업 전략 필요</li>
          </ul>
        </div>
      </ChartCard>
    </div>
  );
}
