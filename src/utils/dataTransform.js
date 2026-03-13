/**
 * KOSIS 원시 데이터를 차트용 데이터로 변환
 */

// 월별 시계열 데이터로 변환 (특정 분류 기준 그룹핑)
export function toTimeSeries(rawData, { groupBy = 'C1_NM', valueKey = 'DT', periodKey = 'PRD_DE' } = {}) {
  const grouped = {};

  rawData.forEach(row => {
    const period = row[periodKey];
    const group = row[groupBy] || '전체';
    const value = row[valueKey];

    if (!grouped[period]) grouped[period] = { period };
    grouped[period][group] = (grouped[period][group] || 0) + (value || 0);
  });

  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
}

// 특정 분류값으로 필터링
export function filterBy(data, field, value) {
  return data.filter(row => row[field] === value);
}

// 최근 N개월 데이터 추출
export function getRecentMonths(data, n = 12, periodKey = 'PRD_DE') {
  const periods = [...new Set(data.map(r => r[periodKey]))].sort().slice(-n);
  return data.filter(r => periods.includes(r[periodKey]));
}

// 연도별 합산
export function aggregateByYear(data, { groupBy = 'C1_NM', valueKey = 'DT', periodKey = 'PRD_DE' } = {}) {
  const result = {};

  data.forEach(row => {
    const year = row[periodKey]?.substring(0, 4);
    const group = row[groupBy] || '전체';
    const value = row[valueKey];
    if (!year || value == null) return;

    if (!result[year]) result[year] = { year };
    result[year][group] = (result[year][group] || 0) + value;
  });

  return Object.values(result).sort((a, b) => a.year.localeCompare(b.year));
}

// 고유값 목록
export function uniqueValues(data, field) {
  return [...new Set(data.map(r => r[field]).filter(Boolean))].sort();
}
