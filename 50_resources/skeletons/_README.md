---
doc_id: skeletons-readme
title: Skeleton Registry — 디렉터리 명세
version: v0.2.0
status: active
last_updated: 2026-05-07
ai_relevance: schema
---

# Skeleton Registry (L2 활성 자산)

> 도메인별 부트스트랩 자산. `base/`는 사람이 최소 관리하고, lock/apply 결과는 Catalog 엔트리 합성으로 *결정적 빌드*.
> 위상은 [10_foundation/WHITEPAPER.md](../../10_foundation/WHITEPAPER.md) §5 L2 참조.
> 핵심 가치: *알려진 문제를 미리 패치한* 의존성·코드를 새 프로젝트에 즉시 주입.

---

## 1. 디렉터리 구조

```
50_resources/skeletons/
├── _README.md                    ← 본 문서
└── <domain>/                     ← 도메인 1개당 디렉터리 1개 (예: webapp-next, data-pipeline)
    ├── base/                     ← 손으로 관리하는 최소 베이스 (폴더 구조·lint·tsconfig 등)
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── ...
    ├── bakes-in.json             ← 베이크할 Catalog 엔트리 ID 목록
    ├── skeleton.lock.json        ← bakes-in 적용 결과 (deps, scripts, file patches) — 자동 생성
    └── README.md                 ← 자동 생성: "이 스켈레톤이 미리 막는 문제 N개"
```

## 2. `bakes-in.json` 스키마

```json
{
  "schema_version": "1.0",
  "domain": "webapp-next",
  "base_version": "v3",
  "catalog_entries": ["C-014", "C-022", "C-031"],
  "verified_with": ["claude-sonnet-4-6"]
}
```

> `bakes-in.json`은 *사람이 관리하는 입력*(무엇을 베이크할지)만 담는다. 빌드 시각은 `skeleton build`가 `skeleton.lock.json`의 `built_at`에 기록한다(SSOT — bakes-in에 중복 두지 않는다).

## 3. 빌드·적용 명령

초기화:
```bash
python3 60_tools/methodology.py skeleton init <domain>
```

빌드 (Catalog 변경 시):
```bash
python3 60_tools/methodology.py skeleton build <domain>
```

새 프로젝트에 적용:
```bash
python3 60_tools/methodology.py skeleton apply <domain> ../my-new-project
```

현재 v0 구현은 `base/` 파일 복사, `bakes-in.json` 읽기, `skeleton.lock.json` 생성, `README.md` 생성을 지원한다.
Pending Lesson은 bake-in 대상이 아니며, active Catalog ID만 `catalog_entries`에 넣는다.

## 4. 도메인 식별자 컨벤션

소문자 + 하이픈. 예:
- `webapp-next` (Next.js 풀스택)
- `webapp-react-spa`
- `data-pipeline`
- `slack-bot`
- `cli-tool`
- `docs-site`

도메인 분류 자체는 분기마다 회고 대상 (백서 §9 리스크 4).

## 5. 자가발전 루프와의 결합

```
L1 관찰 → L3 마이닝 → Catalog 승급 (사람 머지) → bakes-in.json 갱신 → skeleton.lock.json 자동 재빌드 → 다음 프로젝트가 자동으로 패치된 스켈레톤으로 시작
```

(백서 §6 자가발전 메커니즘 그대로의 구현체)

## 6. 안티패턴

- ❌ 베이스를 직접 수정해 결과(lock)에 반영 — 빌드 단계가 무력화됨
- ❌ Catalog 엔트리 ID 대신 *내용을* 베이스에 직접 박기 — 동기화 단절
- ❌ 도메인을 너무 좁게 분리 (예: `webapp-next-supabase` vs `webapp-next-prisma`) — 변종은 *옵션 플래그*로 처리, 새 도메인 아님
- ❌ 검증 없이 다 도메인에 동일 Catalog 엔트리 베이크 — `verified_with`이 도메인별로 다를 수 있음
