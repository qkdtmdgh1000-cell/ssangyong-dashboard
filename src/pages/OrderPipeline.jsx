import { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { useMultiData } from '../hooks/useData';
import { DATA_FILES } from '../constants/config';
import { COLORS } from '../constants/colors';
import { formatBillion, formatTrillion, formatPeriod } from '../utils/format';
import ChartCard from '../components/common/ChartCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

// 월별 수주 히트맵 (SVG 직접 그리기)
function HeatmapChart({ data }) {
  const years = [...new Set(data.map(d => d.year))].sort();
  const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const monthLabels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // 데이터를 year-month 맵으로 변환
  const valueMap = {};
  let maxVal = 0;
  data.forEach(d => {
    const key = `${d.year}-${d.month}`;
    valueMap[key] = (valueMap[key] || 0) + d.value;
    if (valueMap[key] > maxVal) maxVal = valueMap[key];
  });

  const cellW = 44, cellH = 32, paddingL = 48, paddingT = 36;
  const svgW = paddingL + months.length * cellW + 20;
  const svgH = paddingT + years.length * cellH + 20;

  function getColor(val) {
    if (!val) return '#f3f4f6';
    const ratio = val / maxVal;
    if (ratio > 0.75) return '#1d4ed8';
    if (ratio > 0.5) return '#3b82f6';
    if (ratio > 0.25) return '#93c5fd';
    return '#dbeafe';
  }

  return (
    <div className="overflow-x-auto">
      <svg width={svgW} height={svgH} className="font-sans">
        {/* 월 레이블 */}
        {months.map((m, i) => (
          <text
            key={m}
            x={paddingL + i * cellW + cellW / 2}
            y={paddingT - 6}
            textAnchor="middle"
            fontSize={11}
            fill="#6b7280"
          >{monthLabels[i]}</text>
        ))}
        {/* 연도 레이블 + 셀 */}
        {years.map((year, yi) => (
          <g key={year}>
            <text
              x={paddingL - 8}
              y={paddingT + yi * cellH + cellH / 2 + 4}
              textAnchor="end"
              fontSize={11}
              fill="#6b7280"
            >{year}</text>
            {months.map((m, mi) => {
              const val = valueMap[`${year}-${m}`] || 0;
              return (
                <g key={m}>
                  <rect
                    x={paddingL + mi * cellW + 2}
                    y={paddingT + yi * cellH + 2}
                    width={cellW - 4}
                    height={cellH - 4}
                    rx={3}
                    fill={getColor(val)}
                  />
                  {val > 0 && (
                    <title>{`${year}년 ${m}월: ${formatBillion(val)}`}</title>
                  )}
                </g>
              );
            })}
          </g>
        ))}
        {/* 범례 */}
        {['낮음', '', '', '높음'].map((label, i) => {
          const colors = ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'];
          return (
            <g key={i} transform={`translate(${paddingL + i * 60}, ${svgH - 14})`}>
              <rect width={52} height={10} rx={2} fill={colors[i]} />
              {(i === 0 || i === 3) && (
                <text x={i === 0 ? 0 : 52} y={22} fontSize={10} fill="#9ca3af"
                  textAnchor={i === 0 ? 'start' : 'end'}>{label}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function OrderPipeline() {
  const [yearFilter, setYearFilter] = useState('all');

  const { data, loading, error } = useMultiData({
    orders: DATA_FILES.constructionOrders,
    permits: DATA_FILES.buildingPermits,
  });

  // 공종별 수주 비중 (Stacked Bar - 연도별)
  const stackedData = useMemo(() => {
    if (!data.orders) return [];
    const rows = data.orders.filter(r =>
      r.C1_NM === '공공부문' && r.C2_NM !== '계' && r.DT != null
    );
    const byYear = {};
    rows.forEach(r => {
      const year = r.PRD_DE.slice(0, 4);
      if (yearFilter !== 'all' && year !== yearFilter) return;
      if (!byYear[year]) byYear[year] = { year };
      byYear[year][r.C2_NM] = (byYear[year][r.C2_NM] || 0) + r.DT;
    });
    return Object.values(byYear).sort((a, b) => a.year.localeCompare(b.year));
  }, [data.orders, yearFilter]);

  // 히트맵 데이터 (공공 수주, 월별)
  const heatmapData = useMemo(() => {
    if (!data.orders) return [];
    return data.orders
      .filter(r => r.C1_NM === '공공부문' && r.C2_NM === '계' && r.DT != null)
      .map(r => ({
        year: r.PRD_DE.slice(0, 4),
        month: String(parseInt(r.PRD_DE.slice(4))),
        value: r.DT,
      }));
  }, [data.orders]);

  // 건축허가 추이 (전국 총계, 동수 기준)
  const permitsData = useMemo(() => {
    if (!data.permits) return [];
    const rows = data.permits.filter(r =>
      r.C1_NM === '총계' && r.ITM_NM === '계' && r.DT != null
    );
    return rows
      .map(r => ({ period: r.PRD_DE, value: r.DT }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [data.permits]);

  const years = useMemo(() => {
    if (!data.orders) return [];
    return [...new Set(data.orders.map(r => r.PRD_DE.slice(0, 4)))].sort();
  }, [data.orders]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">데이터 로드 실패: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">발주 파이프라인 분석</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            공종별 수주 비중 · 계절성 분석 · 건축허가 선행지표
          </p>
        </div>
        {/* 연도 필터 */}
        <div className="flex gap-2">
          <button
            onClick={() => setYearFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
              yearFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {years.filter(y => y >= '2022').map(y => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                yearFilter === y
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* 공종별 수주 비중 (공공부문) */}
      <ChartCard
        title="공공부문 공종별 수주액 (연도별)"
        subtitle="토목 vs 건축 비중 · 연도별 Stacked Bar"
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={stackedData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={v => formatTrillion(v)}
              tick={{ fontSize: 10 }}
              width={50}
            />
            <Tooltip
              formatter={(v, name) => [formatBillion(v), name]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="토목" name="토목" stackId="a" fill={COLORS.subsector['토목']} radius={[0, 0, 0, 0]} />
            <Bar dataKey="건축" name="건축" stackId="a" fill={COLORS.subsector['건축']} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 월별 수주 히트맵 */}
      <ChartCard
        title="공공수주 월별 계절성 히트맵"
        subtitle="예산 조기집행(1~3월), 연말정산(11~12월) 패턴"
      >
        <HeatmapChart data={heatmapData} />
        <p className="text-xs text-gray-400 mt-3">
          색이 진할수록 수주액 높음 · 마우스 오버 시 금액 확인
        </p>
      </ChartCard>

      {/* 건축허가 추이 */}
      <ChartCard
        title="건축허가 추이 (선행지표)"
        subtitle="전국 총계 · 월별 건축허가 동수"
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={permitsData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="period"
              tickFormatter={formatPeriod}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={v => `${v.toLocaleString()}동`}
              tick={{ fontSize: 10 }}
              width={65}
            />
            <Tooltip
              formatter={v => [`${v.toLocaleString()}동`, '건축허가']}
              labelFormatter={formatPeriod}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="value"
              name="건축허가 동수"
              stroke={COLORS.primary}
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
