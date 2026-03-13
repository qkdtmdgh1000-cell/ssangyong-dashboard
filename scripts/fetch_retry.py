"""실패한 KOSIS API 재시도 + unsold_housing 분할 수집"""
import requests
import json
import os
import time

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def fetch_and_save(name, url, max_retries=3):
    for attempt in range(max_retries):
        try:
            print(f"  시도 {attempt+1}/{max_retries}...")
            response = requests.get(url, timeout=60)
            response.raise_for_status()
            data = response.json()
            if isinstance(data, dict):
                print(f"  에러 응답: {data}")
                return None
            # DT 정제
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
            print(f"  레코드 수: {len(data)}")
            if data:
                for col in ['C1_NM', 'C2_NM', 'ITM_NM']:
                    if col in data[0]:
                        vals = list(set(row.get(col, '') for row in data))
                        print(f"  {col}: {vals[:10]}")
                periods = sorted(set(row.get('PRD_DE', '') for row in data))
                print(f"  시점: {periods[0]} ~ {periods[-1]}")
            filepath = os.path.join(OUTPUT_DIR, f'{name}.json')
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  저장: {filepath}")
            return data
        except Exception as e:
            print(f"  실패: {e}")
            if attempt < max_retries - 1:
                time.sleep(3)
    return None

# 1) construction_orders 재시도
print("=" * 60)
print("construction_orders 재시도")
fetch_and_save("construction_orders",
    "https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=ZjgxZWY1ZjJiZTUyOTU3M2U5NDRlODJjYzQxOGVkZjI=&itmId=T10+&objL1=0+1+2+3+4+&objL2=0+1+2+&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=M&startPrdDe=201901&endPrdDe=202601&orgId=101&tblId=DT_1G1B002")

time.sleep(2)

# 2) construction_employment 재시도
print("=" * 60)
print("construction_employment 재시도")
fetch_and_save("construction_employment",
    "https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=ZjgxZWY1ZjJiZTUyOTU3M2U5NDRlODJjYzQxOGVkZjI=&itmId=T1+&objL1=ALL&objL2=ALL&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=H&startPrdDe=201901&endPrdDe=202502&orgId=101&tblId=DT_1ES3C06S")

time.sleep(2)

# 3) unsold_housing - 연도별 분할 수집 (4만건 초과 방지)
print("=" * 60)
print("unsold_housing 분할 수집")
all_unsold = []
# 시도별만 (objL2=0으로 시도 합계만)
periods = [("201901","202012"), ("202101","202212"), ("202301","202601")]
for start, end in periods:
    print(f"  기간: {start}~{end}")
    url = f"https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=ZjgxZWY1ZjJiZTUyOTU3M2U5NDRlODJjYzQxOGVkZjI=&itmId=13103871087T1+&objL1=ALL&objL2=0+&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=M&startPrdDe={start}&endPrdDe={end}&orgId=101&tblId=DT_1YL202004E"
    result = fetch_and_save(f"unsold_housing_{start}", url)
    if result:
        all_unsold.extend(result)
    time.sleep(2)

if all_unsold:
    filepath = os.path.join(OUTPUT_DIR, 'unsold_housing.json')
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(all_unsold, f, ensure_ascii=False, indent=2)
    print(f"unsold_housing 통합 저장: {len(all_unsold)}건")
    # 임시 파일 삭제
    for start, end in periods:
        tmp = os.path.join(OUTPUT_DIR, f'unsold_housing_{start}.json')
        if os.path.exists(tmp):
            os.remove(tmp)

print("\n완료!")
