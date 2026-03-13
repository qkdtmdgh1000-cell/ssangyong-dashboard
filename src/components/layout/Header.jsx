import { useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/config';

export default function Header() {
  const { pathname } = useLocation();
  const current = NAV_ITEMS.find(item =>
    item.path === '/' ? pathname === '/' : pathname.startsWith('/' + item.path.replace('/', ''))
  );
  const pageTitle = current?.label || 'Executive Summary';

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center px-4 md:px-6 gap-4">
      {/* 모바일: 페이지 타이틀 */}
      <div className="flex-1 md:flex-none">
        <h2 className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100 truncate">
          <span className="hidden md:inline">공공건설 시장분석 대시보드 — </span>
          {pageTitle}
        </h2>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden sm:inline text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          데이터 기준 2026.01
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          KOSIS
        </span>
      </div>
    </header>
  );
}
