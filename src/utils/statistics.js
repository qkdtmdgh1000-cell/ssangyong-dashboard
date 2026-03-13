export function yoyGrowth(current, previous) {
  if (!previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function movingAverage(arr, window = 3) {
  return arr.map((_, i) => {
    if (i < window - 1) return null;
    const slice = arr.slice(i - window + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / window;
  });
}

export const METROPOLITAN = ['서울특별시', '인천광역시', '경기도'];

export function isMetropolitan(region) {
  return METROPOLITAN.some(m => region?.includes(m.replace('특별시', '').replace('광역시', '').replace('도', '')) || region === m);
}
