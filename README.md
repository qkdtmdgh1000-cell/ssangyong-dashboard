# 공공건설 시장분석 대시보드

> **쌍용건설 공공영업 포트폴리오** | React SPA 데이터 분석 대시보드

## 개요

2026년 한국 공공건설 시장 인텔리전스 대시보드입니다. KOSIS(국가통계포털) Open API로 수집한 실제 데이터를 기반으로 6개 섹션의 인터랙티브 시각화를 제공합니다.

## 섹션 구성

| 섹션 | 내용 |
|------|------|
| A. Executive Summary | 공공수주 KPI · 공공 vs 민간 수주 추이 · 건설투자 YoY |
| B. 발주 파이프라인 | 공종별 수주 비중 · 월별 계절성 히트맵 · 건축허가 추이 |
| C. 지역별 분석 | D3-geo 코로플레스 지도 · 수도권 vs 비수도권 양극화 |
| D. 경쟁환경 분석 | 시공능력평가 순위 변동 · 재무지표 비교 · 벤치마크 테이블 |
| E. 정책·예산 트래커 | SOC 예산 워터폴 차트 · 정책 타임라인 |
| F. 전망 및 전략 | Fan Chart 시나리오 전망 · SWOT · 전략 로드맵 |

## 데이터 소스

- [KOSIS 국가통계포털](https://kosis.kr) Open API (6개 통계표)
  - 건설수주액 (발주자별·공종별)
  - 건설투자 (경상)
  - 미분양주택현황 (시도별)
  - 건설업 취업자 (행정구역별)
  - 건축허가 (시도별)
  - 건설수주액 보조 데이터 (건설산업지식정보시스템)

## 기술 스택

```
React 19 + Vite 8
Tailwind CSS 3.4
Recharts 2.12  (시계열·히트맵·워터폴·Fan Chart)
D3.js 7 + topojson-client  (코로플레스 지도)
React Router v6
```

## 로컬 실행

```bash
# 데이터 수집 (최초 1회)
pip install requests
python scripts/fetch_data.py

# 개발 서버
npm install
npm run dev
```

## GitHub Pages 배포

```bash
# vite.config.js base 또는 환경변수 설정
VITE_BASE_URL=/ssangyong-dashboard/ npm run build

# 또는 package.json predeploy 스크립트 사용
npm run deploy
```

## 주요 특징

- **다크모드** 지원 (시스템 설정 자동 감지 + 수동 토글)
- **반응형**: 데스크탑 사이드바 / 모바일 하단 탭바
- **코드 분할**: 페이지별 lazy import로 초기 로딩 최적화
- **실제 데이터**: 하드코딩 없이 KOSIS API 수집 JSON 사용
