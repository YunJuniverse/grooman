# KPI 단위경제 트리 (Unit Economics) — 템플릿

> 용도: 수익모델을 매출→이익으로 분해 + 단위경제·리텐션·자본효율 진단. 지침 `20_guides/10_사업기획서_작성_지침.md` §19.3(트리)·§19.11(마켓플레이스 10-패널·AAARR·LTV/CAC — 여기서 중복 안 함) 참조.
> **두 트리는 상보적**: *마진 워터폴*(§1)은 "돈이 어디로 가나"(재무), *드라이버 트리*(§6)는 "어떤 레버가 결과를 움직이나"(인과). 둘 다 쓴다.

## 1. Top-line → 마진 워터폴 (비즈모델 토글)
> 비즈모델에 맞는 top-line 하나를 고르고, 아래는 공통 `Gross Margin → Contribution Margin`으로 흐른다.

- **마켓플레이스(기본)**: `GMV(결제−취소) → Net Revenue(GMV×take rate)`
- **구독/SaaS**: `기초 MRR + New + Expansion − Contraction − Churn = 기말 MRR ×12=ARR` (§3 NRR/GRR로 연결)
- **거래/커머스**: `주문수 × AOV = Gross Revenue − 할인·반품 = Net Revenue`
- **사용량/AI**: `활성유저 × 유저당 사용량 × 단가 = Usage Revenue` (변동 COGS에 추론/토큰비 — §5)

| 지표 | 정의 | 공식 |
|---|---|---|
| **Top-line** | (택1) GMV / ARR / Gross Revenue / Usage Revenue | 위 토글 |
| **Net Revenue** | 순매출 | Top-line − (취소·할인·pass-through) |
| **Gross Margin** | 매출이익 | Net Revenue − COGS(변동 원가) |
| **Contribution Margin** | 기여이익 | Gross Margin − 나머지 변동비(결제·CS·물류·CAC 등) |

## 2. 단위경제 (Unit Economics)
> LTV는 **매출-LTV 아님 → gross-margin LTV**가 헤드라인(cost-to-serve 반영). payback도 *gross margin* 기준.

| 지표 | 공식 | 기준(2025-26) |
|---|---|---|
| **CAC** | 총 S&M 지출 ÷ 신규 고객수 (blended·paid 각각) | — |
| **LTV (gross-margin)** | ARPA × GM% ÷ churn (= ARPA×GM%×평균수명, 수명=1/churn) | — |
| **LTV:CAC** | LTV ÷ CAC | **3:1 하한 · 3~5:1 스윗스팟 · >5:1은 성장 과소투자 신호** |
| **CAC Payback** | CAC ÷ (월 ARPA × GM%) | 12~24개월(SMB)·18~36(엔터). 2025 중앙값 ~18~20mo |
| **Contribution Margin / 단위(주문·유저)** | 단위 순매출 − 단위 변동비 | 스케일 전 **단위에서 (+)** |

## 3. 리텐션·매출 품질 (구독·사용량형)
| 지표 | 공식 | 기준 |
|---|---|---|
| **GRR** | (기초 − 축소 − 이탈) ÷ 기초 | 중앙값 ~90% · 상위 >95% (100% 초과 불가) |
| **NRR** | (기초 + 확장 − 축소 − 이탈) ÷ 기초 | **≥100% 양호 · ~120% 엘리트**(엔터). SMB 현실 100~110% |
| **로고 vs 매출 churn** | 로고 잃은수÷로고 / $잃은÷$ | 둘 다 추적(고가 고객 유지 = 로고>매출 churn = 건강) |
- **코호트 리텐션 커브**: 0으로 안 떨어지고 *평평해지면* PMF 신호.

## 4. 자본효율·성장품질 (2025-26 투자자 1차 스크린)
| 지표 | 공식 | good |
|---|---|---|
| **Rule of 40** | 성장% + 이익률%(EBITDA/FCF) | **≥40** (AI시대 50/60 주장도) |
| **Burn Multiple** | 순버 ÷ 순증 ARR | <1 최고 · 1~1.5 우수 · 1.5~2 양호 · 2~3 의심 · >3 나쁨 |
| **Magic Number** | 순증 ARR ÷ 직전기 S&M | >0.75 건강 · >1.0 강함 |
| **Quick Ratio** | (New+Expansion MRR) ÷ (축소+이탈 MRR) | >4 강한 성장효율 |

## 5. 원가 분해 (고정비·변동비 + AI COGS)

| 구분 | 항목 | 월 추정액 |
|---|---|---|
| 고정비 | 급여(+퇴직·상여·복리후생) / 임대료 / 외주 / 기타 | |
| 변동비 | 결제수수료 / CS / 서버 / 세금·공과 등 | |
| **변동 COGS (AI)** | **추론/토큰비 · GPU · API pass-through** (쿼리마다 증가) | |

- **AI 마진 주의**: AI gross margin **~50~60%**(SaaS 80%+ 아님) — SaaS 마진 가정 복붙 금지. 추론비 ≈ 매출 23%·평생 컴퓨트의 80~90%.
- **cost-per-active-user**: <$0.10/유저/월 → 번들 · >$1이고 변동적 → 별도 과금(사용량 tier). **워크플로우당(또는 1k 토큰당) 기여마진**으로 단가가 변동비를 덮는지 검증. 추론비는 매년 ~10x 하락 → *하락 변동비*로 모델링.

## 6. 드라이버 트리 (North Star → 입력 레버) — 워터폴과 별개
> 하나의 **North Star(산출·후행)** 를 팀이 통제하는 **입력 지표(선행 레버)** 로 인과 분해. 워터폴이 아니다.

```
North Star (예: Revenue)
 = Users × Activation × Frequency × ARPU     ← 입력 3~5개(선행)
      각 입력 → 하위 드라이버 → 팀이 소유하는 운영 지표
```
- 입력은 North Star와 인과/고상관인 *선행 지표*(Amplitude 휴리스틱: 폭·깊이·빈도·효율). 트리 3~5레벨·각 노드에 소유자.

## 7. 데이터 시트 (시계열)

| 날짜 | 판매수 | 결제금액 | 취소금액 | GMV | 수수료율 | Net Revenue | 고정비 | 변동비 | Margin |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |

---
**벤치마크 스트립 (what-good 2025-26)**: LTV:CAC 3~5 · CAC payback <18~24mo · NRR ≥100(엘리트 120) · GRR ~90 · Rule of 40 ≥40 · Burn Multiple <2 · AI GM ~55%.

**원칙**: 사업기획서의 "뒷단"(수익·KPI)은 형용사가 아니라 *수치*로. 시장규모(TAM/SAM/SOM)·객단가와 함께 채워야 완결. gross-margin LTV·gross-margin payback으로(매출 기준 과대계상 금지). 워터폴(§1)과 드라이버 트리(§6)를 혼동하지 않는다.
