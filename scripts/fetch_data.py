"""KOSIS Open API 데이터 수집 스크립트"""
import requests
import json
import os

KOSIS_URLS = {
    "construction_orders": "https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=ZjgxZWY1ZjJiZTUyOTU3M2U5NDRlODJjYzQxOGVkZjI=&itmId=T10+&objL1=0+1+2+3+4+&objL2=0+1+2+&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=M&startPrdDe=201901&endPrdDe=202601&orgId=101&tblId=DT_1G1B002",
    "unsold_housing": "https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=ZjgxZWY1ZjJiZTUyOTU3M2U5NDRlODJjYzQxOGVkZjI=&itmId=13103871087T1+&objL1=ALL&objL2=ALL&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=M&startPrdDe=201901&endPrdDe=202601&orgId=101&tblId=DT_1YL202004E",
    "construction_employment": "https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=ZjgxZWY1ZjJiZTUyOTU3M2U5NDRlODJjYzQxOGVkZjI=&itmId=T1+&objL1=ALL&objL2=ALL&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=H&startPrdDe=201901&endPrdDe=202502&orgId=101&tblId=DT_1ES3C06S",
    "building_permits": "https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=ZjgxZWY1ZjJiZTUyOTU3M2U5NDRlODJjYzQxOGVkZjI=&itmId=13103792710T1+13103792710T2+13103792710T3+13103792710T4+13103792710T5+13103792710T6+13103792710T7+&objL1=ALL&objL2=13102792710B.0001+&objL3=13102792710C.0001+&objL4=13102792710D.0001+&objL5=13102792710E.0001+&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=M&startPrdDe=201901&endPrdDe=202601&orgId=116&tblId=DT_MLTM_2200",
    "construction_orders_alt": "https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=ZjgxZWY1ZjJiZTUyOTU3M2U5NDRlODJjYzQxOGVkZjI=&itmId=16365AAC7+&objL1=ALL&objL2=&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=M&startPrdDe=201901&endPrdDe=202512&orgId=365&tblId=TX_36505_A000",
    "construction_investment": "https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=ZjgxZWY1ZjJiZTUyOTU3M2U5NDRlODJjYzQxOGVkZjI=&itmId=T30+&objL1=0+1+2+&objL2=&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=M&startPrdDe=201901&endPrdDe=202601&orgId=101&tblId=DT_1G18007",
}

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
os.makedirs(OUTPUT_DIR, exist_ok=True)

for name, url in KOSIS_URLS.items():
    print(f"\n{'='*60}")
    print(f"수집 중: {name}")
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()

        # KOSIS는 에러도 200으로 반환. dict면 에러, list면 정상.
        if isinstance(data, dict):
            print(f"  에러 응답: {data}")
            continue

        print(f"  레코드 수: {len(data)}")

        # 주요 컬럼 확인
        if data:
            sample = data[0]
            print(f"  컬럼: {list(sample.keys())}")
            # 분류값 확인
            for col in ['C1_NM', 'C2_NM', 'C3_NM', 'ITM_NM']:
                if col in sample:
                    unique_vals = list(set(row.get(col, '') for row in data))
                    print(f"  {col} 고유값: {unique_vals[:10]}")
            # 시점 범위
            periods = sorted(set(row.get('PRD_DE', '') for row in data))
            print(f"  시점 범위: {periods[0]} ~ {periods[-1]} ({len(periods)}개)")

        # DT 값 정제: "-", "…", "x", 빈문자열 → None, 천단위 쉼표 제거
        for row in data:
            if 'DT' in row:
                val = row['DT']
                if val in ['-', '…', 'x', '', None]:
                    row['DT'] = None
                else:
                    try:
                        row['DT'] = float(str(val).replace(',', ''))
                    except (ValueError, TypeError):
                        row['DT'] = None

        filepath = os.path.join(OUTPUT_DIR, f'{name}.json')
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  저장 완료: {filepath}")

    except Exception as e:
        print(f"  실패: {e}")

print(f"\n{'='*60}")
print("데이터 수집 완료!")
