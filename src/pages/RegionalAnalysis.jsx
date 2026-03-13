import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LineChart, Line, ReferenceLine,
} from 'recharts';
import { useMultiData } from '../hooks/useData';
import { DATA_FILES } from '../constants/config';
import { COLORS } from '../constants/colors';
import { UNSOLD_TO_TOPO, PERMITS_TO_TOPO, isMetro, shortName } from '../utils/regionMap';
import { yoyGrowth } from '../utils/statistics';
import ChartCard from '../components/common/ChartCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import KoreaMap from '../components/charts/KoreaMap';
import { useData } from '../hooks/useData';
import { formatPeriod } from '../utils/format';

const MODES = [
  { key: 'unsold', label: '미분양 주택', unit: '호', color: 'orange' },
  { key: 'permits', label: '건축허가', unit: '동', color: 'blue' },
];

export default function RegionalAnalysis() {
  const [mode, setMode] = useState('unsold');
  const [selectedRegion, setSelectedRegion] = useState(null);

  const { data: topoData } = useData('/data/korea_topo.json');
  const { data, loading, error } = useMultiData({
    unsold: DATA_FILES.unsoldHousing,
    permits: DATA_FILES.buildingPermits,
  });

  // 최신 기간 결정
  const latestPeriod = useMemo(() => {
    if (!data.unsold) return null;
    return [...new Set(data.unsold.map(r => r.PRD_DE))]
      .filter(p => data.unsold.some(r => r.PRD_DE === p && r.DT != null))
      .sort().at(-1);
  }, [data.unsold]);

  const latestPermitPeriod = useMemo(() => {
    if (!data.permits) return null;
    return [...new Set(
      data.permits.filter(r => r.C1_NM !== '총계' && r.ITM_NM === '계' && r.DT != null).map(r => r.PRD_DE)
    )].sort().at(-1);
  }, [data.permits]);

  // 지도용 valueMap
  const valueMap = useMemo(() => {
    if (mode === 'unsold' && data.unsold && latestPeriod) {
      const map = {};
      data.unsold.filter(r => r.PRD_DE === latestPeriod && r.DT != null).forEach(r => {
        const topoName = UNSOLD_TO_TOPO[r.C1_NM];
        if (topoName) map[topoName] = (map[topoName] || 0) + r.DT;
      });
      return map;
    }
    if (mode === 'permits' && data.permits && latestPermitPeriod) {
      const map = {};
      data.permits.filter(r =>
        r.PRD_DE === latestPermitPeriod && r.ITM_NM === '계' && r.C1_NM !== '총계' && r.DT != null
      ).forEach(r => {
        const topoName = PERMITS_TO_TOPO[r.C1_NM];
        if (topoName) map[topoName] = (map[topoName] || 0) + r.DT;
      });
      return map;
    }
    return {};
  }, [mode, data, latestPeriod, latestPermitPeriod]);

  // 선택 지역 시계열 데이터
  const regionTimeSeries = useMemo(() => {
    if (!selectedRegion) return [];
    if (mode === 'unsold' && data.unsold) {
      const shortKey = Object.entries(UNSOLD_TO_TOPO).find(([, v]) => v === selectedRegion)?.[0];
      if (!shortKey) return [];
      return data.unsold
        .filter(r => r.C1_NM === shortKey && r.DT != null)
        .map(r => ({ period: r.PRD_DE, value: r.DT }))
        .sort((a, b) => a.period.localeCompare(b.period));
    }
    if (mode === 'permits' && data.permits) {
      const permitsKey = Object.entries(PERMITS_TO_TOPO).find(([, v]) => v === selectedRegion)?.[0];
      if (!permitsKey) return [];
      return data.permits
        .filter(r => r.C1_NM === permitsKey && r.ITM_NM === '계' && r.DT != null)
        .map(r => ({ period: r.PRD_DE, value: r.DT }))
        .sort((a, b) => a.period.localeCompare(b.period));
    }
    return [];
  }, [selectedRegion, mode, data]);

  // 수도권 vs 비수도권 비교 (최근 3년 연도별 합산)
  const metroComparison = useMemo(() => {
    if (!data.unsold) return [];
    const years = ['2022', '2023', '2024', '2025'];
    return years.map(year => {
      let metro = 0, nonMetro = 0;
      data.unsold.filter(r => r.PRD_DE.startsWith(year) && r.DT != null).forEach(r => {
        const topoName = UNSOLD_TO_TOPO[r.C1_NM];
        if (!topoName) return;
        if (isMetro(topoName)) metro += r.DT;
        else nonMetro += r.DT;
      });
      return { year, '수도권': Math.round(metro / 12), '비수도권': Math.round(nonMetro / 12) };
    });
  }, [data.unsold]);

  // 수도권 미분양 월별 추이
  const metroTrend = useMemo(() => {
    if (!data.unsold) return [];
    const byPeriod = {};
    data.unsold.filter(r => r.DT != null).forEach(r => {
      const topoName = UNSOLD_TO_TOPO[r.C1_NM];
      if (!topoName) return;
      if (!byPeriod[r.PRD_DE]) byPeriod[r.PRD_DE] = { period: r.PRD_DE, '수도권': 0, '비수도권': 0 };
      if (isMetro(topoName)) byPeriod[r.PRD_DE]['수도권'] += r.DT;
      else byPeriod[r.PRD_DE]['비수도권'] += r.DT;
    });
    return Object.values(byPeriod).sort((a, b) => a.period.localeCompare(b.period));
  }, [data.unsold]);

  const currentMode = MODES.find(m => m.key === mode);
  const formatVal = v => `${v.toLocaleString()}${currentMode.unit}`;

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">데이터 로드 실패: {error}</div>;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">지역별 양극화 분석</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            수도권 vs 비수도권 · 시도별 시장 현황
          </p>
        </div>
        {/* 지표 토글 */}
        <div className="flex gap-2">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setSelectedRegion(null); }}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                mode === m.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 코로플레스 지도 */}
        <div className="lg:col-span-1">
          <ChartCard
            title={`시도별 ${currentMode.label}`}
            subtitle={`기준: ${formatPeriod(mode === 'unsold' ? latestPeriod : latestPermitPeriod)} · 클릭 시 상세`}
          >
            {topoData ? (
              <KoreaMap
                topoData={topoData}
                valueMap={valueMap}
                colorScheme={currentMode.color}
                onRegionClick={setSelectedRegion}
                selectedRegion={selectedRegion}
                formatValue={formatVal}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                지도 로딩 중...
              </div>
            )}
          </ChartCard>
        </div>

        {/* 우측 패널 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 선택 지역 상세 카드 */}
          {selectedRegion ? (
            <ChartCard
              title={`${selectedRegion} · ${currentMode.label} 추이`}
              subtitle="월별 시계열 (클릭으로 지역 선택)"
            >
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={regionTimeSeries} margin={{ top: 5, right: 15, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" tickFormatter={formatPeriod} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tickFormatter={v => v.toLocaleString()} tick={{ fontSize: 10 }} width={60} />
                  <Tooltip
                    formatter={v => [formatVal(v), currentMode.label]}
                    labelFormatter={formatPeriod}
                  />
                  <Line
                    type="monotone" dataKey="value"
                    stroke={currentMode.color === 'orange' ? COLORS.accent : COLORS.chart.public}
                    dot={false} strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  { label: '최신값', val: regionTimeSeries.at(-1)?.value },
                  { label: '최대값', val: Math.max(...regionTimeSeries.map(r => r.value || 0)) || null },
                  { label: '최소값', val: Math.min(...regionTimeSeries.filter(r => r.value > 0).map(r => r.value)) || null },
                ].map(item => (
                  <div key={item.label} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                      {item.val != null ? item.val.toLocaleString() : '-'}{currentMode.unit}
                    </p>
                  </div>
                ))}
              </div>
            </ChartCard>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
              지도에서 시도를 클릭하면 해당 지역의 상세 추이를 확인할 수 있습니다.
            </div>
          )}

          {/* 수도권 vs 비수도권 월별 추이 */}
          <ChartCard
            title="수도권 vs 비수도권 미분양 추이"
            subtitle="수도권(서울·인천·경기) vs 비수도권 · 월별"
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={metroTrend} margin={{ top: 5, right: 15, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" tickFormatter={formatPeriod} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}천`} tick={{ fontSize: 10 }} width={45} />
                <Tooltip
                  formatter={v => [`${v.toLocaleString()}호`, '']}
                  labelFormatter={formatPeriod}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="수도권" stroke={COLORS.chart.public} dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="비수도권" stroke={COLORS.accent} dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 연도별 수도권 vs 비수도권 Bar */}
          <ChartCard
            title="연도별 평균 미분양 비교"
            subtitle="연도별 월평균 미분양 호수 (수도권 vs 비수도권)"
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metroComparison} margin={{ top: 5, right: 15, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}천`} tick={{ fontSize: 10 }} width={45} />
                <Tooltip formatter={v => [`${v.toLocaleString()}호`, '']} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="수도권" fill={COLORS.chart.public} radius={[3, 3, 0, 0]} />
                <Bar dataKey="비수도권" fill={COLORS.accent} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
