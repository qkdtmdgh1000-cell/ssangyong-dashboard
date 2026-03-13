import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter,
  ZAxis, ReferenceLine, Cell,
} from 'recharts';
import { COMPETITORS, RANK_HISTORY, SSANGYONG } from '../constants/ssangyong';
import { COLORS } from '../constants/colors';
import ChartCard from '../components/common/ChartCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const HIGHLIGHT_COLOR = COLORS.accent;
const OTHERS_COLOR = '#94a3b8';
const TOP3_COLOR = '#1d4ed8';

// 워터폴처럼 순위 변동 표시
function RankChange({ from, to }) {
  const diff = from - to; // 양수면 상승
  if (diff > 0) return (
    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
      <TrendingUp size={14} />+{diff}
    </span>
  );
  if (diff < 0) return (
    <span className="flex items-center gap-1 text-red-500 font-semibold">
      <TrendingDown size={14} />{diff}
    </span>
  );
  return <span className="flex items-center gap-1 text-gray-400"><Minus size={14} />-</span>;
}

// 커스텀 툴팁 (순위 차트)
function RankTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => a.value - b.value);
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold mb-1">{label}년</p>
      {sorted.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span>{p.name}:</span>
          <span className="font-medium">{p.value}위</span>
        </div>
      ))}
    </div>
  );
}

export default function CompetitorBenchmark() {
  const [metric, setMetric] = useState('revenue');

  const METRICS = [
    { key: 'revenue', label: '매출액', unit: '억원', color: COLORS.primary },
    { key: 'opProfit', label: '영업이익', unit: '억원', color: COLORS.positive },
    { key: 'debtRatio', label: '부채비율', unit: '%', color: COLORS.accent },
    { key: 'backlog', label: '수주잔고', unit: '억원', color: '#7c3aed' },
  ];

  const currentMetric = METRICS.find(m => m.key === metric);

  // 재무지표 비교용 Bar 데이터 (상위 10 + 쌍용건설)
  const barData = COMPETITORS.map(c => ({
    name: c.name.length > 6 ? c.name.slice(0, 5) + '…' : c.name,
    fullName: c.name,
    value: c[metric],
    highlight: !!c.highlight,
  })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  // 순위 차트 (쌍용건설 + 상위 3개사)
  const rankLines = ['삼성물산', '현대건설', 'GS건설', '쌍용건설'];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">경쟁환경 분석</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          시공능력평가 상위사 벤치마크 · 2024년 기준
        </p>
      </div>

      {/* 쌍용건설 하이라이트 배너 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '시공능력 순위', value: '23위', sub: '3년간 10↑계단' },
          { label: '매출액', value: '1.8조', sub: '2025년(E)' },
          { label: '수주잔고', value: '9.0조', sub: '2025년(E)' },
          { label: '부채비율', value: '150%', sub: '↓ 753%(2022)' },
        ].map(item => (
          <div
            key={item.label}
            className="bg-accent/10 dark:bg-orange-950 border border-accent/30 rounded-xl p-4 text-center"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className="text-xl font-bold text-accent mt-1">{item.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 순위 변동 추이 */}
        <ChartCard
          title="시공능력평가 순위 변동 (2020→2024)"
          subtitle="낮을수록 상위권 · 쌍용건설 10계단 상승"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={RANK_HISTORY} margin={{ top: 10, right: 20, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis reversed domain={[1, 45]} tick={{ fontSize: 10 }} width={35} />
              <Tooltip content={<RankTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {rankLines.map(name => (
                <Line
                  key={name}
                  dataKey={name}
                  stroke={
                    name === '쌍용건설' ? HIGHLIGHT_COLOR
                    : name === '삼성물산' ? TOP3_COLOR
                    : OTHERS_COLOR
                  }
                  strokeWidth={name === '쌍용건설' ? 3 : 1.5}
                  strokeDasharray={name === '쌍용건설' ? undefined : '4 2'}
                  dot={name === '쌍용건설' ? { r: 4, fill: HIGHLIGHT_COLOR } : false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 재무지표 비교 Bar */}
        <ChartCard
          title="주요 건설사 재무지표 비교"
          subtitle="쌍용건설(주황) 하이라이트"
        >
          {/* 지표 토글 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  metric === m.key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={v => metric === 'debtRatio' ? `${v}%` : `${(v / 10000).toFixed(1)}조`}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={({ x, y, payload }) => {
                  const item = barData.find(d => d.name === payload.value);
                  return (
                    <text
                      x={x - 4} y={y + 4}
                      textAnchor="end"
                      fontSize={11}
                      fill={item?.highlight ? HIGHLIGHT_COLOR : '#6b7280'}
                      fontWeight={item?.highlight ? 700 : 400}
                    >
                      {payload.value}
                    </text>
                  );
                }}
                width={70}
              />
              <Tooltip
                formatter={v => [
                  metric === 'debtRatio' ? `${v}%` : `${v.toLocaleString()}억원`,
                  currentMetric.label
                ]}
                labelFormatter={l => barData.find(d => d.name === l)?.fullName || l}
              />
              <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                {barData.map(entry => (
                  <Cell
                    key={entry.fullName}
                    fill={entry.highlight ? HIGHLIGHT_COLOR : currentMetric.color}
                    opacity={entry.highlight ? 1 : 0.65}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 상세 비교 테이블 */}
      <ChartCard title="시공능력평가 상위사 비교표" subtitle="2024년 기준 · 쌍용건설 주황 하이라이트">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {['순위', '회사명', '순위변동', '매출액', '영업이익', '부채비율', '수주잔고', '전문분야'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map(c => (
                <tr
                  key={c.name}
                  className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${
                    c.highlight
                      ? 'bg-orange-50 dark:bg-orange-950'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      c.rank2024 <= 3
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : c.highlight
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {c.rank2024}
                    </span>
                  </td>
                  <td className={`py-2.5 px-3 font-medium ${c.highlight ? 'text-accent' : 'text-gray-800 dark:text-gray-200'}`}>
                    {c.name}
                    {c.highlight && <span className="ml-1.5 text-xs bg-accent text-white px-1.5 py-0.5 rounded">당사</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    <RankChange from={c.rank2022} to={c.rank2024} />
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-right text-gray-700 dark:text-gray-300">
                    {(c.revenue / 10000).toFixed(1)}조
                  </td>
                  <td className={`py-2.5 px-3 tabular-nums text-right font-medium ${
                    c.opProfit >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {c.opProfit >= 0 ? '+' : ''}{c.opProfit.toLocaleString()}억
                  </td>
                  <td className={`py-2.5 px-3 tabular-nums text-right ${
                    c.debtRatio > 300 ? 'text-red-500' : c.debtRatio > 150 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {c.debtRatio}%
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-right text-gray-700 dark:text-gray-300">
                    {(c.backlog / 10000).toFixed(1)}조
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-500 dark:text-gray-400">{c.specialty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
