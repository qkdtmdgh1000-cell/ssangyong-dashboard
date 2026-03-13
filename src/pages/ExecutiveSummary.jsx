import { useMemo } from 'react';
import {
  AreaChart, Area, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useMultiData } from '../hooks/useData';
import { DATA_FILES } from '../constants/config';
import { COLORS } from '../constants/colors';
import { SSANGYONG } from '../constants/ssangyong';
import { yoyGrowth } from '../utils/statistics';
import { formatTrillion, formatBillion, formatPercent, formatPeriod } from '../utils/format';
import KpiCard from '../components/common/KpiCard';
import ChartCard from '../components/common/ChartCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Building2, TrendingUp, Home, HardHat, Award } from 'lucide-react';

// ─── 커스텀 툴팁 ─────────────────────────────────────────
function OrderTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-xs shadow-lg">
      <p className="font-semibold mb-1 text-gray-700 dark:text-gray-200">{formatPeriod(label)}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span className="text-gray-600 dark:text-gray-300">{p.name}:</span>
          <span className="font-medium">{formatBillion(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function InvestTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-xs shadow-lg">
      <p className="font-semibold mb-1 text-gray-700 dark:text-gray-200">{formatPeriod(label)}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span className="text-gray-600 dark:text-gray-300">{p.name}:</span>
          <span className="font-medium">
            {p.name === 'YoY%' ? `${p.value?.toFixed(1)}%` : formatBillion(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────
export default function ExecutiveSummary() {
  const { data, loading, error } = useMultiData({
    orders: DATA_FILES.constructionOrders,
    investment: DATA_FILES.constructionInvestment,
    unsold: DATA_FILES.unsoldHousing,
    employment: DATA_FILES.constructionEmployment,
  });

  // KPI 계산
  const kpis = useMemo(() => {
    if (!data.orders) return null;

    // 1) 공공 건설수주 최근 12개월 합산 (C1_NM='공공부문', C2_NM='계')
    const publicRows = data.orders.filter(r =>
      r.C1_NM === '공공부문' && r.C2_NM === '계' && r.DT != null
    ).sort((a, b) => a.PRD_DE.localeCompare(b.PRD_DE));

    const recent12Periods = [...new Set(publicRows.map(r => r.PRD_DE))].slice(-12);
    const prev12Periods = [...new Set(publicRows.map(r => r.PRD_DE))].slice(-24, -12);

    const publicRecent = publicRows.filter(r => recent12Periods.includes(r.PRD_DE))
      .reduce((s, r) => s + r.DT, 0);
    const publicPrev = publicRows.filter(r => prev12Periods.includes(r.PRD_DE))
      .reduce((s, r) => s + r.DT, 0);

    // 2) 건설투자 증감률 (C1_NM='계')
    let investYoy = null;
    if (data.investment) {
      const invRows = data.investment
        .filter(r => r.C1_NM === '계' && r.DT != null)
        .sort((a, b) => b.PRD_DE.localeCompare(a.PRD_DE));
      if (invRows.length >= 13) {
        investYoy = yoyGrowth(invRows[0].DT, invRows[12].DT);
      }
    }

    // 3) 미분양 주택 (최신 월 전체 시도 합산)
    let unsoldTotal = null;
    if (data.unsold) {
      const latestPrd = [...new Set(data.unsold.map(r => r.PRD_DE))]
        .filter(p => data.unsold.some(r => r.PRD_DE === p && r.DT != null))
        .sort().at(-1);
      if (latestPrd) {
        unsoldTotal = data.unsold
          .filter(r => r.PRD_DE === latestPrd && r.DT != null)
          .reduce((s, r) => s + r.DT, 0);
      }
    }

    // 4) 건설업 취업자 (반기별, 전국 합산)  단위: 천명
    let employment = null;
    if (data.employment) {
      const empRows = data.employment.filter(r =>
        r.C2_NM?.trim() === '건설업 (F)' && r.DT != null
      );
      const latestPrd = [...new Set(empRows.map(r => r.PRD_DE))].sort().at(-1);
      if (latestPrd) {
        employment = empRows
          .filter(r => r.PRD_DE === latestPrd)
          .reduce((s, r) => s + r.DT, 0);
      }
    }

    return {
      publicRecent,
      publicChange: publicPrev > 0 ? yoyGrowth(publicRecent, publicPrev) : null,
      investYoy,
      unsoldTotal,
      employment, // 단위: 천명
    };
  }, [data]);

  // 공공 vs 민간 수주 Area Chart 데이터
  const orderSeries = useMemo(() => {
    if (!data.orders) return [];
    const rows = data.orders.filter(r =>
      (r.C1_NM === '공공부문' || r.C1_NM === '민간부문') &&
      r.C2_NM === '계' && r.DT != null
    );
    const byPeriod = {};
    rows.forEach(r => {
      if (!byPeriod[r.PRD_DE]) byPeriod[r.PRD_DE] = { period: r.PRD_DE };
      byPeriod[r.PRD_DE][r.C1_NM === '공공부문' ? '공공' : '민간'] = r.DT;
    });
    return Object.values(byPeriod).sort((a, b) => a.period.localeCompare(b.period));
  }, [data.orders]);

  // 건설투자 Composed Chart 데이터
  const investSeries = useMemo(() => {
    if (!data.investment) return [];
    const rows = data.investment
      .filter(r => r.C1_NM === '계' && r.DT != null)
      .sort((a, b) => a.PRD_DE.localeCompare(b.PRD_DE));
    return rows.map(r => {
      const prevYear = `${parseInt(r.PRD_DE.slice(0, 4)) - 1}${r.PRD_DE.slice(4)}`;
      const prev = rows.find(p => p.PRD_DE === prevYear);
      return {
        period: r.PRD_DE,
        투자액: r.DT,
        'YoY%': prev ? parseFloat(yoyGrowth(r.DT, prev.DT).toFixed(1)) : null,
      };
    });
  }, [data.investment]);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600 text-sm">{error}</div>
  );

  return (
    <div className="space-y-6">
      {/* 페이지 타이틀 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Executive Summary</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            공공건설 시장 핵심지표 · 2019–2026.01 KOSIS
          </p>
        </div>
      </div>

      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="공공수주 (최근 12개월)"
          value={kpis ? formatTrillion(kpis.publicRecent) : '-'}
          change={kpis?.publicChange}
          changeLabel="전년 동기比"
          icon={Building2}
        />
        <KpiCard
          title="건설투자 증감률"
          value={kpis?.investYoy != null ? formatPercent(kpis.investYoy) : '-'}
          change={kpis?.investYoy}
          changeLabel="YoY"
          icon={TrendingUp}
        />
        <KpiCard
          title="미분양 주택 (2026.01)"
          value={kpis?.unsoldTotal != null ? kpis.unsoldTotal.toLocaleString() : '-'}
          unit="호"
          icon={Home}
        />
        <KpiCard
          title="건설업 취업자 (최신 반기)"
          value={kpis?.employment != null
            ? (kpis.employment / 100).toFixed(1)
            : '-'}
          unit="만명"
          icon={HardHat}
        />
      </div>

      {/* 공공 vs 민간 수주 추이 */}
      <ChartCard
        title="공공 vs 민간 건설수주 추이"
        subtitle="월별 수주액 (단위: 백만원) · 발주자 구분"
      >
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={orderSeries} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="gradPublic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.chart.public} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.chart.public} stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="gradPrivate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.chart.private} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLORS.chart.private} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="period"
              tickFormatter={formatPeriod}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={v => formatTrillion(v)}
              tick={{ fontSize: 10 }}
              width={48}
            />
            <Tooltip content={<OrderTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone" dataKey="공공" name="공공수주"
              stroke={COLORS.chart.public} fill="url(#gradPublic)" strokeWidth={2}
            />
            <Area
              type="monotone" dataKey="민간" name="민간수주"
              stroke={COLORS.chart.private} fill="url(#gradPrivate)" strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 건설투자 추이 */}
      <ChartCard
        title="건설투자 추이 + YoY 증감률"
        subtitle="월별 경상 건설투자 (백만원) + 전년동월比 증감률(%)"
      >
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={investSeries} margin={{ top: 10, right: 30, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="period"
              tickFormatter={formatPeriod}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              tickFormatter={v => formatTrillion(v)}
              tick={{ fontSize: 10 }}
              width={48}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={v => `${v}%`}
              tick={{ fontSize: 10 }}
              width={40}
              domain={[-30, 30]}
            />
            <Tooltip content={<InvestTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              yAxisId="left"
              dataKey="투자액"
              fill={COLORS.primary}
              opacity={0.75}
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="right"
              dataKey="YoY%"
              stroke={COLORS.accent}
              dot={false}
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 쌍용건설 하이라이트 패널 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 회사 주요 지표 */}
        <ChartCard title="쌍용건설 핵심 현황">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Award size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">시공능력평가 순위</p>
                <p className="text-lg font-bold text-primary dark:text-blue-300">
                  {SSANGYONG.rank2024}위
                  <span className="text-sm font-medium text-emerald-600 ml-2">
                    (3년간 {SSANGYONG.rankChange3yr > 0 ? '+' : ''}{SSANGYONG.rankChange3yr}계단)
                  </span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '매출액', value: `${(SSANGYONG.revenue2025 / 10000).toFixed(1)}조`, sub: '2025년(E)' },
                { label: '수주잔고', value: `${(SSANGYONG.backlog2025 / 10000).toFixed(1)}조`, sub: '2025년(E)' },
                { label: '부채비율', value: `${SSANGYONG.debtRatio2025}%`, sub: `↓ ${SSANGYONG.debtRatio2022}%(2022)` },
              ].map(item => (
                <div key={item.label} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{item.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* 주요 수주 프로젝트 */}
        <ChartCard title="주요 수주 프로젝트">
          <div className="space-y-2">
            {SSANGYONG.keyProjects.map(p => (
              <div
                key={p.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                    p.type === '토목' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    p.type === '해외건축' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                  }`}>
                    {p.type}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{p.name}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {p.amount ? `${(p.amount / 10000).toFixed(2)}조` : '-'}
                  </p>
                  <p className="text-xs text-gray-400">{p.year}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
