import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ darkMode, setDarkMode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* 데스크탑: 사이드바 너비만큼 오프셋, 모바일: 하단 탭바 높이만큼 패딩 */}
      <div className="md:ml-60 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
