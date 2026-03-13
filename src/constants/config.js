const BASE = import.meta.env.BASE_URL;

export const DATA_FILES = {
  constructionOrders: `${BASE}data/construction_orders.json`,
  unsoldHousing: `${BASE}data/unsold_housing.json`,
  constructionEmployment: `${BASE}data/construction_employment.json`,
  buildingPermits: `${BASE}data/building_permits.json`,
  constructionOrdersAlt: `${BASE}data/construction_orders_alt.json`,
  constructionInvestment: `${BASE}data/construction_investment.json`,
};

export const METROPOLITAN = ['서울특별시', '인천광역시', '경기도'];

export const NAV_ITEMS = [
  { path: '/', label: 'Executive Summary', icon: 'LayoutDashboard' },
  { path: '/pipeline', label: '발주 파이프라인', icon: 'BarChart3' },
  { path: '/regional', label: '지역별 분석', icon: 'Map' },
  { path: '/competitor', label: '경쟁환경 분석', icon: 'Users' },
  { path: '/policy', label: '정책·예산', icon: 'FileText' },
  { path: '/outlook', label: '전망·전략', icon: 'TrendingUp' },
];
