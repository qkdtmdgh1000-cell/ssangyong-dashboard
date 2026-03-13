import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/config';
import {
  LayoutDashboard, BarChart3, Map, Users, FileText, TrendingUp, Moon, Sun
} from 'lucide-react';

const ICONS = { LayoutDashboard, BarChart3, Map, Users, FileText, TrendingUp };

// 공통 NavLink 스타일
function NavItem({ item, collapsed = false, onClick }) {
  const Icon = ICONS[item.icon];
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
        }`
      }
    >
      {Icon && <Icon size={18} className="flex-shrink-0" />}
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ darkMode, setDarkMode }) {
  return (
    <>
      {/* ── 데스크탑 사이드바 ─────────────────────── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-col z-40">
        {/* 로고 */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">쌍</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">쌍용건설</p>
              <p className="text-xs text-gray-400">공공영업 포트폴리오</p>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 px-3 pt-2 pb-1.5 uppercase tracking-wider">
            분석 섹션
          </p>
          {NAV_ITEMS.map(item => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* 다크모드 토글 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setDarkMode(d => !d)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? '라이트 모드' : '다크 모드'}
          </button>
        </div>
      </aside>

      {/* ── 모바일 하단 탭바 ─────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center">
        {NAV_ITEMS.map(item => {
          const Icon = ICONS[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors ${
                  isActive
                    ? 'text-primary dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-primary/10 dark:bg-blue-900/40' : ''}`}>
                    {Icon && <Icon size={18} />}
                  </div>
                  <span className="leading-none truncate w-full text-center px-0.5" style={{ fontSize: 9 }}>
                    {item.label.split(' ')[0]}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
