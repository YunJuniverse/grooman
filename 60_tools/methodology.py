#!/usr/bin/env python3
"""methodology — CLI for distributing & updating the methodology in projects.

Commands
--------
  methodology init <path> --type fullstack|planning-only [--label NAME]
      새 프로젝트에 방법론을 주입한다.

  methodology sync [--apply] [--target <version>]
      현재 폴더(.methodology-version 보유)를 업스트림과 동기화한다.
      --apply 없이 호출하면 변경 미리보기만 출력 (드라이런).

  methodology sync-all [--apply] [--root <dir>]
      root(기본: 방법론 상위) 아래 관리 다운스트림을 전부 발견해 일괄 sync.
      --apply 시 dirty·비-main 브랜치는 안전상 skip (--include-dirty/--allow-nonmain 로 강제).

  methodology status
      적용된 버전과 업스트림 버전을 비교한다.

  methodology diff <path>
      특정 파일에서 sync가 어떤 변경을 가할지 단일 파일 diff 표시.

  methodology version
      이 메소돌로지 자신의 버전을 출력한다.

  methodology observe --slug <kebab-slug> --summary <text> [options]
      L1 AI 관찰 로그를 생성한다.

  methodology observe --validate <path>
      L1 AI 관찰 로그의 필수 필드와 경로 규칙을 검증한다.

  methodology catalog init|status|seed-pending
      Pending Lesson과 active Catalog 흐름을 관리한다.

  methodology skeleton init|build|apply
      도메인 skeleton base/lock/apply v0 흐름을 실행한다.

  methodology thinktank
      L1 관찰 로그 기반 주간 인사이트 리포트를 생성한다.

Classification
--------------
  shared          — sync가 항상 덮어쓴다 (20_guides/, 50_resources/, 그래프, 대시보드)
  init_scaffolds  — init이 1회 생성, sync는 절대 안 건드린다 (30_planning/, 40_dev/)
  managed         — sync가 마커 사이만 머지한다 (CLAUDE.md, AGENTS.md)
  project_local   — 프로젝트 산출물, sync 무관 (HANDOFF/TODO/code/...)

Markers
-------
  managed 파일에서 다음 마커 쌍 사이만 sync가 갱신한다:

      <!-- methodology:managed:start id=<block-id> -->
      ...
      <!-- methodology:managed:end -->
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import date, datetime, timezone
from difflib import unified_diff
from pathlib import Path
from typing import Any, Callable

# ─── 메소돌로지 자체 버전 ───────────────────────────────────────────────────
METHODOLOGY_VERSION = "v4.0"

METHODOLOGY_ROOT = Path(__file__).resolve().parent.parent


# 구조는 v4.0 고정 (60_tools / 50_resources / 70_meta ...).
# v3.2 이하 지원 종료 — 옛 구조 저장소는 `migrations/v3.2_to_v4.0.py` 로 먼저 이관.

# ─── 매니페스트 ─────────────────────────────────────────────────────────────
MANIFEST = {
    # sync가 항상 덮어쓰는 디렉터리·파일 (재귀 복사)
    "shared_paths": [
        "00_briefs/_README.md",
        "00_briefs/standing/SOP_template.md",
        "20_guides",
        "50_resources/templates",
        "50_resources/prompts",
        "50_resources/catalog/_README.md",
        "50_resources/skeletons/_README.md",
        "50_resources/ai_observations/_README.md",
        "60_tools/methodology-graph.json",
        "60_tools/generate-dashboard.py",
        "60_tools/methodology.py",
        "60_tools/stack.json",
        "10_foundation/WHITEPAPER.md",
        "10_foundation/HOW_TO_APPLY.md",
        "10_foundation/KICKOFF_PROMPT.md",
        "10_foundation/DIAGRAM.md",
        "10_foundation/USER_GUIDE.md",
        "60_tools/commands.json",
        ".ai/schema",
        ".ai/adapters",
        "ONBOARDING.md",
        ".github/workflows/methodology-applied-ci.yml",
        ".github/workflows/methodology-auto-merge.yml",
        "open-dashboard.command",
        "_start",
    ],
    # init이 1회 생성하는 디렉터리·파일 (sync 무시)
    "init_paths": [
        "00_briefs/standing",
        "00_briefs/meetings",
        "00_briefs/research",
        "00_briefs/reference",
        "00_briefs/ideas",
        "00_briefs/archived",
        "30_planning",
        "40_dev",
        "50_resources/catalog/_pending",
        "50_resources/catalog/archived",
        "50_resources/skeletons",
        "50_resources/ai_observations",
    ],
    # init_paths 복사에서 제외할 패턴 (repo-relative path, re.match)
    # — 본 저장소가 자기 자신에 방법론을 적용해 쌓은 *실 운영 기록*
    # (domain: meta — ADR-NNN/관찰로그/스냅샷/스켈레톤/pending lesson).
    # v0 스켈레톤이 아니므로 적용 프로젝트로 새면 ADR-002(메타-방법론 격리) 위반.
    # 신규 프로젝트는 _README.md/README.md 등 안내 템플릿만 받고
    # 자신의 기록을 처음부터 직접 쌓아간다.
    "init_path_excludes": [
        r"^40_dev/adr/ADR-\d{3}-",                           # 방법론 자신의 ADR-NNN(3자리). 적용 프로젝트는 ADR-NNNN(4자리)로 새로 시작
        r"^40_dev/snapshots/(?!README\.md$)",                # README 제외 모든 실 스냅샷(insights/ 포함)
        r"^50_resources/ai_observations/(?!_README\.md$)",  # _README 제외 모든 실 관찰 로그
        r"^50_resources/skeletons/meta/",                    # 방법론 자신의 meta 도메인 스켈레톤
        r"^50_resources/catalog/_pending/P-\d{3}_",          # 방법론 자신의 pending lesson
    ],
    # init이 src→dst 매핑으로 복사하는 단일 파일들 (PROJECT_NAME 치환 가능)
    "init_files": [
        # (src_in_methodology, dst_in_project, substitute)
        ("CLAUDE.md", "CLAUDE.md", True),
        ("AGENTS.md", "AGENTS.md", True),
        ("50_resources/templates/HANDOFF.md", "HANDOFF.md", True),
        ("50_resources/templates/TODO.md", "TODO.md", True),
        ("50_resources/templates/context.json", ".ai/context.json", True),
        ("50_resources/templates/checkpoint.md", ".ai/checkpoint.md", True),
    ],
    # sync가 마커 사이만 머지하는 파일
    "managed_files": [
        "CLAUDE.md",
        "AGENTS.md",
    ],
    # 절대로 외부 프로젝트에 주입되면 안 되는 경로 (메타-방법론 등)
    # MANIFEST는 whitelist 방식이라 1차 안전 — excluded_paths는 2차 안전망.
    # init/sync 시작 시 검증되며, shared_paths/init_paths/init_files와 겹치면 즉시 fail.
    "excluded_paths": [
        "70_meta",
    ],
}

MARKER_RE = re.compile(
    r"<!--\s*methodology:managed:start\s+id=([\w\-]+)\s*-->(.*?)<!--\s*methodology:managed:end\s*-->",
    re.DOTALL,
)

VERSION_FILE_NAME = ".methodology-version"
META_ROOT = Path("70_meta")
OBSERVATION_DIR = Path("50_resources/ai_observations")  # default (v4.0). 실제 사용은 _observation_dir(target).


def _observation_dir(target: Path) -> Path:
    """관찰 로그 디렉터리 (v4.0 고정)."""
    return target / "50_resources" / "ai_observations"
CATALOG_DIR = Path("50_resources/catalog")
SKELETONS_DIR = Path("50_resources/skeletons")
INSIGHTS_DIR = Path("40_dev/snapshots/insights")
OBSERVATION_TASK_TYPES = {"bootstrap", "feature", "bugfix", "refactor", "research", "docs"}
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
OBSERVATION_FILE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}_[a-z0-9]+(?:-[a-z0-9]+)*\.md$")


# ─── 유틸 ───────────────────────────────────────────────────────────────────


def info(msg: str) -> None:
    print(f"\033[36m[info]\033[0m {msg}")


def ok(msg: str) -> None:
    print(f"\033[32m[ok]\033[0m {msg}")


def warn(msg: str) -> None:
    print(f"\033[33m[warn]\033[0m {msg}")


def err(msg: str) -> None:
    print(f"\033[31m[err]\033[0m {msg}", file=sys.stderr)


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def write_text(p: Path, content: str) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")


def utc_stamp() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def utc_date() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def host_os_label() -> str:
    try:
        system = subprocess.check_output(["uname", "-s"], text=True).strip().lower()
        release = subprocess.check_output(["uname", "-r"], text=True).strip()
        return f"{system}-{release}"
    except Exception:
        return "unknown"


def upstream_commit() -> str:
    try:
        return subprocess.check_output(
            ["git", "-C", str(METHODOLOGY_ROOT), "rev-parse", "--short", "HEAD"],
            text=True,
        ).strip()
    except Exception:
        return "unknown"


def substitute(content: str, label: str, mode: str | None, today: str) -> str:
    out = content.replace("[PROJECT_NAME]", label)
    if mode:
        out = out.replace("[fullstack / planning-only]", mode)
        out = out.replace("[PROJECT_MODE]", mode)
    out = out.replace("[YYYY-MM-DD]", today)
    return out


# ─── 마커 머지 ──────────────────────────────────────────────────────────────


def parse_managed_blocks(text: str) -> dict[str, str]:
    return {m.group(1): m.group(0) for m in MARKER_RE.finditer(text)}


def merge_managed(source_text: str, target_text: str) -> tuple[str, dict]:
    """target의 마커 블록을 source의 같은 id 블록으로 교체.

    반환: (새 target_text, 통계 dict)
    """
    src_blocks = parse_managed_blocks(source_text)
    tgt_blocks = parse_managed_blocks(target_text)

    replaced = 0
    untouched = 0
    deprecated = []  # target에는 있지만 source에 없는 id

    def _sub(m: re.Match) -> str:
        nonlocal replaced, untouched
        block_id = m.group(1)
        if block_id in src_blocks:
            new_block = src_blocks[block_id]
            if new_block.strip() == m.group(0).strip():
                untouched += 1
            else:
                replaced += 1
            return new_block
        deprecated.append(block_id)
        return m.group(0)

    new_text = MARKER_RE.sub(_sub, target_text)

    # source에는 있지만 target에 없는 id → 끝에 추가
    new_in_source = [bid for bid in src_blocks if bid not in tgt_blocks]
    if new_in_source:
        added_blocks = "\n\n".join(src_blocks[bid] for bid in new_in_source)
        new_text = new_text.rstrip() + "\n\n" + added_blocks + "\n"

    return new_text, {
        "replaced": replaced,
        "untouched": untouched,
        "deprecated": deprecated,
        "added": new_in_source,
    }


# ─── 버전 파일 ──────────────────────────────────────────────────────────────


def load_version_file(target: Path) -> dict:
    p = target / VERSION_FILE_NAME
    if not p.exists():
        return {}
    return json.loads(read_text(p))


def write_version_file(target: Path, label: str | None) -> None:
    payload = {
        "methodology_version": METHODOLOGY_VERSION,
        "applied_at": str(date.today()),
        "applied_from": "ai-pipeline-methodology",
        "upstream_commit": upstream_commit(),
        "project_label": label,
    }
    write_text(target / VERSION_FILE_NAME, json.dumps(payload, indent=2, ensure_ascii=False) + "\n")


# ─── L1 관찰 로그 ───────────────────────────────────────────────────────────


def load_ai_context(root: Path) -> dict:
    p = root / ".ai" / "context.json"
    if not p.exists():
        return {}
    try:
        return json.loads(read_text(p))
    except json.JSONDecodeError:
        return {}


def yaml_scalar(value: str | None) -> str:
    if value is None:
        return "null"
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def parse_friction_item(raw: str, index: int) -> dict:
    parts = raw.split("|")
    if len(parts) != 4:
        raise ValueError("--friction 형식은 'where|cost_minutes|resolution|repeat_of' 입니다")
    where, cost, resolution, repeat_of = [p.strip() for p in parts]
    try:
        cost_minutes = int(cost)
    except ValueError as exc:
        raise ValueError("friction cost_minutes는 정수여야 합니다") from exc
    repeat_value = None if repeat_of in {"", "null", "none", "-"} else repeat_of
    return {
        "id": f"F-{index:03d}",
        "where": where,
        "cost_minutes": cost_minutes,
        "resolution": resolution,
        "repeat_of": repeat_value,
    }


def render_observation(payload: dict) -> str:
    lines = [
        "---",
        f"session_id: {payload['session_id']}",
        "authored_by:",
        f"  agent: {yaml_scalar(payload['agent'])}",
        f"  tool: {yaml_scalar(payload['tool'])}",
        f"  host_os: {yaml_scalar(payload['host_os'])}",
        f"domain: {payload['domain']}",
        f"task_type: {payload['task_type']}",
        "stack_used:",
    ]
    for stack in payload["stack_used"]:
        lines.append(f"  - {yaml_scalar(stack)}")
    lines.append(f"flow_used: {payload['flow_used']}")

    friction = payload["friction"]
    if friction:
        lines.append("friction:")
        for item in friction:
            lines.extend([
                f"  - id: {item['id']}",
                f"    where: {yaml_scalar(item['where'])}",
                f"    cost_minutes: {item['cost_minutes']}",
                f"    resolution: {yaml_scalar(item['resolution'])}",
                f"    repeat_of: {item['repeat_of'] or 'null'}",
            ])
    else:
        lines.append("friction: []")

    patterns = payload["prompt_patterns"]
    if patterns:
        lines.append("prompt_patterns:")
        for index, intent in enumerate(patterns, start=1):
            lines.extend([
                f"  - intent: {yaml_scalar(intent)}",
                "    success: true",
                f"    rounds: {payload['rounds'][index - 1]}",
            ])
    else:
        lines.append("prompt_patterns: []")

    lines.extend([
        "---",
        "",
        payload["summary"].strip(),
        "",
    ])
    return "\n".join(lines)


def validate_observation_file(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"파일 없음: {path}"]
    if not OBSERVATION_FILE_RE.match(path.name):
        errors.append("파일명은 YYYY-MM-DD_<kebab-slug>.md 형식이어야 합니다")
    text = read_text(path)
    if "/Users/" in text or "\\Users\\" in text:
        errors.append("절대 사용자 경로가 포함되어 있습니다")
    if not text.startswith("---\n"):
        errors.append("YAML frontmatter 시작 마커가 없습니다")
        return errors
    try:
        _, frontmatter, body = text.split("---", 2)
    except ValueError:
        errors.append("YAML frontmatter 종료 마커가 없습니다")
        return errors

    required_snippets = [
        "session_id:",
        "authored_by:",
        "  agent:",
        "  tool:",
        "  host_os:",
        "domain:",
        "task_type:",
        "stack_used:",
        "flow_used:",
        "friction:",
        "prompt_patterns:",
    ]
    for snippet in required_snippets:
        if snippet not in frontmatter:
            errors.append(f"필수 필드 누락: {snippet.strip()}")

    session_match = re.search(r"^session_id:\s*([^\s]+)\s*$", frontmatter, flags=re.MULTILINE)
    if session_match and session_match.group(1) != path.stem:
        errors.append("session_id는 파일명(.md 제외)과 같아야 합니다")
    task_match = re.search(r"^task_type:\s*([^\s]+)\s*$", frontmatter, flags=re.MULTILINE)
    if task_match and task_match.group(1) not in OBSERVATION_TASK_TYPES:
        errors.append(f"task_type은 {', '.join(sorted(OBSERVATION_TASK_TYPES))} 중 하나여야 합니다")
    if re.search(r"^\s*-\s*\[?None\]?\s*$", frontmatter, flags=re.MULTILINE):
        errors.append("빈 배열은 [None] 대신 []로 기록해야 합니다")
    # 본문(body) 검증:
    # 옛 정책 — 1단락 ≤ 220자. 실제 사용은 multi-section markdown 이 압도적이고
    # CLI 도 입력 길이 강제 안 해서 정책-현실 괴리. body 는 markdown 자유 형식으로 허용.
    # 핵심 정보 (session_id, task_type 등) 은 frontmatter 가 강제하므로 정합성 유지.
    # 본문이 완전히 비어있는 경우만 잡음.
    if not body.strip():
        errors.append("본문이 비어있습니다 — 최소 한 줄 작성 필요")
    return errors


def parse_observation_frontmatter(path: Path) -> dict[str, Any]:
    text = read_text(path)
    if not text.startswith("---\n"):
        return {}
    try:
        _, frontmatter, _body = text.split("---", 2)
    except ValueError:
        return {}
    out: dict[str, Any] = {"path": str(path.relative_to(METHODOLOGY_ROOT))}
    current = None
    for raw in frontmatter.splitlines():
        line = raw.rstrip()
        if not line.strip():
            continue
        top = re.match(r"^([a-z_]+):\s*(.*)$", line)
        if top:
            current = top.group(1)
            value = top.group(2).strip()
            out[current] = value.strip('"') if value else []
            continue
        item = re.match(r"^\s+-\s+(.+)$", line)
        if item and current:
            out.setdefault(current, [])
            if isinstance(out[current], list):
                out[current].append(item.group(1).strip().strip('"'))
    return out


def cmd_observe(args: argparse.Namespace) -> int:
    if args.validate:
        path = Path(args.validate)
        errors = validate_observation_file(path)
        if errors:
            for item in errors:
                err(item)
            return 1
        ok(f"observation valid: {path}")
        return 0

    if not args.slug or not args.summary:
        err("observe 생성에는 --slug 와 --summary 가 필요합니다")
        return 2
    if not SLUG_RE.match(args.slug):
        err("--slug 는 영문 소문자/숫자/kebab-case 여야 합니다")
        return 2
    if args.task_type not in OBSERVATION_TASK_TYPES:
        err(f"--task-type 은 {', '.join(sorted(OBSERVATION_TASK_TYPES))} 중 하나여야 합니다")
        return 2

    ctx = load_ai_context(METHODOLOGY_ROOT)
    agent = args.agent or ctx.get("last_session", {}).get("agent", {}).get("model") or "unknown"
    tool = args.tool or ctx.get("last_session", {}).get("agent", {}).get("tool") or "unknown"
    host_os = args.host_os or ctx.get("last_session", {}).get("host_os") or host_os_label()
    domain = args.domain or ctx.get("project", {}).get("domain") or "meta"
    stack_used = args.stack or ["python3", f"methodology@{METHODOLOGY_VERSION}"]
    intents = args.intent or ["l1 observation capture"]
    rounds = args.rounds or [1 for _ in intents]
    if len(rounds) != len(intents):
        err("--rounds 개수는 --intent 개수와 같아야 합니다")
        return 2

    try:
        friction = [parse_friction_item(raw, i) for i, raw in enumerate(args.friction or [], start=1)]
    except ValueError as exc:
        err(str(exc))
        return 2

    date_part = args.date or utc_date()
    session_id = f"{date_part}_{args.slug}"
    output = _observation_dir(METHODOLOGY_ROOT) / f"{session_id}.md"
    if output.exists() and not args.force:
        err(f"이미 존재합니다: {output.relative_to(METHODOLOGY_ROOT)} (--force 로 덮어쓰기)")
        return 1

    payload = {
        "session_id": session_id,
        "agent": agent,
        "tool": tool,
        "host_os": host_os,
        "domain": domain,
        "task_type": args.task_type,
        "stack_used": stack_used,
        "flow_used": args.flow_used,
        "friction": friction,
        "prompt_patterns": intents,
        "rounds": rounds,
        "summary": args.summary,
        "created_at": utc_stamp(),
    }
    content = render_observation(payload)
    if args.dry_run:
        print(content)
        return 0
    write_text(output, content)
    errors = validate_observation_file(output)
    if errors:
        for item in errors:
            err(item)
        return 1
    ok(f"observation created: {output.relative_to(METHODOLOGY_ROOT)}")
    return 0


# ─── L2 Catalog / Pending Lesson ────────────────────────────────────────────


def catalog_dirs() -> dict[str, Path]:
    base = METHODOLOGY_ROOT / CATALOG_DIR
    return {
        "base": base,
        "pending": base / "_pending",
        "archived": base / "archived",
    }


def ensure_catalog_dirs() -> None:
    for p in catalog_dirs().values():
        p.mkdir(parents=True, exist_ok=True)
    for p in [catalog_dirs()["pending"] / ".gitkeep", catalog_dirs()["archived"] / ".gitkeep"]:
        if not p.exists():
            write_text(p, "")


def count_markdown(path: Path, prefix: str | None = None) -> int:
    if not path.exists():
        return 0
    files = [p for p in path.glob("*.md") if p.name != "_README.md"]
    if prefix:
        files = [p for p in files if p.name.startswith(prefix)]
    return len(files)


def cmd_catalog(args: argparse.Namespace) -> int:
    ensure_catalog_dirs()
    dirs = catalog_dirs()
    if args.catalog_cmd == "init":
        ok("catalog dirs ready: 50_resources/catalog/{_pending,archived}")
        return 0
    if args.catalog_cmd == "status":
        print(f"pending {count_markdown(dirs['pending'])}")
        print(f"active  {count_markdown(dirs['base'], 'C-')}")
        print(f"archive {count_markdown(dirs['archived'])}")
        return 0
    if args.catalog_cmd == "seed-pending":
        target = dirs["pending"] / "P-001_example-friction.md"
        if target.exists() and not args.force:
            warn(f"exists: {target.relative_to(METHODOLOGY_ROOT)}")
            return 0
        # 메타-방법론(본 저장소)의 실제 마찰이 아니라, 이 프로젝트가
        # 자신의 첫 Pending Lesson을 쓸 때 채워야 할 자리표시 예시다.
        # (ADR-002: 메타 운영 기록은 적용 프로젝트로 새면 안 된다)
        content = """---
id: P-001
title: "<반복될 수 있는 마찰을 한 줄로 요약>"
domain: <skeleton과 일치하는 도메인 식별자>
status: pending
source_observations:
  - <이 마찰을 처음 기록한 관찰 로그 파일명(확장자 제외)>
signature: "<L3 마이닝이 검색할 정규식 키>"
created: <YYYY-MM-DD>
last_seen: <YYYY-MM-DD>
promotion_rule: "Promote to active Catalog after N>=2 observations or explicit human approval."
---

## 증상 (Symptom)

(재현 가능한 에러 메시지·관찰 가능한 동작을 적는다)

## 임시 해결 (Current Workaround)

(지금 당장 우회하는 방법을 적는다)

## 승급 조건

동일 마찰이 다른 L1 관찰에서 재현되거나, 사람이 명시적으로 active Catalog 승급을 승인하면 승급한다.
"""
        write_text(target, content)
        ok(f"pending lesson seeded (example placeholder — 실제 마찰로 교체할 것): {target.relative_to(METHODOLOGY_ROOT)}")
        return 0
    err("unknown catalog command")
    return 2


# ─── L2 Skeleton ────────────────────────────────────────────────────────────


def skeleton_domain_dir(domain: str) -> Path:
    return METHODOLOGY_ROOT / SKELETONS_DIR / domain


def list_base_files(base_dir: Path) -> list[str]:
    if not base_dir.exists():
        return []
    return [
        str(p.relative_to(base_dir))
        for p in sorted(base_dir.rglob("*"))
        if p.is_file()
    ]


def load_catalog_entry(entry_id: str) -> dict[str, str]:
    base = METHODOLOGY_ROOT / CATALOG_DIR
    matches = list(base.glob(f"{entry_id}_*.md"))
    if not matches:
        return {"id": entry_id, "status": "missing", "path": ""}
    p = matches[0]
    text = read_text(p)
    title_match = re.search(r"^title:\s*\"?(.+?)\"?\s*$", text, flags=re.MULTILINE)
    return {
        "id": entry_id,
        "status": "found",
        "path": str(p.relative_to(METHODOLOGY_ROOT)),
        "title": title_match.group(1) if title_match else entry_id,
    }


def cmd_skeleton(args: argparse.Namespace) -> int:
    if not SLUG_RE.match(args.domain):
        err("domain은 영문 소문자/숫자/kebab-case 여야 합니다")
        return 2
    domain_dir = skeleton_domain_dir(args.domain)
    base_dir = domain_dir / "base"
    bakes_in = domain_dir / "bakes-in.json"
    lock_path = domain_dir / "skeleton.lock.json"

    if args.skeleton_cmd == "init":
        base_dir.mkdir(parents=True, exist_ok=True)
        readme = base_dir / "README.md"
        if not readme.exists():
            write_text(readme, f"# {args.domain} base\n\nMinimal portable base for `{args.domain}` skeleton.\n")
        if not bakes_in.exists():
            payload = {
                "schema_version": "1.0",
                "domain": args.domain,
                "base_version": "v0",
                "catalog_entries": [],
                "verified_with": [],
            }
            write_text(bakes_in, json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        ok(f"skeleton initialized: {domain_dir.relative_to(METHODOLOGY_ROOT)}")
        return 0

    if args.skeleton_cmd == "build":
        if not bakes_in.exists():
            err(f"missing {bakes_in.relative_to(METHODOLOGY_ROOT)} — run skeleton init first")
            return 1
        config = json.loads(read_text(bakes_in))
        entries = [load_catalog_entry(e) for e in config.get("catalog_entries", [])]
        lock = {
            "schema_version": "1.0",
            "domain": args.domain,
            "base_version": config.get("base_version", "v0"),
            "built_at": utc_stamp(),
            "base_files": list_base_files(base_dir),
            "catalog_entries": entries,
        }
        write_text(lock_path, json.dumps(lock, indent=2, ensure_ascii=False) + "\n")
        readme_lines = [
            f"# Skeleton: {args.domain}",
            "",
            f"- Base version: `{lock['base_version']}`",
            f"- Base files: {len(lock['base_files'])}",
            f"- Catalog entries: {len(entries)}",
            "",
            "## Prevented Problems",
            "",
        ]
        if entries:
            readme_lines.extend(f"- `{e['id']}`: {e.get('title', e['status'])}" for e in entries)
        else:
            readme_lines.append("- No active Catalog entries baked in yet.")
        write_text(domain_dir / "README.md", "\n".join(readme_lines) + "\n")
        ok(f"skeleton built: {lock_path.relative_to(METHODOLOGY_ROOT)}")
        return 0

    if args.skeleton_cmd == "apply":
        if not lock_path.exists():
            err(f"missing {lock_path.relative_to(METHODOLOGY_ROOT)} — run skeleton build first")
            return 1
        target = Path(args.target).resolve()
        if target.exists() and any(target.iterdir()) and not args.force:
            err(f"target {target} is not empty (--force to apply anyway)")
            return 1
        target.mkdir(parents=True, exist_ok=True)
        n = copy_path(base_dir, target, dry_run=False)
        write_text(target / ".methodology-skeleton.json", read_text(lock_path))
        ok(f"skeleton applied: {args.domain} -> {target} ({n} base files)")
        return 0

    err("unknown skeleton command")
    return 2


# ─── L3 Thinktank v0 ────────────────────────────────────────────────────────


def observation_files() -> list[Path]:
    base = METHODOLOGY_ROOT / OBSERVATION_DIR
    if not base.exists():
        return []
    return sorted(p for p in base.glob("*.md") if OBSERVATION_FILE_RE.match(p.name))


def cmd_thinktank(args: argparse.Namespace) -> int:
    """L3 Thinktank v0 — L1 관찰 로그 집계 리포트.

    **수동 승급이 정식이다.** 이 명령은 관찰 로그에서 (1) 백서 §7-근접 지표를 집계하고
    (2) 반복 마찰을 승급 *후보*로 마킹할 뿐, 아무것도 자동 승급하지 않는다.
    승급은 사람이 PR로 한다(백서 §8-2, `50_resources/catalog/_README.md` §3).
    분기 회고(`70_meta/retrospectives`) §1 지표의 소스로 회고 직전 실행한다.
    """
    files = observation_files()
    observations = [parse_observation_frontmatter(p) for p in files]

    friction_lines: list[str] = []
    repeat_hits = 0
    for p in files:
        text = read_text(p)
        for match in re.finditer(r"where:\s*\"?(.+?)\"?\s*$", text, flags=re.MULTILINE):
            friction_lines.append(match.group(1))
        for match in re.finditer(r"repeat_of:\s*(.+?)\s*$", text, flags=re.MULTILINE):
            val = match.group(1).strip().strip('"')
            if val and val.lower() not in {"null", "none", "-"}:
                repeat_hits += 1
    counts: dict[str, int] = {}
    for item in friction_lines:
        counts[item] = counts.get(item, 0) + 1
    promote_candidates = sum(1 for c in counts.values() if c >= 2)

    task_counts: dict[str, int] = {}
    for obs in observations:
        t = (obs.get("task_type") or "?") if isinstance(obs.get("task_type"), str) else "?"
        task_counts[t] = task_counts.get(t, 0) + 1

    dates: list[date] = []
    for p in files:
        m = re.match(r"(\d{4})-(\d{2})-(\d{2})_", p.name)
        if m:
            try:
                dates.append(date(int(m.group(1)), int(m.group(2)), int(m.group(3))))
            except ValueError:
                pass
    span_days = (max(dates) - min(dates)).days if len(dates) >= 2 else 0
    per_week = round(len(files) / (span_days / 7), 1) if span_days >= 7 else None
    obs_threshold = "충족" if len(files) >= 100 else "미달(권장 100+)"

    now = datetime.now(timezone.utc)
    iso_year, iso_week, _ = now.isocalendar()
    out_dir = METHODOLOGY_ROOT / INSIGHTS_DIR
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{iso_year}-W{iso_week:02d}_thinktank.md"
    task_dist = ", ".join(f"{k} {v}" for k, v in sorted(task_counts.items(), key=lambda kv: -kv[1])) or "없음"
    lines = [
        f"# Thinktank v0 — {iso_year}-W{iso_week:02d}",
        "",
        "> **수동 승급이 정식.** 이 리포트는 지표 집계 + 승급 *후보* 마킹만 한다 — 자동 승급 없음.",
        "> 승급은 사람이 PR로(백서 §8-2). 분기 회고 §1 지표의 소스 — 회고 직전 실행.",
        f"> Generated at: {utc_stamp()}",
        "",
        "## 지표 (Metrics)",
        "",
        f"- 관찰 로그: **{len(files)}건** ({obs_threshold})",
        f"- 기간: {min(dates).isoformat() if dates else '?'} ~ {max(dates).isoformat() if dates else '?'} ({span_days}일)",
        "- 케이던스: " + (f"주당 약 {per_week}건" if per_week is not None else "산출 불가(기간 부족)"),
        f"- task_type 분포: {task_dist}",
        f"- 마찰 총계: {len(friction_lines)}건 · Catalog 재적중(repeat_of): {repeat_hits}건 · 승급 후보(≥2회): {promote_candidates}건",
        "",
        "## Repeated Friction Candidates",
        "",
    ]
    if counts:
        for name, count in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
            marker = "PROMOTE-CANDIDATE" if count >= 2 else "watch"
            lines.append(f"- `{marker}` x{count}: {name}")
    else:
        lines.append("- No friction entries yet.")
    lines.extend([
        "",
        "## Observations",
        "",
    ])
    for obs in observations:
        lines.append(f"- `{obs.get('session_id', 'unknown')}` — domain `{obs.get('domain', '?')}`, task `{obs.get('task_type', '?')}`")
    write_text(out, "\n".join(lines) + "\n")
    ok(f"thinktank report: {out.relative_to(METHODOLOGY_ROOT)}")
    info("수동 승급이 정식 — 승급 후보(≥2회)는 사람이 검토·PR로 승급(백서 §8-2).")
    return 0


# ─── 마이그레이션 ───────────────────────────────────────────────────────────


def list_migrations() -> list[tuple[str, str, Path]]:
    """(from_version, to_version, path) 리스트, 버전 순서로 정렬."""
    mig_dir = METHODOLOGY_ROOT / "migrations"
    if not mig_dir.exists():
        return []
    out = []
    for p in mig_dir.glob("v*_to_v*.py"):
        m = re.match(r"^(v[\d.]+)_to_(v[\d.]+)\.py$", p.name)
        if m:
            out.append((m.group(1), m.group(2), p))
    out.sort(key=lambda x: _ver_key(x[0]))
    return out


def _ver_key(v: str) -> tuple[int, ...]:
    return tuple(int(x) for x in v.lstrip("v").split("."))


def find_migration_chain(from_v: str, to_v: str) -> list[tuple[str, str, Path]]:
    """from_v → to_v로 가는 마이그레이션 체인."""
    all_mig = list_migrations()
    chain = []
    cur = from_v
    while cur != to_v:
        nxt = next(((f, t, p) for f, t, p in all_mig if f == cur), None)
        if not nxt:
            break
        chain.append(nxt)
        cur = nxt[1]
        if _ver_key(cur) >= _ver_key(to_v):
            break
    return chain


def run_migration(target: Path, mig_path: Path, dry_run: bool) -> None:
    spec = importlib.util.spec_from_file_location(mig_path.stem, mig_path)
    if not spec or not spec.loader:
        err(f"failed to load migration {mig_path}")
        return
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    if not hasattr(mod, "migrate"):
        err(f"migration {mig_path.name} has no migrate(target, dry_run) function")
        return
    mod.migrate(target, dry_run=dry_run)


# ─── 동작: copy_path / merge_path ───────────────────────────────────────────

# 재귀 복사에서 항상 제외 — 생성/캐시 산출물 (방법론 자산이 아님).
# _start 가 shared_paths 라 _start/.cache/dashboard.html 같은 빌드 캐시가
# 프로젝트로 전파되어 추적되면 dashboard 서버 재생성 → git pull 영구 차단됨.
COPY_EXCLUDE_DIRS = {".cache", "__pycache__", ".git"}
COPY_EXCLUDE_FILES = {".DS_Store"}
COPY_EXCLUDE_SUFFIXES = {".pyc"}


def _excluded_from_copy(rel: Path) -> bool:
    if any(part in COPY_EXCLUDE_DIRS for part in rel.parts):
        return True
    if rel.name in COPY_EXCLUDE_FILES:
        return True
    return rel.suffix in COPY_EXCLUDE_SUFFIXES


_INIT_PATH_EXCLUDE_RE = [re.compile(p) for p in MANIFEST.get("init_path_excludes", [])]


def _init_meta_leak_skip(base_rel: str) -> Callable[[Path], bool] | None:
    """init_paths 항목(base_rel) 복사 시 메타-방법론 실 운영 기록을 걸러내는 skip 함수.

    MANIFEST.init_path_excludes 패턴을 "{base_rel}/{file_rel}" 전체 경로에 매칭한다.
    패턴이 하나도 없으면 None (필터 없이 전체 복사).
    """
    if not _INIT_PATH_EXCLUDE_RE:
        return None

    def _skip(rel: Path) -> bool:
        full = f"{base_rel}/{rel.as_posix()}"
        return any(p.match(full) for p in _INIT_PATH_EXCLUDE_RE)

    return _skip


def copy_path(
    src: Path,
    dst: Path,
    dry_run: bool,
    *,
    prune: bool = False,
    skip: Callable[[Path], bool] | None = None,
    prune_report: list[Path] | None = None,
) -> int:
    """src → dst 재귀 복사. prune=True면 src에 없는 파일을 dst에서 제거.

    skip(rel) 이 True를 반환하는 파일(rel은 src 기준 상대 경로)은 복사·prune 모두에서 제외.

    prune_report 가 주어지면, *상류(src)에 없는* dst 파일(= prune 후보)의 상대 경로를 거기에
    append 한다. prune=False 여도 후보는 수집만 하고 삭제하지 않는다 — 다운스트림 고유 파일을
    조용히 지우지 않고 호출자가 경고·결정하게 하기 위함(METH-046).

    반환: 변경된 파일 수 (생성/덮어쓰기/삭제 모두 포함)
    """
    changes = 0
    if src.is_file():
        if not dst.exists() or read_text(src) != read_text(dst) if src.suffix in {".md", ".json", ".py", ".yaml", ".yml", ".sh"} else (not dst.exists() or src.read_bytes() != dst.read_bytes()):
            changes = 1
            if not dry_run:
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
        return changes

    if not src.is_dir():
        return 0

    for sp in src.rglob("*"):
        if sp.is_dir():
            continue
        rel = sp.relative_to(src)
        if _excluded_from_copy(rel):
            continue
        if skip and skip(rel):
            continue
        dp = dst / rel
        same = dp.exists() and dp.is_file() and sp.read_bytes() == dp.read_bytes()
        if not same:
            changes += 1
            if not dry_run:
                dp.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(sp, dp)

    # prune 후보 = dst 에 있으나 src(상류)에 없는 파일. prune=True면 삭제, 아니면 보존(보고만).
    if dst.is_dir() and (prune or prune_report is not None):
        src_files = {
            sp.relative_to(src)
            for sp in src.rglob("*")
            if sp.is_file() and not _excluded_from_copy(sp.relative_to(src))
        }
        for dp in dst.rglob("*"):
            if not dp.is_file():
                continue
            rel = dp.relative_to(dst)
            if _excluded_from_copy(rel):
                continue  # 캐시/생성물은 방법론이 관리 안 함 — prune 대상 제외
            if skip and skip(rel):
                continue  # init-path-exclude 대상도 prune 제외
            if rel not in src_files:
                if prune_report is not None:
                    prune_report.append(rel)
                if prune:
                    changes += 1
                    if not dry_run:
                        dp.unlink()
    return changes


def merge_managed_file(src: Path, dst: Path, dry_run: bool) -> dict:
    if not dst.exists():
        # 프로젝트에 아예 없으면 통째로 복사
        if not dry_run:
            shutil.copy2(src, dst)
        return {"copied_new": True, "replaced": 0, "untouched": 0, "deprecated": [], "added": []}
    src_text = read_text(src)
    dst_text = read_text(dst)
    new_text, stats = merge_managed(src_text, dst_text)
    if new_text != dst_text and not dry_run:
        write_text(dst, new_text)
    stats["changed"] = new_text != dst_text
    return stats


# ─── 안전망: excluded_paths 검증 ────────────────────────────────────────────


def assert_excluded_paths_safe() -> None:
    """MANIFEST.excluded_paths가 shared/init_paths/init_files와 겹치지 않는지 검증.

    겹치면 즉시 fail — 메타-방법론 등 격리되어야 하는 경로가
    실수로 주입 대상에 추가된 사고를 차단한다.
    """
    excluded = set(MANIFEST.get("excluded_paths", []))
    if not excluded:
        return

    def violates(path: str) -> str | None:
        for ex in excluded:
            if path == ex or path.startswith(ex + "/"):
                return ex
        return None

    offenders: list[tuple[str, str]] = []
    for rel in MANIFEST["shared_paths"]:
        ex = violates(rel)
        if ex:
            offenders.append((f"shared_paths:{rel}", ex))
    for rel in MANIFEST["init_paths"]:
        ex = violates(rel)
        if ex:
            offenders.append((f"init_paths:{rel}", ex))
    for src_rel, dst_rel, _ in MANIFEST["init_files"]:
        for tag, p in (("init_files.src", src_rel), ("init_files.dst", dst_rel)):
            ex = violates(p)
            if ex:
                offenders.append((f"{tag}:{p}", ex))

    if offenders:
        err("MANIFEST excluded_paths 위반 — 다음 경로가 격리 디렉터리 안에 있습니다:")
        for where, ex in offenders:
            err(f"  {where}  ⊂  {ex}/")
        err("70_meta/ 같은 메타-방법론 자산이 외부 프로젝트에 주입되면 안 됩니다.")
        raise SystemExit(3)


# ─── .gitignore 전파 ────────────────────────────────────────────────────────
#
# .gitignore 는 MANIFEST 자산이 아니라서 init/sync 가 프로젝트로 전파하지 않았다.
# 그 결과 적용 프로젝트가 방법론 생성물(dashboard.html, _start/.cache/ 등)을
# 추적하게 되고, dashboard 서버가 그 파일을 재생성하면 git pull 이 영구 차단됐다.
# 아래 블록은 마커 사이만 idempotent 하게 갱신/추가하므로 앱 고유 규칙은 보존된다.
#
# 주의: .ai/wrap-state.json 은 설계상 *추적 대상* (라이브 파일 sha256 baseline 을
# 동일 commit 에 패키징해야 wrap 콘텐츠 해시 검증이 성립) — 무시 목록에 넣지 않는다.

GITIGNORE_BLOCK_START = "# >>> methodology managed (마커 사이 수정 금지) >>>"
GITIGNORE_BLOCK_END = "# <<< methodology managed <<<"
GITIGNORE_MANAGED_LINES = [
    "# 방법론 생성 산출물 — 추적 금지 (대시보드/캐시는 로컬 자동 재생성)",
    "dashboard.html",
    "_start/.cache/",
    "__pycache__/",
    "*.pyc",
    ".DS_Store",
]


def ensure_gitignore(target: Path, dry_run: bool) -> bool:
    """프로젝트 .gitignore 에 방법론 생성물 무시 블록을 idempotent 하게 보장.

    앱 고유 규칙은 건드리지 않고 마커 블록만 갱신/추가. 반환: 변경 여부.
    """
    gi = target / ".gitignore"
    block = "\n".join([GITIGNORE_BLOCK_START, *GITIGNORE_MANAGED_LINES, GITIGNORE_BLOCK_END])
    if gi.exists():
        text = read_text(gi)
        if GITIGNORE_BLOCK_START in text and GITIGNORE_BLOCK_END in text:
            pre = text.split(GITIGNORE_BLOCK_START, 1)[0]
            post = text.split(GITIGNORE_BLOCK_END, 1)[1]
            new_text = pre + block + post
        else:
            sep = "" if text == "" or text.endswith("\n") else "\n"
            new_text = text + sep + "\n" + block + "\n"
        if new_text == text:
            return False
    else:
        new_text = block + "\n"
    if not dry_run:
        write_text(gi, new_text)
    return True


# ─── 명령: init ─────────────────────────────────────────────────────────────


def cmd_init(args: argparse.Namespace) -> int:
    assert_excluded_paths_safe()
    target = Path(args.path).resolve()
    label = args.label or target.name
    mode = args.type
    today = str(date.today())

    if target.exists() and any(target.iterdir()):
        err(f"target {target} is not empty — use sync instead")
        return 1

    target.mkdir(parents=True, exist_ok=True)
    info(f"init: {target}  label={label}  type={mode}")

    # 1) shared_paths 복사
    for rel in MANIFEST["shared_paths"]:
        src = METHODOLOGY_ROOT / rel
        dst = target / rel
        if src.exists():
            n = copy_path(src, dst, dry_run=False)
            ok(f"shared    {rel}  ({n} files)")

    # 2) init_paths 복사 (v0 스켈레톤)
    # — init_path_excludes로 본 저장소 자신의 메타 운영 기록(domain: meta)은
    #   걸러낸다. 그 기록은 v0 스켈레톤이 아니라 ADR-002가 격리 대상으로
    #   규정한 "메타-방법론 자산"이며, 적용 프로젝트로 새면 안 된다.
    for rel in MANIFEST["init_paths"]:
        src = METHODOLOGY_ROOT / rel
        dst = target / rel
        if src.exists():
            n = copy_path(src, dst, dry_run=False, skip=_init_meta_leak_skip(rel))
            ok(f"scaffold  {rel}  ({n} files)")

    # 3) init_files (치환 적용)
    for src_rel, dst_rel, sub in MANIFEST["init_files"]:
        src = METHODOLOGY_ROOT / src_rel
        dst = target / dst_rel
        if not src.exists():
            warn(f"init_file missing in source: {src_rel}")
            continue
        content = read_text(src)
        if sub:
            content = substitute(content, label, mode, today)
        write_text(dst, content)
        ok(f"file      {dst_rel}")

    # 4) .github/PULL_REQUEST_TEMPLATE.md (있으면)
    pr_src = METHODOLOGY_ROOT / ".github" / "PULL_REQUEST_TEMPLATE.md"
    if pr_src.exists():
        write_text(target / ".github" / "PULL_REQUEST_TEMPLATE.md", read_text(pr_src))
        ok("file      .github/PULL_REQUEST_TEMPLATE.md")

    # 5) fullstack 시 src/, tests/
    if mode == "fullstack":
        (target / "src").mkdir(exist_ok=True)
        (target / "tests" / "unit").mkdir(parents=True, exist_ok=True)
        (target / "tests" / "integration").mkdir(parents=True, exist_ok=True)
        ok("dir       src/, tests/")

    # 6) .gitignore — 방법론 생성물 무시 블록 보장
    if ensure_gitignore(target, dry_run=False):
        ok("gitignore .gitignore  (방법론 생성물 무시 블록)")

    # 7) .methodology-version
    write_version_file(target, label)
    ok(f"version   {VERSION_FILE_NAME} → {METHODOLOGY_VERSION}")

    info("done. 다음:")
    print("  cd", target)
    print("  python3 60_tools/generate-dashboard.py --serve   # 대시보드 확인")
    print(f"  방법론 갱신 시: python3 {METHODOLOGY_ROOT}/60_tools/methodology.py sync --apply")
    return 0


# ─── 명령: sync ─────────────────────────────────────────────────────────────


def cmd_sync(args: argparse.Namespace) -> int:
    assert_excluded_paths_safe()
    target = Path(args.path or ".").resolve()
    apply = args.apply
    dry = not apply

    vinfo = load_version_file(target)
    if not vinfo:
        err(f"{VERSION_FILE_NAME} 없음 — 이 폴더는 methodology init으로 만든 프로젝트가 아닙니다.")
        err("처음 적용한다면: 60_tools/methodology.py init <path> 또는 빈 .methodology-version 파일 만들고 재시도")
        return 2

    cur_v = vinfo.get("methodology_version", "v0.0")
    target_v = args.target or METHODOLOGY_VERSION
    info(f"sync: {target}  ({cur_v} → {target_v})  {'DRY-RUN' if dry else 'APPLY'}")

    # 1) 마이그레이션 실행
    chain = find_migration_chain(cur_v, target_v)
    if cur_v != target_v and not chain:
        warn(f"마이그레이션 경로 없음: {cur_v} → {target_v}. 직접 적용으로 진행.")
    for f, t, p in chain:
        info(f"migrate   {f} → {t}  ({p.name})")
        run_migration(target, p, dry_run=dry)

    # 2) shared_paths: 항상 덮어쓰기.
    #    단, 상류에 없는 다운스트림 고유 파일은 *기본 보존* — `--prune` 명시 시에만 삭제(METH-046).
    #    (예전엔 shared 디렉터리를 무조건 mirror 해서 적용 프로젝트의 고유 지침/문서가 조용히 삭제됐다.)
    total_changes = 0
    do_prune = getattr(args, "prune", False)
    preserved: list[str] = []
    for rel in MANIFEST["shared_paths"]:
        src = METHODOLOGY_ROOT / rel
        dst = target / rel
        if not src.exists():
            continue
        report: list[Path] = [] if src.is_dir() else None
        n = copy_path(
            src, dst, dry_run=dry,
            prune=(do_prune and src.is_dir()),
            prune_report=report,
        )
        if n:
            total_changes += n
            tag = "would update" if dry else "updated"
            ok(f"shared    {tag:13s} {rel}  ({n} files)")
        for r in report or []:
            line = f"{rel}/{r.as_posix()}"
            if do_prune:
                warn(f"shared    {'would delete' if dry else 'deleted':13s} {line}  (상류에 없음 — prune)")
            else:
                preserved.append(line)
    if preserved:
        warn(f"보존: 상류에 없는 다운스트림 고유 파일 {len(preserved)}개 — 삭제 안 함 (정리하려면 --prune):")
        for line in preserved[:15]:
            warn(f"  {line}")
        if len(preserved) > 15:
            warn(f"  ... 외 {len(preserved) - 15}개")

    # 3) managed_files: 마커 머지
    for rel in MANIFEST["managed_files"]:
        src = METHODOLOGY_ROOT / rel
        dst = target / rel
        if not src.exists():
            continue
        stats = merge_managed_file(src, dst, dry_run=dry)
        if stats.get("copied_new"):
            ok(f"managed   created {rel}")
            total_changes += 1
        elif stats.get("changed"):
            tag = "would merge" if dry else "merged"
            msg = f"managed   {tag:13s} {rel}  (replaced={stats['replaced']}, added={len(stats['added'])}, deprecated={len(stats['deprecated'])})"
            ok(msg)
            if stats["deprecated"]:
                warn(f"          deprecated 블록 (확인 필요): {', '.join(stats['deprecated'])}")
            total_changes += 1
        else:
            info(f"managed   unchanged   {rel}")

    # 4) .gitignore — 방법론 생성물 무시 블록 보장 (마커 블록만 갱신)
    if ensure_gitignore(target, dry_run=dry):
        total_changes += 1
        tag = "would update" if dry else "updated"
        ok(f"gitignore {tag:13s} .gitignore  (방법론 생성물 무시 블록)")

    # 5) 버전 파일 갱신
    if not dry:
        write_version_file(target, vinfo.get("project_label"))
        ok(f"version   {VERSION_FILE_NAME} → {target_v}")
    else:
        info(f"version   would set {VERSION_FILE_NAME} → {target_v}")

    if dry:
        info(f"총 {total_changes}개 변경 예정. 적용하려면 --apply")
    else:
        ok(f"sync 완료. 총 {total_changes}개 파일 변경.")

    # 5) sibling worktree 처리
    # 구조 마이그레이션이 있었거나 명시적 --include-worktrees 면 같은 repo 의
    # 다른 worktree 에도 sync 를 자동 전파. 그렇지 않으면 *경고만* 표시.
    siblings = _git_sibling_worktrees(target)
    if siblings:
        has_migration = bool(chain)
        include_wt = (
            args.include_worktrees
            if getattr(args, "include_worktrees", None) is not None
            else has_migration  # 마이그레이션 시 기본 True
        )
        if getattr(args, "main_only", False):
            include_wt = False

        force_wt_migration = getattr(args, "force_worktree_migration", False)
        if include_wt:
            info(f"sibling worktree {len(siblings)}개 검토 ({'마이그레이션 자동' if has_migration else '명시 --include-worktrees'})")
            synced, skipped = 0, []
            for wt in siblings:
                safe, reason = _worktree_sync_safety(wt, target_v, force_wt_migration)
                if not safe:
                    skipped.append((wt, reason))
                    continue
                info(f"  → sync worktree: {wt}")
                sub_args = argparse.Namespace(
                    apply=apply,
                    target=args.target,
                    path=str(wt),
                    include_worktrees=False,
                    main_only=True,
                    force_worktree_migration=force_wt_migration,
                    prune=do_prune,
                )
                cmd_sync(sub_args)
                synced += 1
            if skipped:
                warn(f"worktree {len(skipped)}개 skip (안전 가드):")
                for wt, reason in skipped:
                    warn(f"  {Path(wt).name}: {reason}")
                if any("마이그레이션" in r for _, r in skipped):
                    warn("  강제 마이그레이션: --force-worktree-migration "
                         "(stale 브랜치 폴더 구조까지 변경 — 권장 안 함)")
            ok(f"worktree 처리 완료 — sync {synced}, skip {len(skipped)}")
        else:
            warn(f"sibling worktree {len(siblings)}개 발견 — sync 미적용:")
            for wt in siblings[:5]:
                warn(f"  {wt}")
            if len(siblings) > 5:
                warn(f"  ... 외 {len(siblings)-5}개")
            warn("일괄 적용: --include-worktrees (마이그레이션 있으면 기본 True)")
    return 0


def _worktree_sync_safety(
    wt: Path, target_v: str, force_migration: bool
) -> tuple[bool, str]:
    """worktree 에 sync 를 적용해도 안전한지 판정.

    skip 조건 (churn·데이터 꼬임 방지):
      1. 미커밋 변경 존재 → sync churn 이 진행 중 작업 위에 쌓임
      2. 구조 마이그레이션 유발 (worktree 버전 < target) → stale feature
         브랜치에 폴더 rename 강제. --force-worktree-migration 으로만 허용.
    """
    # 1) dirty 검사
    try:
        st = subprocess.check_output(
            ["git", "-C", str(wt), "status", "--porcelain"],
            text=True, stderr=subprocess.DEVNULL,
        ).strip()
        if st:
            n = len(st.splitlines())
            return False, f"미커밋 {n}건 — 진행 중 작업 위에 sync 안 함"
    except Exception:
        return False, "git status 실패 — 안전상 skip"

    # 2) 구조 마이그레이션 유발 검사
    vinfo = load_version_file(wt)
    cur_v = (vinfo or {}).get("methodology_version", "v0.0")
    if cur_v != target_v:
        chain = find_migration_chain(cur_v, target_v)
        if chain and not force_migration:
            return False, (
                f"마이그레이션 유발 ({cur_v}→{target_v}) — "
                f"stale 브랜치 폴더 구조 변경 위험"
            )
    return True, ""


def _git_sibling_worktrees(target: Path) -> list[Path]:
    """target 이 속한 git repo 의 다른 worktree 들 (target 자신 제외)."""
    try:
        out = subprocess.check_output(
            ["git", "-C", str(target), "worktree", "list", "--porcelain"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        return []
    paths: list[Path] = []
    for line in out.splitlines():
        if line.startswith("worktree "):
            wt = Path(line[len("worktree "):].strip()).resolve()
            if wt != target.resolve() and (wt / VERSION_FILE_NAME).exists():
                paths.append(wt)
    return paths


# ─── 명령: sync-all (관리 다운스트림 일괄) ───────────────────────────────────

DEFAULT_BRANCHES = {"main", "master"}


def _git_current_branch(path: Path) -> str | None:
    """path 의 현재 브랜치. git repo 가 아니면 None."""
    try:
        out = subprocess.check_output(
            ["git", "-C", str(path), "rev-parse", "--abbrev-ref", "HEAD"],
            text=True, stderr=subprocess.DEVNULL,
        ).strip()
        return out or None
    except Exception:
        return None


def _git_dirty_count(path: Path) -> int:
    """미커밋 변경 개수. git repo 가 아니거나 실패 시 0."""
    try:
        out = subprocess.check_output(
            ["git", "-C", str(path), "status", "--porcelain"],
            text=True, stderr=subprocess.DEVNULL,
        ).strip()
        return len(out.splitlines()) if out else 0
    except Exception:
        return 0


def _discover_downstreams(root: Path) -> list[Path]:
    """root 바로 아래에서 .methodology-version 을 가진 프로젝트 폴더 수집.

    방법론 원본(METHODOLOGY_ROOT) 자신은 제외한다. 이름순 정렬.
    """
    found: list[Path] = []
    try:
        children = sorted(root.iterdir())
    except OSError:
        return found
    for child in children:
        if not child.is_dir() or child.resolve() == METHODOLOGY_ROOT:
            continue
        if (child / VERSION_FILE_NAME).exists():
            found.append(child)
    return found


def _downstream_state(path: Path) -> dict:
    """한 다운스트림의 sync 판단에 필요한 상태 스냅샷."""
    vinfo = load_version_file(path) or {}
    return {
        "path": path,
        "version": vinfo.get("methodology_version", "?"),
        "applied_commit": vinfo.get("upstream_commit") or "unknown",
        "branch": _git_current_branch(path),
        "dirty": _git_dirty_count(path),
    }


def _is_behind(state: dict, up_commit: str) -> bool:
    """적용 버전/커밋이 업스트림에 뒤처졌는지."""
    if state["version"] != METHODOLOGY_VERSION:
        return True
    applied = state["applied_commit"]
    return applied != "unknown" and up_commit != "unknown" and applied != up_commit


def _sync_all_skip_reason(state: dict, args: argparse.Namespace) -> str | None:
    """--apply 시 이 다운스트림을 건너뛸 이유. 없으면 None.

    오늘의 교훈 2개를 가드로 박제:
      1. dirty → 진행 중 작업 위에 sync churn 을 쌓지 않는다.
      2. 비-main 브랜치 → 피처 브랜치에 방법론을 흩뿌리는 함정(METH-106) 방지.
    """
    if state["branch"] is None:
        return "git repo 아님 — 안전상 skip"
    if state["dirty"] and not args.include_dirty:
        return f"미커밋 {state['dirty']}건 — 진행 중 작업 보호 (--include-dirty 로 강제)"
    if state["branch"] not in DEFAULT_BRANCHES and not args.allow_nonmain:
        return (f"기본 브랜치 아님 (현재 {state['branch']}) — "
                f"main 체크아웃 후 sync (--allow-nonmain 로 강제)")
    return None


def _print_downstream_table(states: list[dict], up_commit: str) -> None:
    """사전 스캔 표 — 버전·브랜치·dirty·업스트림 대비."""
    print()
    print(f"  {'project':22s} {'version':7s} {'branch':26s} {'dirty':>5s}  vs-upstream")
    print(f"  {'-'*22} {'-'*7} {'-'*26} {'-'*5}  {'-'*11}")
    for s in states:
        state = "behind" if _is_behind(s, up_commit) else "최신 ✓"
        print(f"  {s['path'].name:22.22s} {s['version']:7s} "
              f"{(s['branch'] or '?'):26.26s} {s['dirty']:>5d}  {state}")
    print()


def cmd_sync_all(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve() if args.root else METHODOLOGY_ROOT.parent
    apply = args.apply
    projects = _discover_downstreams(root)
    if not projects:
        warn(f"다운스트림 없음 — {root} 아래 {VERSION_FILE_NAME} 보유 폴더가 없습니다.")
        return 0

    up_commit = upstream_commit()
    info(f"sync-all — root: {root}  ({len(projects)}개)  "
         f"{'APPLY' if apply else 'DRY-RUN'}")
    states = [_downstream_state(p) for p in projects]
    _print_downstream_table(states, up_commit)

    processed, skipped = [], []
    for s in states:
        name = s["path"].name
        if apply:
            reason = _sync_all_skip_reason(s, args)
            if reason:
                warn(f"skip  {name}: {reason}")
                skipped.append((name, reason))
                continue
        info(f"──── {name} ────")
        sub = argparse.Namespace(
            apply=apply, target=args.target, path=str(s["path"]),
            include_worktrees=False, main_only=True,
            force_worktree_migration=False, prune=args.prune,
        )
        rc = cmd_sync(sub)
        (processed if rc == 0 else skipped).append(
            name if rc == 0 else (name, f"sync 실패 rc={rc}"))

    print()
    ok(f"sync-all 완료 — 대상 {len(projects)}, 처리 {len(processed)}, skip {len(skipped)}")
    for item in skipped:
        name, reason = item if isinstance(item, tuple) else (item, "?")
        warn(f"  skip {name}: {reason}")
    if not apply:
        info("실제 적용: methodology sync-all --apply "
             "(각 repo commit/push 는 개별 수행 — git add -A 금지, 타깃 스테이징)")
    else:
        info("파일 적용됨 — 각 다운스트림 리뷰 후 개별 commit/push "
             "(git add -A 금지, 방법론 경로만 타깃 스테이징)")
    return 0


# ─── 명령: status ───────────────────────────────────────────────────────────


def cmd_status(args: argparse.Namespace) -> int:
    target = Path(args.path or ".").resolve()
    vinfo = load_version_file(target)
    if not vinfo:
        err(f"{VERSION_FILE_NAME} 없음 — methodology 적용 안 된 폴더")
        return 2
    cur_v = vinfo.get("methodology_version", "?")
    applied_commit = vinfo.get("upstream_commit") or "unknown"
    up_commit = upstream_commit()
    print(f"project          {target}")
    print(f"applied version  {cur_v}  (commit: {applied_commit})")
    print(f"upstream version {METHODOLOGY_VERSION}  (commit: {up_commit})")
    if cur_v != METHODOLOGY_VERSION:
        chain = find_migration_chain(cur_v, METHODOLOGY_VERSION)
        if chain:
            print(f"migrations needed: {len(chain)}")
            for f, t, p in chain:
                print(f"  {f} → {t}  ({p.name})")
        else:
            print("migrations:      (직접 동기화)")
    else:
        # 같은 버전 — upstream commit 격차도 확인 (RFC-001 / MP-001)
        if applied_commit != "unknown" and up_commit != "unknown" and applied_commit != up_commit:
            print(f"status:          behind upstream — {applied_commit} → {up_commit}")
            print("                 (실측 격차 확인: methodology sync --path <project> 로 dry-run)")
        else:
            print("status:          최신 ✓")
    return 0


# ─── 명령: diff ─────────────────────────────────────────────────────────────


def cmd_diff(args: argparse.Namespace) -> int:
    target = Path(args.path or ".").resolve()
    rel = args.file
    src = METHODOLOGY_ROOT / rel
    dst = target / rel
    if not src.exists():
        err(f"upstream에 없음: {rel}")
        return 1
    if not dst.exists():
        info(f"{rel} 은 새 파일 — 전체가 추가될 예정")
        print(read_text(src))
        return 0

    if rel in MANIFEST["managed_files"]:
        new_text, stats = merge_managed(read_text(src), read_text(dst))
        old_text = read_text(dst)
        info(f"managed merge: replaced={stats['replaced']}, added={len(stats['added'])}, deprecated={len(stats['deprecated'])}")
    else:
        old_text = read_text(dst)
        new_text = read_text(src)
        info("shared overwrite (전체 교체)")

    if old_text == new_text:
        ok("동일 — 변경 없음")
        return 0

    diff = unified_diff(old_text.splitlines(keepends=True), new_text.splitlines(keepends=True),
                        fromfile=f"a/{rel}", tofile=f"b/{rel}")
    sys.stdout.writelines(diff)
    return 0


# ─── 명령: version ──────────────────────────────────────────────────────────


def cmd_version(args: argparse.Namespace) -> int:
    print(f"methodology {METHODOLOGY_VERSION}  ({upstream_commit()})  @ {METHODOLOGY_ROOT}")
    return 0


_SENSITIVE_PATTERNS = [".env", "credential", "secret", ".pem", ".key", ".p12", ".pfx"]


def _detect_sensitive(target: Path) -> list[str]:
    """git status에서 sensitive 파일 패턴 탐지."""
    try:
        out = subprocess.check_output(
            ["git", "-C", str(target), "status", "--porcelain"], text=True
        )
    except Exception:
        return []
    hits: list[str] = []
    for line in out.splitlines():
        if not line.strip():
            continue
        path = line[3:].strip().strip('"')
        low = path.lower()
        for pat in _SENSITIVE_PATTERNS:
            if pat in low and not low.endswith(".sample") and not low.endswith(".example"):
                hits.append(path)
                break
    return hits


def cmd_ship(args: argparse.Namespace) -> int:
    """작업 종료 흐름을 단일 명령으로 통합.

    단계:
      1) wrap --strict — 4 라이브 파일 갱신 검증
      2) manifest-check — 70_meta 격리 안전망
      3) sensitive 파일 검사 — .env/credentials/keys 차단
      4) (선택) pnpm test / pnpm build — package.json 있으면
      5) git add -A (--no-add-all 면 staged만)
      6) git commit -m <message>
      7) git push origin <current-branch> (--no-push 면 생략)
    """
    target = Path(args.path or ".").resolve()
    message: str | None = args.message
    if not message and not args.no_commit:
        err("--message 필수 (또는 --no-commit 으로 commit 단계 skip)")
        return 2

    self_py = METHODOLOGY_ROOT / "60_tools" / "methodology.py"
    if not self_py.exists():
        self_py = target / "60_tools" / "methodology.py"

    # 1) wrap --strict
    info("ship: 1/7 — wrap --strict")
    rc = subprocess.call([sys.executable, str(self_py), "wrap", "--path", str(target), "--strict"])
    if rc != 0:
        err("wrap 실패 — 4 라이브 파일을 갱신한 뒤 ship 재호출.")
        return 1

    # 2) manifest-check (본 저장소만 의미 있음 — MANIFEST 파일 존재 시)
    info("ship: 2/7 — manifest-check")
    if (METHODOLOGY_ROOT / "60_tools" / "methodology.py").resolve() == self_py.resolve():
        rc = subprocess.call([sys.executable, str(self_py), "manifest-check"])
        if rc != 0:
            err("manifest-check 실패.")
            return 1
    else:
        print("  (적용 프로젝트 — skip)")

    # 3) sensitive 파일 검사
    info("ship: 3/7 — sensitive 파일 검사")
    if not args.allow_sensitive:
        hits = _detect_sensitive(target)
        if hits:
            err("sensitive 의심 파일 발견:")
            for h in hits:
                err(f"  - {h}")
            err("의도된 것이면 --allow-sensitive 로 재호출.")
            return 1
        print("  ✓ 매칭 없음")

    # 4) test / build (있을 때만)
    pkg = target / "package.json"
    if pkg.exists() and not args.no_test:
        info("ship: 4/7 — pnpm test (있으면)")
        # 어느 매니저인지 단순 추정
        manager = "pnpm" if (target / "pnpm-lock.yaml").exists() else (
            "yarn" if (target / "yarn.lock").exists() else "npm"
        )
        # test 스크립트 있는지 확인
        try:
            pkg_data = json.loads(pkg.read_text(encoding="utf-8"))
            scripts = pkg_data.get("scripts", {})
        except Exception:
            scripts = {}
        if "test" in scripts:
            rc = subprocess.call([manager, "run", "test"], cwd=str(target))
            if rc != 0:
                err("테스트 실패 — push 중단.")
                return 1
        else:
            print("  (package.json scripts.test 없음 — skip)")
    else:
        info("ship: 4/7 — test (package.json 없음 또는 --no-test) — skip")

    if pkg.exists() and not args.no_build:
        info("ship: 5/7 — pnpm build (있으면)")
        manager = "pnpm" if (target / "pnpm-lock.yaml").exists() else (
            "yarn" if (target / "yarn.lock").exists() else "npm"
        )
        try:
            pkg_data = json.loads(pkg.read_text(encoding="utf-8"))
            scripts = pkg_data.get("scripts", {})
        except Exception:
            scripts = {}
        if "build" in scripts:
            rc = subprocess.call([manager, "run", "build"], cwd=str(target))
            if rc != 0:
                err("빌드 실패 — push 중단.")
                return 1
        else:
            print("  (package.json scripts.build 없음 — skip)")
    else:
        info("ship: 5/7 — build (package.json 없음 또는 --no-build) — skip")

    # 6) commit
    if args.no_commit:
        ok("ship: 6/7 — commit (--no-commit) — skip")
        ok("ship: 7/7 — push — skip (--no-commit)")
        return 0

    info("ship: 6/7 — commit")
    # commit 직전에 wrap-state.json 을 *현재 라이브 파일 상태* 로 재생성.
    # 이렇게 해야 wrap-state 와 라이브 파일이 동일 commit 에 패키징되어
    # 새 clone/pull 후의 wrap 검증이 일관됨 (sha matches → 다음 ship 은 *진짜
    # 변경*만 통과).
    try:
        commit_wrap_state(target)
    except Exception as e:
        warn(f"wrap-state 사전 갱신 실패: {e}")
    if not args.no_add_all:
        rc = subprocess.call(["git", "-C", str(target), "add", "-A"])
        if rc != 0:
            err("git add 실패.")
            return 1
    # 변경이 staged 됐는지 확인
    diff_rc = subprocess.call(
        ["git", "-C", str(target), "diff", "--cached", "--quiet"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if diff_rc == 0:
        warn("staged 변경 없음 — commit/push skip")
        return 0
    rc = subprocess.call(["git", "-C", str(target), "commit", "-m", message])
    if rc != 0:
        err("commit 실패.")
        return 1

    # 7) push
    if args.no_push:
        ok("ship: 7/7 — push (--no-push) — skip")
        return 0
    info("ship: 7/7 — push")
    branch = subprocess.check_output(
        ["git", "-C", str(target), "branch", "--show-current"], text=True
    ).strip()
    if not branch:
        err("DETACHED HEAD — push 안 함.")
        return 1
    # ship 은 step 1 에서 이미 wrap --strict 통과 + step 6 직전 wrap-state 동기화.
    # → pre-push hook 의 wrap 재호출은 이 시점에서 항상 fail (sha 동일).
    # 환경변수로 hook 에게 "wrap 건너뛰고 manifest-check 만" 알림.
    env = os.environ.copy()
    env["METHODOLOGY_SHIP_IN_PROGRESS"] = "1"
    rc = subprocess.call(
        ["git", "-C", str(target), "push", "origin", branch], env=env
    )
    if rc != 0:
        err(f"push 실패 (branch: {branch})")
        return 1
    ok(f"ship 완료. branch: {branch}")
    return 0


def cmd_hooks(args: argparse.Namespace) -> int:
    """git hook 자동 설치/제거/점검.

    pre-push: methodology manifest-check + wrap --strict
    """
    target = Path(args.path or ".").resolve()
    # .git이 디렉터리 또는 파일(worktree) 일 수 있음 → git CLI로 hooks 경로 조회
    try:
        hooks_path = Path(subprocess.check_output(
            ["git", "-C", str(target), "rev-parse", "--git-path", "hooks"],
            text=True,
        ).strip())
    except subprocess.CalledProcessError:
        err("git 저장소가 아닙니다.")
        return 2
    if not hooks_path.is_absolute():
        hooks_path = (target / hooks_path).resolve()
    hooks_path.mkdir(parents=True, exist_ok=True)

    pre_push = hooks_path / "pre-push"
    hook_body = """#!/bin/sh
# methodology pre-push hook — installed by `methodology hooks install`
# push 직전 4 라이브 파일 갱신 + 격리 안전망 검증.
# 우회: git push --no-verify

set -e
METH=""
if   [ -f "60_tools/methodology.py" ]; then METH="60_tools/methodology.py"
elif [ -f "50_tools/methodology.py" ]; then METH="50_tools/methodology.py"
elif [ -f "methodology.py" ];           then METH="methodology.py"
fi

if [ -z "$METH" ]; then
  echo "[methodology hook] methodology.py 미발견 — 검증 skip"
  exit 0
fi

python3 "$METH" manifest-check

# ship 이 호출한 push 인 경우 wrap 재실행 skip
# (ship step 1 에서 이미 wrap --strict 통과 + step 6 직전 wrap-state 동기화 →
#  이 시점 wrap 은 항상 sha 일치 = fail. 직접 git push 시는 env 미설정으로 정상 실행).
if [ -n "$METHODOLOGY_SHIP_IN_PROGRESS" ]; then
  echo "[methodology hook] ship 호출 감지 — wrap 재검증 skip (step 1 에서 통과됨)"
  exit 0
fi

# 방법론 sync commit 면제 (METH-022):
# 본 저장소의 방법론 자산을 적용 프로젝트로 전파하는 commit 은 라이브 파일
# (HANDOFF/TODO/checkpoint/observation) 갱신을 동반하지 않으므로 wrap --strict
# 가 정당하게 실패한다. 매번 --no-verify 수동 우회는 마찰 + 우회 습관화 위험.
# HEAD commit 메시지가 sync 패턴이면 manifest-check 만 유지하고 wrap skip.
HEAD_MSG=$(git log -1 --pretty=%s 2>/dev/null || echo "")
case "$HEAD_MSG" in
  "chore(methodology): sync"*|"chore: sync methodology"*|"chore(methodology): v"*"마이그레이션"*)
    echo "[methodology hook] 방법론 sync commit 감지 — wrap skip (manifest-check 는 통과함)"
    echo "  ($HEAD_MSG)"
    exit 0
    ;;
esac

python3 "$METH" wrap --strict
"""

    if args.action == "install":
        if pre_push.exists() and not args.force:
            warn(f"이미 존재: {pre_push}  (--force 로 덮어쓰기)")
            return 1
        pre_push.write_text(hook_body, encoding="utf-8")
        pre_push.chmod(0o755)
        ok(f"pre-push hook 설치: {pre_push}")
        print("  검증 우회 (예외 상황): git push --no-verify")
        return 0
    elif args.action == "uninstall":
        if pre_push.exists():
            pre_push.unlink()
            ok(f"pre-push hook 제거: {pre_push}")
        else:
            warn("설치된 pre-push hook 없음.")
        return 0
    elif args.action == "status":
        if pre_push.exists():
            ok(f"pre-push hook 활성: {pre_push}")
        else:
            warn(f"pre-push hook 비활성. install: methodology hooks install")
        return 0
    err(f"unknown action: {args.action}")
    return 2


def _build_graph_viz(build_root: Path, out_dir: Path) -> None:
    """methodology-graph.json → 지식그래프 시각화 HTML 을 대시보드와 함께 빌드.

    generate-graph-viz.py 가 없거나(미sync 다운스트림) 실패해도 대시보드 빌드를
    막지 않는다 — 경고만 남기고 넘어간다(부수 산출물).
    """
    gen = build_root / "60_tools" / "generate-graph-viz.py"
    if not gen.exists():
        gen = METHODOLOGY_ROOT / "60_tools" / "generate-graph-viz.py"
    if not gen.exists():
        return
    out = out_dir / "methodology-graph-viz.html"
    try:
        subprocess.check_call(
            [sys.executable, str(gen), "--standalone", "--out", str(out)],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        ok(f"graph-viz built: {out}")
    except subprocess.CalledProcessError as e:
        warn(f"graph-viz 빌드 실패 (대시보드는 계속): {e}")


def cmd_dashboard(args: argparse.Namespace) -> int:
    """대시보드 빌드 + 서빙 + URL 출력.

    동작 (v2):
    - 포트 자동 할당 (8765~8799 빈 포트) — 여러 dashboard 동시 운영
    - --branch <name> 지정 시 git worktree 로 그 브랜치 추출 → 캐시 디렉터리에서 빌드 (working tree 안 건드림)
    - 같은 (root, branch) 가 이미 떠 있으면 그 URL 재사용
    - 레지스트리(~/.methodology-dashboards.json)에 등록
    """
    import time as _time
    target = Path(args.path or ".").resolve()
    branch_arg: str | None = args.branch
    explicit_port: int | None = args.port if args.port else None
    serve = not args.no_serve

    builder = METHODOLOGY_ROOT / "60_tools" / "generate-dashboard.py"
    if not builder.exists():
        builder = target / "60_tools" / "generate-dashboard.py"
    if not builder.exists():
        err(f"generate-dashboard.py 미발견 ({builder})")
        return 2

    # 1) 빌드 root 결정 — branch 지정 시 worktree
    build_root: Path
    worktree_to_cleanup: Path | None = None
    branch_label: str
    if branch_arg:
        # git worktree 로 임시 추출
        cache_dir = _cache_dir_for(target, branch_arg)
        cache_dir.parent.mkdir(parents=True, exist_ok=True)
        # 기존 cache_dir 정리 (이전 worktree 가 남아 있을 수 있음)
        if cache_dir.exists():
            subprocess.call(
                ["git", "-C", str(target), "worktree", "remove", "--force", str(cache_dir)],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
            shutil.rmtree(cache_dir, ignore_errors=True)
        info(f"git worktree add (branch={branch_arg}) → {cache_dir}")
        try:
            subprocess.check_call(
                ["git", "-C", str(target), "worktree", "add", "--detach", str(cache_dir), branch_arg],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
        except subprocess.CalledProcessError:
            err(f"git worktree add 실패 — branch '{branch_arg}' 존재 확인.")
            return 1
        build_root = cache_dir
        worktree_to_cleanup = cache_dir
        branch_label = branch_arg
        out_path = cache_dir / "dashboard.html"
    else:
        build_root = target
        # 기본 빌드 위치: _start/.cache/ (사용자가 직접 dashboard.html 더블클릭하는 휴먼에러 차단)
        # fallback: 루트 (legacy)
        if args.out:
            out_path = Path(args.out)
        else:
            start_cache = target / "_start" / ".cache"
            if (target / "_start").exists():
                start_cache.mkdir(parents=True, exist_ok=True)
                out_path = start_cache / "dashboard.html"
                # 옛 루트 dashboard.html 정리 (있으면)
                legacy = target / "dashboard.html"
                if legacy.exists():
                    try:
                        legacy.unlink()
                        info(f"옛 루트 dashboard.html 제거 (cache 로 이동)")
                    except Exception:
                        pass
            else:
                out_path = target / "dashboard.html"  # _start 없는 환경 fallback
        try:
            branch_label = subprocess.check_output(
                ["git", "-C", str(target), "branch", "--show-current"],
                text=True, stderr=subprocess.DEVNULL,
            ).strip() or "DETACHED"
        except Exception:
            branch_label = "unknown"

    # 2) 빌드
    info(f"dashboard 빌드: {build_root}  (branch: {branch_label})")
    try:
        subprocess.check_call(
            [sys.executable, str(builder), "--root", str(build_root), "--out", str(out_path)],
        )
    except subprocess.CalledProcessError as e:
        err(f"빌드 실패: {e}")
        if worktree_to_cleanup:
            subprocess.call(
                ["git", "-C", str(target), "worktree", "remove", "--force", str(worktree_to_cleanup)],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
        return 1

    # 2b) 지식그래프 시각화 동반 빌드 (methodology-graph.json → viz HTML)
    _build_graph_viz(build_root, out_path.parent)

    # commit 정보
    commit = "unknown"
    try:
        commit = subprocess.check_output(
            ["git", "-C", str(build_root), "rev-parse", "--short", "HEAD"],
            text=True, stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        pass

    if not serve:
        ok(f"dashboard built: {out_path}  (branch: {branch_label}, commit: {commit})")
        print(f"  파일 열기: open {out_path}")
        return 0

    # 3) 레지스트리 정리 + 재사용 점검
    registry = _registry_cleanup()
    reused_entry: dict | None = None
    for e in registry:
        same_root = Path(e.get("root", "")).resolve() == target.resolve()
        same_branch = (e.get("branch") or "") == branch_label
        if same_root and same_branch:
            # 이미 떠 있음 — 재사용
            reused_entry = e
            break

    if reused_entry:
        port = reused_entry["port"]
        url = f"http://localhost:{port}"
        ok(f"dashboard already serving: {url}  (root: {target.name}, branch: {branch_label}, commit: {commit})")
        print(f"  ⌘+클릭으로 열기: {url}  (새로고침하면 방금 빌드 반영)")
        if args.open:
            try:
                if sys.platform == "darwin":
                    subprocess.Popen(["open", url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    import webbrowser
                    webbrowser.open(url)
            except Exception as e:
                warn(f"브라우저 자동 열기 실패: {e}")
        if worktree_to_cleanup:
            # 재사용 시 새 worktree 는 불필요 — 정리. 단 *기존 dashboard 서버*가 그
            # worktree 경로를 root 로 떠 있는지 확인하고, 그렇다면 정리 안 함.
            existing_root = Path(reused_entry.get("root_at_serve", "")) if reused_entry.get("root_at_serve") else None
            if not existing_root or existing_root.resolve() != worktree_to_cleanup.resolve():
                subprocess.call(
                    ["git", "-C", str(target), "worktree", "remove", "--force", str(worktree_to_cleanup)],
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                )
        return 0

    # 4) 포트 할당
    if explicit_port:
        if _port_in_use(explicit_port):
            err(f"--port {explicit_port} 이미 점유됨. 자동 할당을 원하면 --port 생략.")
            if worktree_to_cleanup:
                subprocess.call(
                    ["git", "-C", str(target), "worktree", "remove", "--force", str(worktree_to_cleanup)],
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                )
            return 1
        port = explicit_port
    else:
        port = _find_free_dashboard_port(registry)
        if port is None:
            err(f"포트 {DASHBOARD_PORT_START}-{DASHBOARD_PORT_END} 모두 점유. methodology dashboard list 로 확인.")
            if worktree_to_cleanup:
                subprocess.call(
                    ["git", "-C", str(target), "worktree", "remove", "--force", str(worktree_to_cleanup)],
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                )
            return 1

    # 5) 백그라운드 서빙
    url = f"http://localhost:{port}"
    serve_cmd = [
        sys.executable, str(builder),
        "--root", str(build_root),
        "--out", str(out_path),
        "--serve", "--port", str(port),
    ]
    info(f"serving at {url} (background, root: {build_root})")
    proc = subprocess.Popen(
        serve_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True,
    )
    _time.sleep(0.6)

    # 6) 레지스트리 등록
    entry = {
        "port": port,
        "root": str(target),
        "root_at_serve": str(build_root),
        "branch": branch_label,
        "commit": commit,
        "pid": proc.pid,
        "started_at": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
        "is_worktree": worktree_to_cleanup is not None,
    }
    registry.append(entry)
    _save_registry(registry)

    ok(f"dashboard serving: {url}  (root: {target.name}, branch: {branch_label}, commit: {commit}, pid: {proc.pid})")
    print(f"  ⌘+클릭으로 열기: {url}")
    print(f"  종료: methodology dashboard stop --port {port}  또는  kill {proc.pid}")
    if worktree_to_cleanup:
        print(f"  worktree: {worktree_to_cleanup}  (서버 종료 후 'methodology dashboard stop' 으로 정리)")
    # --open: 자동 브라우저 실행 (macOS: open / 기타: webbrowser 표준 모듈)
    if args.open:
        try:
            if sys.platform == "darwin":
                subprocess.Popen(["open", url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                import webbrowser
                webbrowser.open(url)
            info(f"브라우저로 {url} 열기")
        except Exception as e:
            warn(f"브라우저 자동 열기 실패: {e}")
    return 0


def cmd_dashboard_list(args: argparse.Namespace) -> int:
    """떠 있는 모든 dashboard 목록 출력."""
    registry = _registry_cleanup()
    if not registry:
        info("실행 중인 dashboard 없음.")
        return 0
    print(f"{'PORT':<6}  {'PROJECT':<18}  {'BRANCH':<28}  {'COMMIT':<10}  {'PID':<8}  STARTED")
    print("─" * 100)
    for e in registry:
        proj = Path(e.get("root", "?")).name[:18]
        branch = (e.get("branch") or "?")[:28]
        commit = (e.get("commit") or "?")[:10]
        pid = str(e.get("pid", "?"))[:8]
        started = e.get("started_at", "?")
        print(f"{e.get('port', '?'):<6}  {proj:<18}  {branch:<28}  {commit:<10}  {pid:<8}  {started}")
    return 0


def cmd_dashboard_stop(args: argparse.Namespace) -> int:
    """특정 dashboard 또는 모두 종료."""
    import signal as _signal
    registry = _registry_cleanup()
    if not registry:
        info("실행 중인 dashboard 없음.")
        return 0

    targets: list[dict] = []
    if args.all:
        targets = list(registry)
    elif args.port:
        targets = [e for e in registry if e.get("port") == args.port]
        if not targets:
            err(f"port {args.port} 에 dashboard 없음.")
            return 1
    else:
        err("--port <N> 또는 --all 명시 필요.")
        return 2

    stopped = 0
    for e in targets:
        pid = e.get("pid")
        port = e.get("port")
        is_worktree = e.get("is_worktree", False)
        root_at_serve = e.get("root_at_serve")
        try:
            if pid:
                try:
                    os.killpg(os.getpgid(pid), _signal.SIGTERM)
                except ProcessLookupError:
                    pass
        except Exception as ex:
            warn(f"port {port} pid {pid} 종료 실패: {ex}")
        # worktree 정리
        if is_worktree and root_at_serve:
            target = Path(e.get("root", "."))
            subprocess.call(
                ["git", "-C", str(target), "worktree", "remove", "--force", str(root_at_serve)],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
        stopped += 1
        ok(f"stopped: port {port}, pid {pid}, branch {e.get('branch')}")

    # registry 갱신 (정지된 것 제외)
    remaining = [e for e in registry if e not in targets]
    _save_registry(remaining)
    return 0


# ─── 대시보드 레지스트리 ───────────────────────────────────────────────────
# ~/.methodology-dashboards.json 에 떠 있는 dashboard 들의 (port, root, branch, pid) 기록.
# 여러 프로젝트·브랜치 dashboard 를 동시 운영하기 위함.

DASHBOARD_REGISTRY_FILE = Path.home() / ".methodology-dashboards.json"
DASHBOARD_PORT_START = 8765
DASHBOARD_PORT_END = 8799


def _load_registry() -> list[dict]:
    if not DASHBOARD_REGISTRY_FILE.exists():
        return []
    try:
        return json.loads(DASHBOARD_REGISTRY_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def _save_registry(entries: list[dict]) -> None:
    try:
        DASHBOARD_REGISTRY_FILE.write_text(
            json.dumps(entries, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    except Exception:
        pass


def _registry_cleanup() -> list[dict]:
    """죽은 PID·안 떠 있는 포트 제거. 반환: 살아있는 entries."""
    entries = _load_registry()
    alive: list[dict] = []
    for e in entries:
        pid = e.get("pid")
        port = e.get("port")
        is_alive = False
        if pid:
            try:
                os.kill(pid, 0)
                is_alive = True
            except ProcessLookupError:
                pass
            except PermissionError:
                is_alive = _port_in_use(port) if port else False
        elif port:
            is_alive = _port_in_use(port)
        if is_alive:
            alive.append(e)
    if len(alive) != len(entries):
        _save_registry(alive)
    return alive


def _find_free_dashboard_port(registry: list[dict]) -> int | None:
    """레지스트리·실제 점유를 모두 고려해 빈 포트 반환."""
    used = {e["port"] for e in registry if e.get("port")}
    for p in range(DASHBOARD_PORT_START, DASHBOARD_PORT_END + 1):
        if p in used:
            continue
        if _port_in_use(p):
            continue
        return p
    return None


def _slugify_branch(branch: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", branch).strip("-") or "branch"


def _cache_dir_for(target: Path, branch: str) -> Path:
    """브랜치별 dashboard 빌드 캐시 위치 — 프로젝트 폴더 안 어지럽히지 않음."""
    return Path.home() / ".methodology-cache" / target.name / _slugify_branch(branch)


def _port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.2)
        try:
            s.connect(("127.0.0.1", port))
            return True
        except OSError:
            return False


def _running_dashboard_root(port: int) -> str | None:
    """포트에 떠 있는 dashboard 서버가 서빙하는 root 경로를 반환 (없으면 None)."""
    import urllib.request
    for name in ("dashboard.html", ""):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/{name}", timeout=0.6) as r:
                html = r.read().decode("utf-8", errors="ignore")
            m = re.search(r'"root":\s*"([^"]*)"', html)
            if m:
                return m.group(1)
        except Exception:
            continue
    return None


def _kill_port_listeners(port: int) -> None:
    """해당 포트의 LISTEN 프로세스를 SIGTERM."""
    import signal
    try:
        out = subprocess.check_output(
            ["lsof", "-ti", f":{port}", "-sTCP:LISTEN"],
            text=True, stderr=subprocess.DEVNULL,
        ).strip()
    except subprocess.CalledProcessError:
        return
    for pid_str in out.splitlines():
        try:
            os.kill(int(pid_str.strip()), signal.SIGTERM)
        except (ValueError, ProcessLookupError, PermissionError):
            pass


# ─── wrap-state: 콘텐츠 해시 기반 변경 검증 ─────────────────────────────────
# 동일 날짜 다중 ship 오탐(false-positive) 방지.
# mtime("오늘 변경됨")만으로는 *콘텐츠가 실제로 갱신됐는가*를 보장하지 못함.
# → 라이브 파일의 sha256 을 wrap-state.json 에 저장, 다음 wrap 에서 변경 여부 검증.

_WRAP_STATE_VERSION = 1
_WRAP_TRACKED: list[tuple[str, str]] = [
    # (display name, relative path under target)
    ("HANDOFF.md",         "HANDOFF.md"),
    ("TODO.md",            "TODO.md"),
    (".ai/checkpoint.md",  ".ai/checkpoint.md"),
]
def _wrap_obs_dirs(target: Path) -> tuple[str, ...]:
    """관찰 로그 디렉터리 (v4.0 고정).

    50_resources/ai_observations — 적용 프로젝트·source 공통.
    70_meta/observations — source 저장소 전용(메타-방법론 격리).
    """
    return ("50_resources/ai_observations", "70_meta/observations")


def wrap_state_path(target: Path) -> Path:
    return target / ".ai" / "wrap-state.json"


def load_wrap_state(target: Path) -> dict[str, Any] | None:
    p = wrap_state_path(target)
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return None


def save_wrap_state(target: Path, state: dict[str, Any]) -> None:
    p = wrap_state_path(target)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(
        json.dumps(state, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def file_sha256(p: Path) -> str | None:
    if not p.exists() or not p.is_file():
        return None
    h = hashlib.sha256()
    with p.open("rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def current_git_head(target: Path) -> str | None:
    try:
        return subprocess.check_output(
            ["git", "-C", str(target), "rev-parse", "HEAD"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        return None


def list_observation_files(target: Path) -> list[str]:
    """관찰 로그 파일들의 relative path 리스트 (정렬됨).

    구조 탐지: layout 기반 + 마이그레이션 중간 양쪽 모두 검사.
    """
    out: list[str] = []
    for d in _wrap_obs_dirs(target):
        dp = target / d
        if dp.is_dir():
            for f in dp.glob("*.md"):
                if f.name.startswith("_"):
                    continue
                out.append(str(f.relative_to(target)))
    return sorted(out)


def bootstrap_wrap_state(target: Path) -> dict[str, Any]:
    """최초 1회 — 현재 파일 상태를 baseline 으로 저장."""
    state: dict[str, Any] = {
        "version": _WRAP_STATE_VERSION,
        "bootstrapped_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "last_validated_commit": current_git_head(target),
        "last_validated_at": None,
        "files": {},
        "observations": {"validated_files": list_observation_files(target)},
    }
    for name, rel in _WRAP_TRACKED:
        sha = file_sha256(target / rel)
        state["files"][name] = {"sha256": sha}
    save_wrap_state(target, state)
    return state


def commit_wrap_state(target: Path) -> None:
    """ship 의 push 단계 성공 후 호출 — 새 baseline 으로 wrap-state 갱신."""
    state = load_wrap_state(target) or {
        "version": _WRAP_STATE_VERSION,
        "files": {},
        "observations": {"validated_files": []},
    }
    state["version"] = _WRAP_STATE_VERSION
    state["last_validated_commit"] = current_git_head(target)
    state["last_validated_at"] = datetime.now(timezone.utc).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )
    state.setdefault("files", {})
    for name, rel in _WRAP_TRACKED:
        sha = file_sha256(target / rel)
        state["files"][name] = {"sha256": sha}
    state["observations"] = {"validated_files": list_observation_files(target)}
    save_wrap_state(target, state)


# 라이브 파일 사이즈 규정 (줄수) — 비대화 방지.
# HANDOFF/checkpoint 는 부팅 프라이머·인계서라 *꽉 짜인* 상태여야 부팅 컨텍스트로 작동한다.
# 초과 시 "기본 부팅 컨텍스트 = CLAUDE.md + HANDOFF" 설계가 무력화(현재 포커스가 노이즈에 묻힘).
LIVE_FILE_LINE_LIMITS = {
    "HANDOFF.md": 150,          # 템플릿 규정: ≤150줄
    ".ai/checkpoint.md": 200,   # 백서 §2-2: ≤200줄
}
TODO_DONE_SOFT_CAP = 6          # 템플릿 규정: 최근 완료 ~4건만 유지


def live_file_size_warnings(target: Path) -> list[str]:
    """라이브 파일 비대화 경고 목록 — wrap·boot 공용.

    HANDOFF/checkpoint 줄수 초과 + TODO Done 아카이브 과다를 탐지.
    경고만 반환(실패 아님) — 이미 초과된 다운스트림의 ship 을 즉시 막지 않기 위함.
    """
    warnings: list[str] = []
    for rel, limit in LIVE_FILE_LINE_LIMITS.items():
        p = target / rel
        if not p.exists():
            continue
        n = len(read_text(p).splitlines())
        if n > limit:
            warnings.append(
                f"{rel}: {n}줄 (규정 ≤{limit}줄, {n/limit:.1f}×) — 트리밍 필요. "
                "오래된 내용은 git·40_dev/snapshots 로 이관하고 요지만 남긴다."
            )
    todo_p = target / "TODO.md"
    if todo_p.exists():
        try:
            section = re.search(
                r"^##\s+Done\s*$(.*?)(?=^##\s|\Z)",
                read_text(todo_p), re.MULTILINE | re.DOTALL,
            )
            done = len(re.findall(r"^###\s+", section.group(1), re.MULTILINE)) if section else 0
            if done > TODO_DONE_SOFT_CAP:
                warnings.append(
                    f"TODO.md Done {done}건 (권장 ~4건) — 완료 아카이브 과다. "
                    "이전 완료는 git log·snapshots 로 이관."
                )
        except Exception:
            pass
    return warnings


def cmd_wrap(args: argparse.Namespace) -> int:
    """세션·작업 종료 검증 — 4개 라이브 파일 *실제 콘텐츠 갱신* 점검.

    동작 (v4.1+): wrap-state.json 의 sha256 과 비교하여 콘텐츠 변경 여부를 검증.
    동일 날짜에 ship 을 여러 번 해도 매번 *실제 내용 갱신* 없이는 통과 못 함.

    bootstrap: wrap-state.json 이 없으면 현재 상태를 baseline 으로 1회 저장 후 pass.
    --strict: 미갱신 1건이라도 있으면 exit code 1 (CI / pre-push hook 용).
    """
    target = Path(args.path or ".").resolve()
    today = datetime.now(timezone.utc).date().isoformat()
    info(f"wrap check: {target}  (today={today} UTC)")
    print()

    state = load_wrap_state(target)
    bootstrapped = False
    if state is None:
        warn(".ai/wrap-state.json 없음 — 현재 파일 상태를 baseline 으로 부트스트랩.")
        warn("다음 wrap부터는 라이브 파일이 *실제로 변경*되어야 통과합니다.")
        state = bootstrap_wrap_state(target)
        bootstrapped = True

    checks: list[tuple[str, bool, str]] = []
    missing = 0

    # ── 1-3) 콘텐츠 해시 비교 ────────────────────────────────────────────────
    stored_files = state.get("files", {})
    for name, rel in _WRAP_TRACKED:
        p = target / rel
        if not p.exists():
            checks.append((name, False, "파일 없음 — 생성 필요"))
            missing += 1
            continue
        cur = file_sha256(p)
        old = (stored_files.get(name) or {}).get("sha256")
        if bootstrapped:
            checks.append((name, True, "bootstrapped (baseline 저장)"))
        elif old is None:
            checks.append((name, True, "신규 추적 (sha 등록)"))
        elif cur != old:
            checks.append((name, True, "콘텐츠 변경 확인 (sha 갱신)"))
        else:
            checks.append((
                name,
                False,
                "콘텐츠 미변경 (sha 동일) — 실제 내용 갱신 필요",
            ))
            missing += 1

    # ── 4) ai_observations — 직전 검증 이후 *새 파일* 1건 이상 + frontmatter 형식 검증 ─
    seen = set((state.get("observations") or {}).get("validated_files", []))
    cur_obs = list_observation_files(target)
    new_obs = [f for f in cur_obs if f not in seen]
    if bootstrapped:
        checks.append(("ai_observations/", True, "bootstrapped"))
    elif not new_obs:
        checks.append((
            "ai_observations/",
            False,
            f"신규 .md 없음 — `methodology observe --slug <s> --task-type <t> --summary <m>` 로 생성 필요",
        ))
        missing += 1
    else:
        # 새 파일들의 frontmatter 선행 검증 — CI 까지 안 가도 wrap 에서 즉시 fail
        invalid: list[tuple[str, list[str]]] = []
        for rel in new_obs:
            p = target / rel
            errs = validate_observation_file(p)
            if errs:
                invalid.append((rel, errs))
        if invalid:
            checks.append((
                "ai_observations/",
                False,
                f"신규 {len(new_obs)}건 중 {len(invalid)}건 형식 오류 — `methodology observe new ...` 사용 권장",
            ))
            for rel, errs in invalid:
                print(f"    \033[31m·\033[0m {rel}:")
                for e in errs:
                    print(f"        {e}")
            missing += 1
        else:
            checks.append((
                "ai_observations/",
                True,
                f"새 관찰 로그 {len(new_obs)}건 (형식 검증 통과)",
            ))

    # 출력
    for name, ok_flag, hint in checks:
        mark = "\033[32m✓\033[0m" if ok_flag else "\033[31m✗\033[0m"
        print(f"  {mark} {name:<28} — {hint}")

    # git status 요약
    print()
    info("git status 요약:")
    try:
        out = subprocess.check_output(
            ["git", "-C", str(target), "status", "--short"], text=True
        )
        if out.strip():
            for line in out.strip().split("\n")[:15]:
                print(f"    {line}")
            count = len(out.strip().split("\n"))
            if count > 15:
                print(f"    ... 총 {count}건")
        else:
            print("    (변경 없음)")
    except Exception as e:
        warn(f"git status 실패: {e}")

    # ── WIP 캡 린트 (METH-086) — TODO ## InProgress 최대 3 (경고, 실패 아님) ──
    todo_p = target / "TODO.md"
    if todo_p.exists():
        try:
            section = re.search(
                r"^##\s+InProgress\s*$(.*?)(?=^##\s|\Z)",
                read_text(todo_p), re.MULTILINE | re.DOTALL,
            )
            wip = len(re.findall(r"^###\s+", section.group(1), re.MULTILINE)) if section else 0
            if wip > 3:
                warn(f"WIP 캡 초과: InProgress {wip}건 (권장 ≤3) — 미완결 누적·AI 팬아웃 신호. 완료 처리하거나 Blocked/Ready로 이동 검토.")
        except Exception:
            pass

    # ── 라이브 파일 사이즈 린트 (METH-101) — 비대화 방지 (경고, 실패 아님) ──
    # 비대한 HANDOFF/checkpoint 는 부팅 프라이머로 무력 → 새 세션이 '프로세스를 모른 채' 시작하는 주원인.
    size_warns = live_file_size_warnings(target)
    for w in size_warns:
        warn(f"사이즈: {w}")

    print()
    if missing == 0:
        ok(
            "4/4 라이브 파일 콘텐츠 갱신 확인됨. "
            "ship 의 commit 직전 wrap-state 가 새 baseline 으로 저장됩니다."
        )
        return 0
    else:
        err(
            f"{missing}/4 라이브 파일 콘텐츠 미갱신 — *실제 내용*을 갱신한 뒤 wrap 재호출. "
            "(mtime 만 갱신해서는 통과 안 됨)"
        )
        return 1 if args.strict else 0


def cmd_boot(args: argparse.Namespace) -> int:
    """세션 시작 브리핑 — 부팅 계약(CLAUDE.md §2)을 한 번에 실행·점검.

    서술 의무였던 부팅 절차를 *실행 가능한 명령*으로 격상. 출력:
      [1] 00_briefs/current 브리프 로드 목록 (날짜순 — 본문은 AI가 직접 읽음)
      [2] HANDOFF 현재 포커스 + 최근 변경 1건
      [3] checkpoint 최신 인계 요지
      [4] 라이브 파일 사이즈 경고 (비대화 탐지 — 비대하면 부팅 프라이머로 무력)
      [5] dashboard 빌드·서빙 URL
    새 세션은 `methodology boot` 로 시작해 IR 질문에 바로 뛰어드는 실수를 방지.
    """
    def _clip(s: str, n: int) -> str:
        s = s.strip()
        return s if len(s) <= n else s[:n] + "…"

    target = Path(args.path or ".").resolve()
    print()
    ok("methodology boot — 세션 시작 브리핑")
    print()

    # [1] 브리프 로드 목록 — 유형 폴더별 그룹 (standing ★ 최상단, archived 제외)
    print("\033[1m[1] 부팅 브리프\033[0m (전부 읽고 반영 보고, 옛 브리프 충돌 시 사용자 확인)")
    briefs_root = target / "00_briefs"
    # 표시 순서·라벨 (정의 안 된 폴더는 이름 그대로, 맨 뒤)
    BRIEF_LABELS = {
        "standing": "★ 상시 SOP (반복작업 — 착수 전 확인)",
        "meetings": "회의록", "research": "리서치", "reference": "참고자료",
        "ideas": "아이디어·방향", "current": "현재·미분류",
    }
    order = ["standing", "meetings", "research", "reference", "ideas", "current"]
    found_any = False
    if briefs_root.is_dir():
        subs = [p for p in briefs_root.iterdir() if p.is_dir() and p.name != "archived"]
        subs.sort(key=lambda p: (order.index(p.name) if p.name in order else len(order), p.name))
        for sub in subs:
            files = sorted(
                p for p in sub.glob("*.md")
                if p.name != "_README.md" and "template" not in p.name.lower()
            )
            if not files:
                continue
            found_any = True
            star = sub.name == "standing"
            print(f"  \033[1m{BRIEF_LABELS.get(sub.name, sub.name)} ({sub.name}/):\033[0m")
            for p in files:
                print(f"    {'★' if star else '·'} {p.relative_to(target)}")
    if not found_any:
        print("    (브리프 없음)")
    print()

    # [2] HANDOFF 현재 포커스
    print("\033[1m[2] HANDOFF 현재 포커스\033[0m")
    hp = target / "HANDOFF.md"
    if hp.exists():
        txt = read_text(hp)
        m = re.search(r"^-\s+\*\*Working on\*\*:\s*(.+)$", txt, re.MULTILINE)
        print(f"    Working on: {_clip(m.group(1), 500) if m else '(미기재)'}")
        rc = re.search(r"^##\s+Recent Changes.*?\n(.*?)(?=^##\s|\Z)", txt, re.MULTILINE | re.DOTALL)
        first = re.search(r"^-\s+(.+)$", rc.group(1), re.MULTILINE) if rc else None
        if first:
            print(f"    최근 변경: {_clip(first.group(1), 300)}")
    else:
        print("    (HANDOFF.md 없음)")
    print()

    # [3] checkpoint 최신 인계 요지 (상단 헤딩 + 요지 블록)
    print("\033[1m[3] checkpoint 인계 요지\033[0m")
    cp = target / ".ai" / "checkpoint.md"
    if cp.exists():
        shown = 0
        for ln in read_text(cp).splitlines():
            if ln.strip():
                print(f"    {_clip(ln, 180)}")
                shown += 1
            if shown >= 4:
                break
    else:
        print("    (.ai/checkpoint.md 없음)")
    print()

    # [4] 라이브 파일 사이즈
    print("\033[1m[4] 라이브 파일 사이즈\033[0m")
    sw = live_file_size_warnings(target)
    if sw:
        for w in sw:
            warn(f"사이즈: {w}")
    else:
        print("    ✓ 규정 이내 (HANDOFF ≤150 · checkpoint ≤200 · TODO Done ~4)")
    print()

    # [5] dashboard
    print("\033[1m[5] 대시보드\033[0m")
    if not args.no_dashboard:
        dash_ns = argparse.Namespace(
            path=str(target), branch=args.branch, port=None,
            no_serve=False, out=None, open=False, dashboard_cmd=None,
        )
        cmd_dashboard(dash_ns)
    else:
        print("    (--no-dashboard: skip)")
    print()

    info("다음: 브리프 본문을 직접 읽고 반영 내역 보고 → 옛 브리프 충돌 시 사용자 확인 → 작업 착수(branch-first).")
    return 0


# ─── 외주 인계용 export ─────────────────────────────────────────────────────
# 코드만 추출, 방법론·메타 자산 제외.

# 디렉터리·파일 패턴 (root 기준 상대경로)
EXPORT_EXCLUDE_DIRS: set[str] = {
    # 방법론 NN_ 폴더 (현재 + 예약 슬롯)
    "00_briefs", "10_foundation", "20_guides", "30_planning",
    "40_dev", "50_resources", "60_tools", "70_meta",
    "80_reserved", "90_archive",
    # 진입점·캐시·메타
    "_start", ".ai", ".methodology-cache",
    # 본 저장소 전용
    "migrations",
    # 로컬 도구
    ".claude", ".codex",
    # 빌드 산출물·캐시 (Next.js / Node / Python / 기타)
    "node_modules", ".next", ".nuxt", ".svelte-kit", ".vercel", ".turbo",
    "dist", "build", "out", "coverage", ".cache",
    "__pycache__", ".venv", "venv", ".pytest_cache", ".mypy_cache",
    ".parcel-cache", ".angular",
}

# 루트 한정 파일 (방법론 파일)
EXPORT_EXCLUDE_FILES: set[str] = {
    "CLAUDE.md", "AGENTS.md", "HANDOFF.md", "TODO.md", "ONBOARDING.md",
    "AI-LOG.md", "dashboard.html", ".methodology-version",
    "open-dashboard.command",
}

# 어느 깊이든 매칭되는 파일명 (OS·에디터 메타·빌드 캐시)
EXPORT_EXCLUDE_BASENAMES: set[str] = {
    ".DS_Store", "Thumbs.db", ".eslintcache", ".tsbuildinfo",
    "npm-debug.log", "yarn-error.log", "pnpm-debug.log",
}

# .github/workflows 안에서 제외 패턴
EXPORT_EXCLUDE_WORKFLOW_PREFIX = "methodology-"

# sensitive 파일 패턴 (인계 차단)
EXPORT_SENSITIVE = [".env", "credential", "secret", ".pem", ".key", ".p12", ".pfx"]


def _export_should_skip(rel: str) -> bool:
    """rel은 source 기준 상대경로 (POSIX 슬래시)."""
    parts = rel.split("/")
    if not parts:
        return False
    top = parts[0]
    # 디렉터리 패턴 — 어느 깊이든 제외
    for d in EXPORT_EXCLUDE_DIRS:
        if d in parts:
            return True
    # 루트 파일 (방법론 파일은 루트에만 있음)
    if len(parts) == 1 and top in EXPORT_EXCLUDE_FILES:
        return True
    # 어느 깊이든 — OS·에디터·빌드 캐시 basename
    if parts[-1] in EXPORT_EXCLUDE_BASENAMES:
        return True
    # .github/workflows/methodology-* 제외
    if (
        len(parts) >= 3 and parts[0] == ".github" and parts[1] == "workflows"
        and parts[-1].startswith(EXPORT_EXCLUDE_WORKFLOW_PREFIX)
    ):
        return True
    # 빌드 산출물 (캐시)
    if ".methodology-cache" in parts or "_start" in parts:
        return True
    return False


def _export_is_sensitive(rel: str) -> bool:
    low = rel.lower()
    if low.endswith(".sample") or low.endswith(".example"):
        return False
    return any(pat in low for pat in EXPORT_SENSITIVE)


def cmd_export(args: argparse.Namespace) -> int:
    """외주 인계용 — 코드만 추출, 방법론·메타 자산 제외.

    동작:
      1) source 트리 walk, 제외 패턴 매칭 시 skip
      2) sensitive 파일 검사 (.env/credentials/keys 등) — 발견 시 차단
      3) 결과 검증 — 방법론 흔적 잔존 시 fail
      4) --dry-run: 무엇이 포함·제외되는지만 출력
      5) --zip: tar.gz 생성

    출력:
      <parent>/<project>-handover/   (기본)
      또는 --target <path>
    """
    import time as _time
    source = Path(args.path or ".").resolve()
    if not source.exists():
        err(f"source 미존재: {source}")
        return 1

    # 본 저장소(methodology-source) export 차단 — 의미 없음 + 위험
    if (source / "60_tools" / "methodology.py").exists() and (source / "70_meta").exists():
        warn("source 가 methodology-source 자체로 보입니다. export 는 *적용 프로젝트* 용입니다.")
        if not args.force:
            err("--force 없이는 진행 안 함.")
            return 2

    target = Path(args.target).resolve() if args.target else (source.parent / f"{source.name}-handover")
    dry = args.dry_run

    info(f"export: {source}  →  {target}")
    if dry:
        info("(dry-run) 실제 복사 안 함")

    if target.exists() and not args.force:
        err(f"target 이미 존재: {target}  (--force 로 덮어쓰기)")
        return 1
    if not dry and target.exists() and args.force:
        shutil.rmtree(target)

    # 1) walk + filter
    included: list[str] = []
    excluded: list[str] = []
    sensitive_hits: list[str] = []

    for src_path in sorted(source.rglob("*")):
        if src_path.is_dir():
            continue
        if ".git" in src_path.relative_to(source).parts and not args.include_git:
            excluded.append(str(src_path.relative_to(source)))
            continue
        rel = str(src_path.relative_to(source)).replace("\\", "/")
        if _export_should_skip(rel):
            excluded.append(rel)
            continue
        if _export_is_sensitive(rel):
            sensitive_hits.append(rel)
            continue
        included.append(rel)

    # 2) sensitive 차단
    if sensitive_hits and not args.allow_sensitive:
        err("sensitive 의심 파일 발견 — export 차단:")
        for s in sensitive_hits[:20]:
            err(f"  {s}")
        if len(sensitive_hits) > 20:
            err(f"  ... 외 {len(sensitive_hits) - 20}건")
        err("의도된 것이면 --allow-sensitive 로 재호출.")
        return 1
    elif sensitive_hits:
        warn(f"sensitive 의심 파일 {len(sensitive_hits)}건 — --allow-sensitive 로 포함됨")
        included.extend(sensitive_hits)

    # 3) dry-run 보고
    print()
    ok(f"포함 {len(included):,} 파일")
    ok(f"제외 {len(excluded):,} 파일")
    if args.verbose or dry:
        print("\n=== 포함 (최대 30개 미리보기) ===")
        for r in included[:30]:
            print(f"  ✓ {r}")
        if len(included) > 30:
            print(f"  ... 외 {len(included) - 30}건")
        print("\n=== 제외 (최대 20개 미리보기) ===")
        for r in excluded[:20]:
            print(f"  ✗ {r}")
        if len(excluded) > 20:
            print(f"  ... 외 {len(excluded) - 20}건")

    if dry:
        info("(dry-run) target 생성 안 함. --dry-run 빼고 재호출하면 실제 export.")
        return 0

    # 4) 복사
    info(f"복사 중: {target}")
    for rel in included:
        src = source / rel
        dst = target / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

    # 5) 결과 검증 — 방법론 흔적 잔존 검사
    leaked: list[str] = []
    for p in target.rglob("*"):
        if p.is_dir():
            continue
        rel = str(p.relative_to(target)).replace("\\", "/")
        if _export_should_skip(rel):
            leaked.append(rel)
    if leaked:
        err("⚠ 방법론 흔적이 export 결과에 남아 있습니다:")
        for l in leaked[:10]:
            err(f"  {l}")
        err("export 로직 점검 필요 — 본 결과 외주 인계 금지.")
        return 3

    # 6) zip (선택)
    if args.zip:
        archive_base = str(target)
        archive_path = shutil.make_archive(archive_base, "gztar", root_dir=target.parent, base_dir=target.name)
        ok(f"archive: {archive_path}")

    print()
    ok(f"export 완료: {target}")
    ok(f"  포함 파일: {len(included):,}")
    ok(f"  방법론 흔적 잔존: 0 (검증 통과)")
    if sensitive_hits:
        warn(f"  sensitive 파일 {len(sensitive_hits)}건 포함됨 (--allow-sensitive)")
    return 0


def cmd_manifest_check(args: argparse.Namespace) -> int:
    """MANIFEST excluded_paths 안전망을 명시적으로 검증.

    겹침이 있으면 SystemExit(3)으로 fail. CI에서 호출 권장.
    """
    excluded = MANIFEST.get("excluded_paths", [])
    info(f"checking MANIFEST safety net — excluded_paths: {excluded or '(empty)'}")
    assert_excluded_paths_safe()
    ok("excluded_paths 검증 통과 — 격리된 경로가 주입 대상에 포함되어 있지 않음.")
    # 추가 정보 — 격리 디렉터리 실제 존재 여부
    for ex in excluded:
        p = METHODOLOGY_ROOT / ex
        marker = "✓ 존재" if p.exists() else "○ 미존재(선택)"
        print(f"  {ex}: {marker}")
    return 0


# ─── main ──────────────────────────────────────────────────────────────────


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="methodology", description="방법론 배포·갱신 CLI")
    sub = p.add_subparsers(dest="cmd", required=True)

    pi = sub.add_parser("init", help="새 프로젝트에 방법론 주입")
    pi.add_argument("path", help="대상 디렉터리 (없으면 생성)")
    pi.add_argument("--type", choices=["fullstack", "planning-only"], default="fullstack")
    pi.add_argument("--label", help="프로젝트 라벨 (기본: 디렉터리명)")
    pi.set_defaults(func=cmd_init)

    ps = sub.add_parser("sync", help="현재 폴더를 업스트림과 동기화")
    ps.add_argument("--apply", action="store_true", help="실제 적용 (없으면 dry-run)")
    ps.add_argument("--target", help="목표 버전 (기본: 최신)")
    ps.add_argument("--path", help="대상 폴더 (기본: 현재 디렉터리)")
    ps.add_argument(
        "--include-worktrees",
        dest="include_worktrees",
        action="store_true",
        default=None,
        help="sibling worktree 도 일괄 sync (마이그레이션 있으면 기본 True)",
    )
    ps.add_argument(
        "--main-only",
        action="store_true",
        help="sibling worktree 무시. 마이그레이션 있어도 main 만 처리.",
    )
    ps.add_argument(
        "--force-worktree-migration",
        dest="force_worktree_migration",
        action="store_true",
        help="안전 가드 무시 — stale worktree 에도 구조 마이그레이션 강제 (권장 안 함)",
    )
    ps.add_argument(
        "--prune",
        action="store_true",
        help="shared 디렉터리에서 상류에 없는 다운스트림 고유 파일을 삭제 (기본: 보존). "
        "삭제 대상은 적용 전 목록으로 표시됨.",
    )
    ps.set_defaults(func=cmd_sync)

    psa = sub.add_parser(
        "sync-all",
        help="관리 다운스트림 전체 일괄 sync (발견→표→dry-run/적용→요약)",
    )
    psa.add_argument(
        "--root",
        help=f"탐색 루트 (기본: 방법론 상위 = {METHODOLOGY_ROOT.parent})",
    )
    psa.add_argument("--apply", action="store_true", help="실제 적용 (없으면 dry-run)")
    psa.add_argument("--target", help="목표 버전 (기본: 최신)")
    psa.add_argument(
        "--prune",
        action="store_true",
        help="상류에 없는 다운스트림 고유 파일 삭제 (기본: 보존)",
    )
    psa.add_argument(
        "--include-dirty",
        dest="include_dirty",
        action="store_true",
        help="--apply 시 미커밋 있는 repo 도 sync (기본: skip)",
    )
    psa.add_argument(
        "--allow-nonmain",
        dest="allow_nonmain",
        action="store_true",
        help="--apply 시 기본 브랜치(main/master) 아니어도 sync (기본: skip)",
    )
    psa.set_defaults(func=cmd_sync_all)

    pst = sub.add_parser("status", help="버전 비교")
    pst.add_argument("--path", help="대상 폴더 (기본: 현재)")
    pst.set_defaults(func=cmd_status)

    pd = sub.add_parser("diff", help="단일 파일이 어떻게 갱신되는지 표시")
    pd.add_argument("file", help="대상 폴더 기준 상대 경로")
    pd.add_argument("--path", help="대상 폴더 (기본: 현재)")
    pd.set_defaults(func=cmd_diff)

    pv = sub.add_parser("version", help="메소돌로지 버전 출력")
    pv.set_defaults(func=cmd_version)

    pmc = sub.add_parser("manifest-check", help="MANIFEST excluded_paths 안전망 검증")
    pmc.set_defaults(func=cmd_manifest_check)

    pex = sub.add_parser("export", help="외주 인계용 — 코드만 추출 (방법론·메타 자산 제외)")
    pex.add_argument("--path", help="source 프로젝트 (기본: 현재)")
    pex.add_argument("--target", help="export 출력 위치 (기본: <source>-handover)")
    pex.add_argument("--dry-run", action="store_true", help="실제 복사 안 함, 포함·제외 미리보기")
    pex.add_argument("--zip", action="store_true", help="tar.gz 압축")
    pex.add_argument("--include-git", action="store_true", help=".git/ 도 포함 (기본 제외)")
    pex.add_argument("--allow-sensitive", action="store_true", help=".env/credentials 등 sensitive 차단 우회")
    pex.add_argument("--force", action="store_true", help="target 덮어쓰기 / methodology-source 도 export")
    pex.add_argument("--verbose", "-v", action="store_true", help="포함·제외 파일 목록 출력")
    pex.set_defaults(func=cmd_export)

    pb = sub.add_parser("boot", help="세션 시작 브리핑 — 브리프 목록·HANDOFF 포커스·checkpoint·사이즈 경고·dashboard URL을 한 번에")
    pb.add_argument("--path", help="대상 폴더 (기본: 현재)")
    pb.add_argument("--branch", help="dashboard 대상 브랜치 (기본: 현재 working tree)")
    pb.add_argument("--no-dashboard", action="store_true", help="dashboard 빌드/서빙 skip")
    pb.set_defaults(func=cmd_boot)

    pw = sub.add_parser("wrap", help="작업·세션 종료 검증 — 4개 라이브 파일(HANDOFF/TODO/checkpoint/observation) 갱신 누락 점검")
    pw.add_argument("--path", help="대상 폴더 (기본: 현재)")
    pw.add_argument("--strict", action="store_true", help="누락 시 exit 1 (CI/hook용)")
    pw.set_defaults(func=cmd_wrap)

    psh = sub.add_parser("ship", help="작업 종료 통합 — wrap+manifest-check+sensitive 검사+(test/build)+commit+push")
    psh.add_argument("--message", "-m", help="commit 메시지 (필수, --no-commit 면 생략)")
    psh.add_argument("--path", help="대상 폴더 (기본: 현재)")
    psh.add_argument("--no-test", action="store_true", help="test 단계 skip")
    psh.add_argument("--no-build", action="store_true", help="build 단계 skip")
    psh.add_argument("--no-add-all", action="store_true", help="git add -A 안 함 (사용자가 미리 staging)")
    psh.add_argument("--no-commit", action="store_true", help="commit 단계 skip (검증만)")
    psh.add_argument("--no-push", action="store_true", help="push 단계 skip (commit까지만)")
    psh.add_argument("--allow-sensitive", action="store_true", help="sensitive 파일 의심 패턴 차단 우회")
    psh.set_defaults(func=cmd_ship)

    phk = sub.add_parser("hooks", help="git hook 자동 설치 (pre-push 검증)")
    phk.add_argument("action", choices=["install", "uninstall", "status"], help="동작")
    phk.add_argument("--path", help="대상 저장소 (기본: 현재)")
    phk.add_argument("--force", action="store_true", help="기존 hook 덮어쓰기")
    phk.set_defaults(func=cmd_hooks)

    pdb = sub.add_parser("dashboard", help="대시보드 빌드 + 서빙 + URL 출력 (자동 포트, --branch 지원)")
    pdbsub = pdb.add_subparsers(dest="dashboard_cmd")
    pdb.add_argument("--path", help="대상 프로젝트 폴더 (기본: 현재)")
    pdb.add_argument("--out", help="출력 HTML 경로 (--branch 미지정 시. 기본: <path>/dashboard.html)")
    pdb.add_argument("--port", type=int, default=None, help="서빙 포트 (기본: 자동 8765-8799)")
    pdb.add_argument("--branch", help="다른 브랜치 dashboard (worktree 로 추출, working tree 안 건드림)")
    pdb.add_argument("--no-serve", action="store_true", help="빌드만, 서빙 안 함")
    pdb.add_argument("--open", action="store_true", help="기동 후 브라우저로 자동 열기 (macOS: open, 기타: webbrowser)")
    pdb.set_defaults(func=cmd_dashboard)
    pdb_list = pdbsub.add_parser("list", help="실행 중인 모든 dashboard 목록")
    pdb_list.set_defaults(func=cmd_dashboard_list)
    pdb_stop = pdbsub.add_parser("stop", help="dashboard 종료 (worktree 정리 포함)")
    pdb_stop.add_argument("--port", type=int, help="해당 포트 dashboard 만 종료")
    pdb_stop.add_argument("--all", action="store_true", help="모든 dashboard 종료")
    pdb_stop.set_defaults(func=cmd_dashboard_stop)

    po = sub.add_parser("observe", help="L1 AI 관찰 로그 생성·검증")
    po.add_argument("--slug", help="파일명 slug (영문 소문자/숫자/kebab-case)")
    po.add_argument("--summary", help="자유서술 1단락")
    po.add_argument("--task-type", choices=sorted(OBSERVATION_TASK_TYPES), default="docs")
    po.add_argument("--domain", help="도메인 식별자 (기본: .ai/context.json project.domain)")
    po.add_argument("--agent", help="작성 AI 모델 (기본: .ai/context.json last_session.agent.model)")
    po.add_argument("--tool", help="호스팅 도구 (기본: .ai/context.json last_session.agent.tool)")
    po.add_argument("--host-os", help="호스트 OS 라벨 (기본: .ai/context.json 또는 uname)")
    po.add_argument("--stack", action="append", help="사용한 스택/도구. 여러 번 지정 가능")
    po.add_argument("--flow-used", default="ad-hoc", help="skeleton:<id>-<version> 또는 ad-hoc")
    po.add_argument("--intent", action="append", help="프롬프트 intent. 여러 번 지정 가능")
    po.add_argument("--rounds", action="append", type=int, help="각 intent의 turn 수. --intent와 같은 개수")
    po.add_argument("--friction", action="append", help="'where|cost_minutes|resolution|repeat_of' 형식. 여러 번 지정 가능")
    po.add_argument("--date", help="UTC 날짜 YYYY-MM-DD (기본: 오늘 UTC)")
    po.add_argument("--force", action="store_true", help="동일 파일이 있으면 덮어쓰기")
    po.add_argument("--dry-run", action="store_true", help="파일을 쓰지 않고 출력")
    po.add_argument("--validate", help="기존 observation 파일 검증")
    po.set_defaults(func=cmd_observe)

    pc = sub.add_parser("catalog", help="Catalog/Pending Lesson 흐름 관리")
    csub = pc.add_subparsers(dest="catalog_cmd", required=True)
    ci = csub.add_parser("init", help="catalog 하위 디렉터리 생성")
    ci.set_defaults(func=cmd_catalog)
    cs = csub.add_parser("status", help="pending/active/archive 개수 출력")
    cs.set_defaults(func=cmd_catalog)
    cp = csub.add_parser("seed-pending", help="첫 Pending Lesson seed 생성")
    cp.add_argument("--force", action="store_true")
    cp.set_defaults(func=cmd_catalog)

    psk = sub.add_parser("skeleton", help="Skeleton build/apply v0")
    sksub = psk.add_subparsers(dest="skeleton_cmd", required=True)
    ski = sksub.add_parser("init", help="도메인 skeleton 초기화")
    ski.add_argument("domain")
    ski.set_defaults(func=cmd_skeleton)
    skb = sksub.add_parser("build", help="bakes-in.json 기준 lock/README 생성")
    skb.add_argument("domain")
    skb.set_defaults(func=cmd_skeleton)
    ska = sksub.add_parser("apply", help="skeleton base와 lock을 대상 폴더에 적용")
    ska.add_argument("domain")
    ska.add_argument("target")
    ska.add_argument("--force", action="store_true")
    ska.set_defaults(func=cmd_skeleton)

    pt = sub.add_parser("thinktank", help="L3 관찰 집계 — §7 지표 + 승급 후보 마킹 (수동 승급 정식, 회고 소스)")
    pt.set_defaults(func=cmd_thinktank)

    args = p.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
