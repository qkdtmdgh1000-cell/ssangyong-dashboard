import { useMemo } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { SCENARIOS, SSANGYONG } from '../constants/ssangyong';
import { COLORS } from '../constants/colors';
import ChartCard from '../components/common/ChartCard';
import { Target, Clock, Lightbulb, ArrowUpRight } from 'lucide-react';

// Fan Chart용 데이터 빌드
function buildFanData() {
  const actualYears = Object.keys(SCENARIOS.actual).map(Number).sort();
  const forecastYears = Object.keys(SCENARIOS.base).map(Number).sort();

  const actualData = actualYears.map(year => ({
    year,
    actual: SCENARIOS.actual[year],
    isActual: true,
  }));

  // 실제값 마지막 연도를 전망의 기준점으로 연결
  const lastActual = actualYears.at(-1);
  const lastActualVal = SCENARIOS.actual[lastActual];

  const forecastData = forecastYears.map(year => ({
    year,
    base: SCENARIOS.base[year],
    optimistic: SCENARIOS.optimistic[year],
    pessimistic: SCENARIOS.pessimistic[year],
    // 낙관-비관 범위 (Area 용)
    range: [SCENARIOS.pessimistic[year], SCENARIOS.optimistic[year]],
    isActual: false,
  }));

  // 실제 → 전망 연결 브리지
  const bridge = {
    year: lastActual,
    actual: lastActualVal,
    base: lastActualVal,
    optimistic: lastActualVal,
    pessimistic: lastActualVal,
    range: [lastActualVal, lastActualVal],
  };

  return [...actualData, bridge, ...forecastData];
}

const STRATEGY_CARDS = [
  {
    horizon: '단기 (2026)',
    icon: Clock,
    color: 'blue',
    items: [
      '상반기 SOC 조기집행 대응 → 공공 입찰 집중',
      '남부내륙철도 2공구 원활한 착공 관리',
      '공공주택 (왕숙) 공정 선행 관리',
    ],
    kpi: '공공수주 목표 +15% YoY',
  },
  {
    horizon: '중기 (2027–28)',
    icon: Target,
    color: 'emerald',
    items: [
      '시공능력평가 Top 20 진입 목표',
      '토목·건축 균형 포트폴리오 구성',
      '해외(두바이) 레퍼런스 활용 중동 영업 확대',
    ],
    kpi: '수주잔고 12조원 돌파',
  },
  {
    horizon: '장기 (2029+)',
    icon: Lightbulb,
    color: 'purple',
    items: [
      'GTX·도심항공교통 등 차세대 인프라 선점',
      '스마트건설 기술 내재화 (BIM, 모듈화)',
      '부채비율 100% 이하 달성 → 재무 안정화',
    ],
    kpi: '매출 3조원 돌파',
  },
];

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
};

function FanTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold mb-1">{label}년</p>
      {payload.map(p => p.value != null && (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span className="text-gray-600 dark:text-gray-300">{p.name}:</span>
          <span className="font-medium">{Array.isArray(p.value) ? `${p.value[0]}~${p.value[1]}조` : `${p.value}조`}</span>
        </div>
      ))}
    </div>
  );
}

export default function OutlookStrategy() {
  const fanData = useMemo(() => buildFanData(), []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">전망 및 전략</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          건설투자 시나리오 전망 · 쌍용건설 전략 로드맵
        </p>
      </div>

      {/* 시나리오 요약 배너 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: '기본 시나리오', value: '231조', sub: '2026E · 공공 주도 회복', color: 'text-primary', bg: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' },
          { label: '낙관 시나리오', value: '245조', sub: '민간 PF 정상화 시', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' },
          { label: '비관 시나리오', value: '220조', sub: 'PF 위기 지속 시', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' },
        ].map(item => (
          <div key={item.label} className={`rounded-xl border p-4 ${item.bg}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color} mt-1`}>{item.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Fan Chart */}
      <ChartCard
        title="건설투자 시나리오 전망 (Fan Chart)"
        subtitle="실선=실적, 음영=낙관~비관 범위, 점선=기본 시나리오 (단위: 조원)"
      >
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={fanData} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
            <defs>
              <linearGradient id="fanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis
              domain={[200, 280]}
              tickFormatter={v => `${v}조`}
              tick={{ fontSize: 10 }}
              width={48}
            />
            <Tooltip content={<FanTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />

            {/* 낙관-비관 범위 Area */}
            <Area
              dataKey="optimistic"
              name="낙관"
              fill="url(#fanGrad)"
              stroke={COLORS.positive}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
              fillOpacity={1}
            />
            <Area
              dataKey="pessimistic"
              name="비관"
              fill="#ffffff"
              stroke={COLORS.negative}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
              fillOpacity={1}
            />

            {/* 기본 시나리오 */}
            <Line
              dataKey="base"
              name="기본"
              stroke={COLORS.primary}
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={{ r: 4, fill: COLORS.primary }}
            />

            {/* 실적 */}
            <Line
              dataKey="actual"
              name="실적"
              stroke={COLORS.chart.public}
              strokeWidth={3}
              dot={{ r: 4, fill: COLORS.chart.public }}
            />

            {/* 실적/전망 구분선 */}
            <ReferenceLine x={2025} stroke="#9ca3af" strokeDasharray="4 2" label={{ value: '전망 →', position: 'top', fontSize: 11, fill: '#6b7280' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 전략 제언 카드 3개 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STRATEGY_CARDS.map(card => {
          const Icon = card.icon;
          const styles = COLOR_MAP[card.color];
          return (
            <div
              key={card.horizon}
              className={`rounded-xl border p-5 ${styles.bg} ${styles.border}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${styles.badge}`}>
                  <Icon size={16} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{card.horizon}</h3>
              </div>

              <ul className="space-y-2 mb-4">
                {card.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <ArrowUpRight size={14} className="flex-shrink-0 mt-0.5 text-gray-400" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className={`rounded-lg px-3 py-2 ${styles.badge} text-xs font-semibold`}>
                🎯 {card.kpi}
              </div>
            </div>
          );
        })}
      </div>

      {/* 포트폴리오 분석 */}
      <ChartCard title="쌍용건설 공공영업 포트폴리오 인사이트">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: '강점 (Strength)',
              color: 'emerald',
              items: ['3년간 순위 10계단 급등', '수주잔고 9조 돌파', '부채비율 753%→150% 재무 정상화', '토목+건축 균형 포트폴리오'],
            },
            {
              title: '기회 (Opportunity)',
              color: 'blue',
              items: ['SOC 예산 역대 최대 27.5조', '공공 수주 8.4% 성장 전망', '남부내륙철도 등 대형 토목 발주', '수도권 공공주택 공급 확대'],
            },
            {
              title: '약점 (Weakness)',
              color: 'amber',
              items: ['시공능력 23위, 대형사 대비 약세', '민간 주택사업 비중 제한적', '해외 사업 레퍼런스 초기 단계'],
            },
            {
              title: '위협 (Threat)',
              color: 'red',
              items: ['민간 PF 리스크 지속', '원자재 가격 변동성', '대형 건설사 공공 시장 진출 강화', '금리 장기 고착화'],
            },
          ].map(sec => {
            const c = {
              emerald: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
              blue: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
              amber: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
              red: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
            }[sec.color];
            return (
              <div key={sec.title} className={`rounded-xl border p-4 ${c}`}>
                <p className="font-bold text-sm mb-2">{sec.title}</p>
                <ul className="space-y-1">
                  {sec.items.map((it, i) => (
                    <li key={i} className="text-xs flex gap-1.5">
                      <span>·</span>{it}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}
