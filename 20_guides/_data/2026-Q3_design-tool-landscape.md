---
doc_id: data-design-tool-landscape-2026q3
title: AI 디자인 도구 지형 — 2026-Q3 (날짜 데이터)
version: 2026-Q3
status: active
last_updated: 2026-09-21
ai_relevance: reference
---

# AI 디자인 도구 지형 — 2026-Q3

> 지침 26·27 의 **수치 부록**이다. 지침 본문은 역할·원칙·라이선스 등급만 담고, 모델명·참조 장수·단가·스펙은 여기 둔다(methodology:ADR-005).
> **분기마다 새 파일을 만든다**(덮어쓰지 않는다). 다음 재검증: 2026-Q4.
> **확인 수준** — `1차` = 제조사 문서·라이선스 원문을 직접 확인(2026-09-18~21) · `인용` = ai-icons 리서치(`40_dev/snapshots/2026-09-16_design-ai-skills-landscape-research/`) 의 출처를 따름, 반영 전 1차 확인 권장.
> 법률 자문이 아니다. 라이선스 행은 원문 요약이며 상업 사용 결정 전 법무 확인을 권한다.

## 1. 이미지 (지침 26)

| 모델 | 다중 참조·일관성 | 라이선스·면책 | 확인 |
|---|---|---|---|
| Google Nano Banana Pro (Gemini 3 Pro Image) | 참조 최대 **14장** 혼합, 그중 **캐릭터 일관성 5장** · 고충실 오브젝트 6장 | Vertex AI 경유 시 Google Cloud 생성형 AI 면책(책임 있는 사용 조건) | 1차(참조) · 인용(면책) |
| Google Nano Banana 2 (Gemini 3.1 Flash Image) | 참조 최대 14장, 캐릭터 4장 · 오브젝트 10장 | 위와 같음 | 1차 |
| FLUX.2 [pro]·[flex]·[max] (BFL API) | 참조 API **8장** · 플레이그라운드 10장 | BFL API 약관 | 1차 |
| FLUX.2 [dev] 32B | 참조 권장 최대 6장 | **FLUX [dev] 비상업 라이선스 — 업무·수익 활동에서 모델 구동 자체가 불가**(출력의 상업 사용 조항과 별개) · 경쟁 모델 학습에 출력 사용 금지 | 1차 |
| FLUX.2 [klein] 4B | 참조 4장 | **Apache-2.0 — 상업 사용 가능** | 1차 |
| FLUX.2 [klein] 9B | 참조 4장 | FLUX 비상업 라이선스 | 1차 |
| OpenAI GPT Image 2 (2026-04-21) | 참조 장수 **미확인**(리서치 출처가 루머 블로그 — 기재하지 않음) | 상업 이용 가능, 면책은 엔터프라이즈 계약 | 인용 |
| Adobe Firefly Image 5 · Custom Models | Custom Models: 30장 미만으로 스타일·캐릭터 학습(엔터프라이즈) | **Adobe 자사 모델 IP 면책**(유자격 플랜) | 인용 |
| Recraft V4.1 | 진짜 벡터(SVG) 출력 · Custom Style | 유료 플랜 전체 소유권·상업권(무료 = 소유권 없음) | 인용 |
| Ideogram 3.0 | Style Reference · Character Consistency | «생성물 소유권 주장 안 함, 상업 이용 자유» | 인용 |
| Midjourney V8.x | Edit Model 참조 4장 | **IP 정본 제작 금지(유예)** — 소송 진행 중, 면책 없음 | 인용 |

**면책이 있는 경로**: Adobe 자사 모델(유자격 플랜)과 Google Vertex(책임 있는 사용 조건) 둘뿐 — 외부 노출 산출물은 이 둘을 우선한다(인용).

**종료 예정·종료**: Gemini 2.5 Flash Image 2026-10-02 · gpt-image-1.5 2026-12-01(인용 — 해당 모델 의존 코드는 교체).

## 2. 영상 (지침 27)

| 모델 | 제어·일관성 | 길이·해상도 | 단가 | 라이선스 | 확인 |
|---|---|---|---|---|---|
| Google Veo 3.1 | 참조 이미지 3장 · first/last frame · extend(7초×최대 20회, 총 148초) · 네이티브 오디오 | 4/6/8초 · 720p·1080p·4K(8초) | 초당 $0.05~0.40(티어별) | SynthID 강제 | 인용 |
| Kling 3.0 | Elements · 멀티샷 1~6샷(총 15초 이하) · Motion Control | 3~15초 | fal 경유 Standard $0.084/초 · Pro $0.112/초(무음) | 공식 API 선불 | 인용 |
| Runway gen4.5 / gen4_turbo / act_two / aleph2 | Act-Two 연기 캡처 · Aleph 영상 편집 | 5·10초 | 초당 $0.12 / $0.05 / $0.05 / $0.28 | 크레딧 | 인용 |
| OpenAI Sora 2 | — | — | — | **웹·앱 2026-04-26 종료 · API 2026-09-24 종료 — 도입 후보 제외** | 1차 |
| Wan 2.2 (오픈) | Animate(포즈·표정 전이) | 480p·720p, 5초 | 자체 GPU | **Apache-2.0** | 1차 |
| HunyuanVideo-1.5 (오픈) | T2V·I2V | 480p/720p(+SR 1080p) | 자체 GPU | **Tencent Hunyuan Community License — 원문 첫 줄: EU·영국·한국에서는 적용되지 않는다.** 한국 법인·사용자는 이 라이선스로 사용할 수 없다 | 1차 |
| LTX-2.x (오픈) | LoRA·IC-LoRA · 오디오 동시 생성 | 최대 20초 · 4K | 자체 GPU | **LTX-2.x Community License — 매출 기준 조건부**(기준 금액은 §2.1 원문 확인 필요) | 1차(라이선스 종류) |

**알파채널**: 상용 비디오 모델 중 알파 출력 공식 지원이 확인되지 않았다 — 스티커·루프는 생성 후 배경 제거 조립을 전제한다(인용).
