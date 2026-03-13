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

// 워터폴 차트용 데이터 (분야별 증감)
function buildChangeData(budgetData) {
  const base = budgetData.find(d => d.year === 2025);
  const cur = budgetData.find(d => d.year === 2026);
  if (!base || !cur) return [];

  const items = BUDGET_KEYS.map(({ key, label, color }) => {
    const diff = Math.round((cur[key] - base[key]) * 10) / 10;
    return {
      name: label,
      '증감': diff,
      '2025': base[key],
      '2026': cur[key],
      color,
    };
  });

  // 합계 항목 추가
  items.push({
    name: '합계',
    '증감': Math.round((cur.total - base.total) * 10) / 10,
    '2025': base.total,
    '2026': cur.total,
    color: COLORS.accent,
    isTotal: true,
  });

  return items;
}

const IMPACT_STYLE = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-700',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
};

export default function PolicyTracker() {
  const changeData = buildChangeData(SOC_BUDGET);

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

        {/* 2025→2026 분야별 변동 */}
        <ChartCard title="2025→2026 분야별 예산 증감" subtitle="전년比 변동폭 (조원) · 합계 +2.0조">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={changeData} layout="vertical" margin={{ top: 10, right: 40, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={v => `+${v}조`}
                tick={{ fontSize: 10 }}
                domain={[0, 2.2]}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={({ x, y, payload }) => {
                  const item = changeData.find(d => d.name === payload.value);
                  return (
                    <text
                      x={x - 4} y={y + 4}
                      textAnchor="end"
                      fontSize={11}
                      fill={item?.isTotal ? COLORS.accent : '#9ca3af'}
                      fontWeight={item?.isTotal ? 700 : 400}
                    >
                      {payload.value}
                    </text>
                  );
                }}
                width={50}
              />
              <Tooltip
                formatter={(v, name, { payload }) => [
                  `+${v}조원 (${payload['2025']}→${payload['2026']}조)`,
                  payload.name,
                ]}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="증감" radius={[0, 4, 4, 0]} barSize={24}>
                <LabelList
                  dataKey="증감"
                  position="right"
                  formatter={v => `+${v}조`}
                  style={{ fontSize: 11, fontWeight: 600, fill: '#10b981' }}
                />
                {changeData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isTotal ? COLORS.accent : entry.color}
                    opacity={entry.isTotal ? 1 : 0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* 하단 요약 */}
          <div className="mt-3 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <span>2025: <strong className="text-gray-700 dark:text-gray-200">25.5조</strong></span>
            <span className="text-emerald-600 font-bold text-sm">→ +2.0조 →</span>
            <span>2026: <strong className="text-accent">27.5조</strong></span>
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
