import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// 코드 분할: 각 페이지를 동적 import
const ExecutiveSummary   = lazy(() => import('./pages/ExecutiveSummary'));
const OrderPipeline      = lazy(() => import('./pages/OrderPipeline'));
const RegionalAnalysis   = lazy(() => import('./pages/RegionalAnalysis'));
const CompetitorBenchmark = lazy(() => import('./pages/CompetitorBenchmark'));
const PolicyTracker      = lazy(() => import('./pages/PolicyTracker'));
const OutlookStrategy    = lazy(() => import('./pages/OutlookStrategy'));

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // 시스템 다크모드 또는 저장된 설정 우선
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <Routes>
      <Route element={<DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />}>
        <Route index element={
          <Suspense fallback={<LoadingSpinner />}><ExecutiveSummary /></Suspense>
        } />
        <Route path="pipeline" element={
          <Suspense fallback={<LoadingSpinner />}><OrderPipeline /></Suspense>
        } />
        <Route path="regional" element={
          <Suspense fallback={<LoadingSpinner />}><RegionalAnalysis /></Suspense>
        } />
        <Route path="competitor" element={
          <Suspense fallback={<LoadingSpinner />}><CompetitorBenchmark /></Suspense>
        } />
        <Route path="policy" element={
          <Suspense fallback={<LoadingSpinner />}><PolicyTracker /></Suspense>
        } />
        <Route path="outlook" element={
          <Suspense fallback={<LoadingSpinner />}><OutlookStrategy /></Suspense>
        } />
      </Route>
    </Routes>
  );
}
