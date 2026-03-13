/**
 * 데이터 소스별 시도명 → TopoJSON 시도명 매핑
 */

// unsold_housing C1_NM (짧은 이름) → TopoJSON name
export const UNSOLD_TO_TOPO = {
  '서울': '서울특별시',
  '부산': '부산광역시',
  '대구': '대구광역시',
  '인천': '인천광역시',
  '광주': '광주광역시',
  '대전': '대전광역시',
  '울산': '울산광역시',
  '세종': '세종특별자치시',
  '경기': '경기도',
  '강원': '강원도',
  '충북': '충청북도',
  '충남': '충청남도',
  '전북': '전라북도',
  '전남': '전라남도',
  '경북': '경상북도',
  '경남': '경상남도',
  '제주': '제주특별자치도',
};

// building_permits C1_NM → TopoJSON name (강원특별자치도 등 신규 명칭 처리)
export const PERMITS_TO_TOPO = {
  '서울특별시': '서울특별시',
  '부산광역시': '부산광역시',
  '대구광역시': '대구광역시',
  '인천광역시': '인천광역시',
  '광주광역시': '광주광역시',
  '대전광역시': '대전광역시',
  '울산광역시': '울산광역시',
  '세종특별자치시': '세종특별자치시',
  '경기도': '경기도',
  '강원특별자치도': '강원도',
  '충청북도': '충청북도',
  '충청남도': '충청남도',
  '전북특별자치도': '전라북도',
  '전라남도': '전라남도',
  '경상북도': '경상북도',
  '경상남도': '경상남도',
  '제주특별자치도': '제주특별자치도',
};

export const METROPOLITAN_FULL = ['서울특별시', '인천광역시', '경기도'];

export function isMetro(topoName) {
  return METROPOLITAN_FULL.includes(topoName);
}

// 시도 표시용 짧은 이름
export function shortName(fullName) {
  return fullName
    .replace('특별자치시', '').replace('특별자치도', '')
    .replace('특별시', '').replace('광역시', '').replace('도', '');
}
