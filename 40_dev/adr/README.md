# Architecture Decision Records

> 코드가 설명할 수 없는 결정의 단일 출처.
> 템플릿: `50_resources/templates/ADR-template.md`
> 파일명: `NNNN-decision-title.md` (4자리 일련번호)

## Index

| ADR | 결정 | Class | status |
|-----|------|-------|--------|
| [0001](0001-rss-auto-crawl-ai-pipeline.md) | RSS를 Cron 크롤 → Claude Haiku 분류·필터 → 저작자 없는 글로 자동 게시 | B | accepted (retro) |
| [0002](0002-bot-seeding-cold-start.md) | AI 봇 8개는 출시 전 look 확인용 테스트 픽스처 — 공개 배포 전 전량 삭제 | C | accepted · **표기 불필요, "봇 0건" 릴리스 게이트 → GRM-010** |
| [0003](0003-rls-security-model.md) | 전 테이블 RLS(public-read/owner-write/admin-gated) + 시스템 삽입만 service-role 우회 | B | accepted (retro) |

> 3건 모두 **소급(retro) ADR** — 방법론 적용(2026-07-21) 이전 자율빌드 단계에서 코드로 내려진 결정을 재구성. `status: accepted`는 "코드에 이미 존재함"을 뜻하며, 정식 사람 승인 증거는 없다. 특히 ADR-0002는 Class C로 사람 결정이 남아 있다.
