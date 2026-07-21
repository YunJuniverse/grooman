#!/usr/bin/env python3
"""generate-dashboard.py — 방법론 대시보드 단일 파일 빌더.

하는 일:
  1) 60_tools/methodology-graph.json 을 읽어 방법론 그래프 + 라이프사이클을 시각화
  2) TODO.md 의 5개 섹션(Backlog/Ready/InProgress/Blocked/Done)을 칸반으로 파싱
  3) CLAUDE.md, HANDOFF.md, 20_guides/README.md 일부를 가이드 탭에 인라인

산출물: dashboard.html (자기완결 — 외부 CDN 없이 폰트만, 그래프는 generate-graph-viz.py iframe 임베드)

사용 (저장소 루트에서 실행):
  python 60_tools/generate-dashboard.py                 # dashboard.html 생성
  python 60_tools/generate-dashboard.py --serve         # 파일 생성 후 8765 포트로 서빙
  python 60_tools/generate-dashboard.py --out PATH      # 출력 경로 지정
  python 60_tools/generate-dashboard.py --root PATH     # 다른 프로젝트에 대해 실행
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent

KANBAN_SECTIONS = ["Backlog", "Ready", "InProgress", "Blocked", "Done"]


# ─── 구조 (v4.0 고정) ───────────────────────────────────────────────────────
# v3.2 이하 지원 종료 — 옛 구조는 `migrations/v3.2_to_v4.0.py` 로 먼저 이관.

_LAYOUT_V4 = {"tools": "60_tools", "resources": "50_resources",
              "meta": "70_meta", "dev": "40_dev", "version": "v4.0"}


def dash_layout(root: Path) -> dict[str, str]:
    """v4.0 고정 레이아웃(60_tools / 50_resources / 70_meta ...)."""
    return _LAYOUT_V4


def resolve_methodology_py(root: Path) -> Path:
    """methodology.py 경로 (v4.0 고정: 60_tools/)."""
    return root / "60_tools" / "methodology.py"


# ─────────────────────────────────────── parsers ───────────────────────────────────────

@dataclass
class Card:
    id: str
    section: str
    fields: dict[str, str] = field(default_factory=dict)
    criteria: list[tuple[bool, str]] = field(default_factory=list)


def parse_todo(path: Path) -> dict[str, list[Card]]:
    """TODO.md 를 섹션별 카드 리스트로 파싱."""
    out = {s: [] for s in KANBAN_SECTIONS}
    if not path.exists():
        return out

    text = path.read_text(encoding="utf-8")
    # 현재 섹션 추적
    current_section: str | None = None
    current_card: Card | None = None
    current_field_key: str | None = None

    for raw in text.splitlines():
        line = raw.rstrip()

        # 섹션 헤더 ## Ready
        m = re.match(r"^##\s+(Backlog|Ready|InProgress|Blocked|Done)\s*$", line)
        if m:
            if current_card and current_section:
                out[current_section].append(current_card)
                current_card = None
            current_section = m.group(1)
            continue

        # 카드 헤더 ### ID-001
        m = re.match(r"^###\s+(.+?)\s*$", line)
        if m and current_section:
            if current_card:
                out[current_section].append(current_card)
            current_card = Card(id=m.group(1).strip(), section=current_section)
            current_field_key = None
            continue

        if current_card is None:
            continue

        # 필드 - **key**: value
        m = re.match(r"^-\s+\*\*([^*]+)\*\*\s*:\s*(.*)$", line)
        if m:
            key, val = m.group(1).strip().lower(), m.group(2).strip()
            current_card.fields[key] = val
            current_field_key = key
            continue

        # 체크박스   - [ ] criterion / - [x] criterion (들여쓰기 또는 일반)
        m = re.match(r"^\s*-\s+\[( |x|X)\]\s+(.+)$", line)
        if m:
            current_card.criteria.append((m.group(1).lower() == "x", m.group(2).strip()))
            continue

    if current_card and current_section:
        out[current_section].append(current_card)

    return out


def read_text_safe(path: Path, max_chars: int = 8000) -> str:
    if not path.exists():
        return ""
    s = path.read_text(encoding="utf-8")
    return s if len(s) <= max_chars else s[:max_chars] + "\n\n…(truncated)"


def parse_project_meta(claude_path: Path) -> dict:
    """CLAUDE.md §1 Project Settings의 `**Key**: value` 줄을 파싱."""
    out = {}
    if not claude_path.exists():
        return out
    in_section = False
    for line in claude_path.read_text(encoding="utf-8").splitlines():
        if re.match(r"^##\s+1\.", line):
            in_section = True
            continue
        if in_section and re.match(r"^##\s+", line):
            break
        if not in_section:
            continue
        m = re.match(r"^-\s+\*\*([^*]+)\*\*\s*:\s*(.+?)\s*$", line)
        if m:
            out[m.group(1).strip()] = m.group(2).strip()
    return out


def detect_dev_url(root: Path) -> str | None:
    """package.json scripts에서 dev URL을 추정."""
    pkg = root / "package.json"
    if not pkg.exists():
        return None
    try:
        data = json.loads(pkg.read_text(encoding="utf-8"))
        scripts = " ".join(data.get("scripts", {}).values()) if isinstance(data.get("scripts"), dict) else ""
        deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
        # 명시적 PORT
        m = re.search(r"PORT[=:](\d+)", scripts)
        if m:
            return f"http://localhost:{m.group(1)}"
        m = re.search(r"-p\s+(\d+)", scripts) or re.search(r"--port[=\s](\d+)", scripts)
        if m:
            return f"http://localhost:{m.group(1)}"
        # 프레임워크 기본 포트
        if "next" in deps:
            return "http://localhost:3000"
        if "vite" in deps:
            return "http://localhost:5173"
        if "@remix-run/dev" in deps:
            return "http://localhost:3000"
        if "nuxt" in deps:
            return "http://localhost:3000"
        if "fastify" in deps:
            return "http://localhost:3000"
    except Exception:
        return None
    return None


def read_package_info(root: Path) -> dict:
    pkg = root / "package.json"
    if not pkg.exists():
        return {}
    try:
        data = json.loads(pkg.read_text(encoding="utf-8"))
        return {
            "name": data.get("name", ""),
            "version": data.get("version", ""),
            "scripts": data.get("scripts", {}),
            "dependencies_count": len(data.get("dependencies", {})),
            "dev_dependencies_count": len(data.get("devDependencies", {})),
            "main_deps": list((data.get("dependencies") or {}).keys())[:8],
        }
    except Exception:
        return {}


def read_project_config(root: Path) -> dict:
    """선택: <dev>/project-config.json (사용자가 직접 채우는 추가 메타)."""
    p = root / dash_layout(root)["dev"] / "project-config.json"
    if not p.exists():
        return {}
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return {}


def parse_master_plan_meta(master_plan_path: Path) -> dict:
    """MASTER_PLAN.md frontmatter의 master_plan 블록 추출 (간이 YAML 파서)."""
    if not master_plan_path.exists():
        return {}
    text = master_plan_path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not m:
        return {}
    out = {}
    for line in m.group(1).splitlines():
        kv = re.match(r"^(\w+):\s*(.+)\s*$", line)
        if kv:
            out[kv.group(1)] = kv.group(2).strip()
        nested = re.match(r"^\s+(\w+):\s*(.+)\s*$", line)
        if nested:
            out[nested.group(1)] = nested.group(2).strip()
    return out


def count_files(p: Path, suffix: str = "") -> int:
    if not p.exists() or not p.is_dir():
        return 0
    return sum(1 for x in p.glob(f"*{suffix}") if x.is_file() and not x.name.startswith("."))


def count_files_recursive(p: Path, suffix: str = "") -> int:
    if not p.exists() or not p.is_dir():
        return 0
    return sum(1 for x in p.rglob(f"*{suffix}") if x.is_file() and not x.name.startswith("."))


def read_json_safe(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _count_observations(root: Path) -> int:
    """관찰 로그 카운트 — 50_resources/ai_observations + 70_meta/observations 모두 포함.
    적용 프로젝트는 50_resources 만 가짐 (70_meta 는 source 전용). source 저장소는 양쪽 합산.
    """
    total = 0
    for rel in ("50_resources/ai_observations", "70_meta/observations"):
        d = root / rel
        if not d.is_dir():
            continue
        # _README.md / README.md 제외
        for f in d.glob("*.md"):
            if f.name.startswith("_") or f.name.lower() == "readme.md":
                continue
            total += 1
    return total


def read_methodology_assets(root: Path) -> dict:
    L = dash_layout(root)
    res = L["resources"]
    catalog = root / res / "catalog"
    skeletons = root / res / "skeletons"
    insights = root / L["dev"] / "snapshots" / "insights"
    context = read_json_safe(root / ".ai" / "context.json")
    return {
        "context": context,
        "observations": _count_observations(root),
        "catalog_pending": count_files(catalog / "_pending", ".md"),
        "catalog_active": len([p for p in catalog.glob("C-*.md") if p.is_file()]),
        "catalog_archived": count_files(catalog / "archived", ".md"),
        "skeleton_domains": len([p for p in skeletons.iterdir() if p.is_dir()]) if skeletons.exists() else 0,
        "skeleton_locks": count_files_recursive(skeletons, "skeleton.lock.json"),
        "insight_reports": count_files(insights, ".md"),
        "adapters": context.get("adapters_present", []),
        "active_todos": context.get("active_todos", []),
    }


# ──────────────────────────────────── data assembly ────────────────────────────────────


def assemble(root: Path) -> dict[str, Any]:
    L = dash_layout(root)
    tools, res, dev = L["tools"], L["resources"], L["dev"]

    # graph: <tools>/ (v4.0 고정)
    graph_path = root / tools / "methodology-graph.json"

    # TODO / HANDOFF: 적용 프로젝트는 루트, source 저장소 뷰는 templates fallback
    todo_path = root / "TODO.md"
    if not todo_path.exists():
        todo_path = root / res / "templates" / "TODO.md"

    handoff_path = root / "HANDOFF.md"
    if not handoff_path.exists():
        handoff_path = root / res / "templates" / "HANDOFF.md"

    # MASTER_PLAN: <dev> → <res>/templates
    master_plan_path = root / dev / "MASTER_PLAN.md"
    if not master_plan_path.exists():
        master_plan_path = root / res / "templates" / "MASTER_PLAN.md"

    claude_path = root / "CLAUDE.md"
    readme_path = root / "20_guides" / "README.md"

    graph = json.loads(graph_path.read_text(encoding="utf-8")) if graph_path.exists() else {
        "nodes": [], "edges": [], "lifecycle": {"stages": []}, "kinds": {}
    }
    kanban_raw = parse_todo(todo_path)

    kanban = {
        section: [
            {"id": c.id, "fields": c.fields, "criteria": c.criteria}
            for c in cards
        ]
        for section, cards in kanban_raw.items()
    }


    # 현재 git 브랜치·HEAD short SHA — dashboard가 *어느 브랜치/시점*의 상태인지 명시
    git_branch = "unknown"
    git_commit = "unknown"
    try:
        git_branch = subprocess.check_output(
            ["git", "-C", str(root), "branch", "--show-current"],
            text=True, stderr=subprocess.DEVNULL,
        ).strip() or "DETACHED"
        git_commit = subprocess.check_output(
            ["git", "-C", str(root), "rev-parse", "--short", "HEAD"],
            text=True, stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        pass

    # 자주 사용 명령 메타데이터 (Commands 카드용)
    commands_data: dict = {}
    cmds_path = root / tools / "commands.json"
    if cmds_path.exists():
        try:
            commands_data = json.loads(cmds_path.read_text(encoding="utf-8"))
        except Exception:
            commands_data = {}

    # 기술 스택 메타데이터 (Stack bento 카드용)
    stack_data: dict = {}
    stack_path = root / tools / "stack.json"
    if stack_path.exists():
        try:
            stack_data = json.loads(stack_path.read_text(encoding="utf-8"))
        except Exception:
            stack_data = {}

    return {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "root": str(root),
        "git_branch": git_branch,
        "git_commit": git_commit,
        "commands": commands_data,
        "stack": stack_data,
        "graph": graph,
        "kanban": kanban,
        "master_plan_text": read_text_safe(master_plan_path, 50000),
        "master_plan_path": str(master_plan_path.relative_to(root)) if master_plan_path.exists() else "",
        "project_overview": {
            "meta":            parse_project_meta(claude_path),
            "config":          read_project_config(root),
            "dev_url":         detect_dev_url(root),
            "package":         read_package_info(root),
            "claude_md":       read_text_safe(claude_path, 50000),
            "claude_md_path":  str(claude_path.relative_to(root)) if claude_path.exists() else "",
            "agents_md":       read_text_safe(root / "AGENTS.md", 50000),
            "handoff_md":      read_text_safe(handoff_path, 50000),
            "handoff_md_path": str(handoff_path.relative_to(root)) if handoff_path.exists() else "",
            "todo_md":         read_text_safe(todo_path, 50000),
            "todo_md_path":    str(todo_path.relative_to(root)) if todo_path.exists() else "",
            "master_plan_meta": parse_master_plan_meta(master_plan_path),
            "kanban_summary": {sec: len(cards) for sec, cards in kanban.items()},
            "adr_count":     count_files(root / dev / "adr", ".md"),
            "snapshot_count": count_files(root / dev / "snapshots", ".md"),
            "methodology_assets": read_methodology_assets(root),
        },
        "guides_readme": read_text_safe(readme_path, 50000),
    }


# ──────────────────────────────────── HTML rendering ───────────────────────────────────


HTML_TEMPLATE = r"""
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>in-spire · 방법론 대시보드</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;600;700;800&family=Noto+Sans+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --bg:        oklch(0.165 0.006 70);
  --surface:   oklch(0.205 0.006 70);
  --surface-2: oklch(0.235 0.006 70);
  --hairline:  oklch(0.32  0.008 70);
  --hairline-soft: oklch(0.27 0.006 70);
  --text:      oklch(0.95  0.012 80);
  --text-dim:  oklch(0.78  0.010 75);
  --muted:     oklch(0.58  0.010 75);
  --faint:     oklch(0.42  0.008 75);
  --accent:    oklch(0.80  0.15  75);
  --accent-ink:oklch(0.20  0.04  75);
  --ok:        oklch(0.78  0.13  155);
  --warn:      oklch(0.80  0.14  60);
  --danger:    oklch(0.68  0.18  25);
  --info:      oklch(0.75  0.11  240);
  --violet:    oklch(0.72  0.13  300);
  --font-display:"Noto Sans","Noto Sans KR",-apple-system,BlinkMacSystemFont,sans-serif;
  --font-ui:"Noto Sans","Noto Sans KR",-apple-system,BlinkMacSystemFont,sans-serif;
  --font-mono:"Noto Sans Mono",ui-monospace,Menlo,monospace;
  --pad-section:56px; --pad-card:24px; --gap-card:16px;
}
[data-theme="paper"]{
  --bg:oklch(0.96 0.008 85);--surface:oklch(0.99 0.006 85);--surface-2:oklch(0.93 0.008 85);
  --hairline:oklch(0.80 0.010 80);--hairline-soft:oklch(0.88 0.008 80);
  --text:oklch(0.20 0.012 70);--text-dim:oklch(0.35 0.010 70);
  --muted:oklch(0.50 0.010 75);--faint:oklch(0.65 0.008 75);--accent-ink:oklch(0.98 0.01 85);
}
[data-theme="cool"]{
  --bg:oklch(0.17 0.012 250);--surface:oklch(0.21 0.012 250);--surface-2:oklch(0.24 0.012 250);
  --hairline:oklch(0.33 0.014 250);--hairline-soft:oklch(0.27 0.012 250);
  --text:oklch(0.95 0.015 230);--text-dim:oklch(0.78 0.013 230);
  --muted:oklch(0.58 0.012 230);--faint:oklch(0.42 0.012 230);
}
[data-accent="cyan"]{--accent:oklch(0.82 0.12 200);--accent-ink:oklch(0.20 0.04 200);}
[data-accent="lime"]{--accent:oklch(0.86 0.18 130);--accent-ink:oklch(0.20 0.04 130);}
[data-accent="rose"]{--accent:oklch(0.74 0.17 15);--accent-ink:oklch(0.98 0.02 15);}
[data-density="compact"]{--pad-section:36px;--pad-card:16px;--gap-card:10px;}

*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:var(--font-ui);font-size:14px;line-height:1.55;-webkit-font-smoothing:antialiased;}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;background:none;border:none;cursor:pointer;padding:0}

.app{max-width:1480px;margin:0 auto;padding:0 40px 80px;}

/* Masthead */
.masthead{display:grid;grid-template-columns:1fr auto;gap:40px;align-items:end;padding:48px 0 28px;border-bottom:1px solid var(--hairline);position:relative;}
.mast-eyebrow{font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted);display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-bottom:14px;}
.mast-eyebrow .dot{width:6px;height:6px;background:var(--accent);display:inline-block;}
.mast-eyebrow .sep{color:var(--faint)}
.mast-title{font-family:var(--font-display);font-weight:800;font-size:64px;line-height:0.98;letter-spacing:-0.035em;margin:0;color:var(--text);}
.mast-title em{color:var(--accent);font-weight:800;font-style:normal;}
.mast-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px;font-family:var(--font-mono);font-size:11px;color:var(--muted);}
.mast-right .branch{color:var(--text);display:flex;align-items:center;gap:8px;border:1px solid var(--hairline);padding:6px 10px;}
.mast-right .branch::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 4px color-mix(in oklch,var(--ok) 18%,transparent);}
.mast-right .commit{letter-spacing:0.02em}
.mast-right .generated{color:var(--faint)}

/* Tabs */
.tabs{display:flex;gap:0;border-bottom:1px solid var(--hairline);position:sticky;top:0;background:color-mix(in oklch,var(--bg) 92%,transparent);backdrop-filter:blur(12px);z-index:50;}
.tab{font-family:var(--font-ui);font-size:13px;font-weight:500;padding:18px 0 16px;margin-right:32px;color:var(--muted);letter-spacing:-0.005em;position:relative;display:flex;align-items:center;gap:8px;cursor:pointer;}
.tab .num{font-family:var(--font-mono);font-size:10px;color:var(--faint);font-weight:400;}
.tab:hover{color:var(--text-dim)}
.tab.active{color:var(--text)}
.tab.active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--accent);}

/* Pages */
.page{display:none;padding:36px 0;}
.page.active{display:block}

/* Cards */
.card{background:var(--surface);border:1px solid var(--hairline-soft);padding:var(--pad-card);}
.card+.card{margin-top:var(--gap-card)}
.card-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--hairline-soft);}
.card-head h3{margin:0;font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:-0.015em;color:var(--text);}
.card-head h3 em{color:var(--accent);font-style:normal;font-weight:700;}
.card-head .meta{font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);}
.eyebrow{font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;display:block;}

/* Hero */
.hero{display:grid;grid-template-columns:1.4fr 1fr;gap:0;border-bottom:1px solid var(--hairline);padding:36px 0 40px;}
.hero-left{padding-right:48px;border-right:1px solid var(--hairline-soft);}
.hero-right{padding-left:48px;display:flex;flex-direction:column;justify-content:center;gap:18px;}
.hero h2{font-family:var(--font-display);font-weight:800;font-size:42px;line-height:1.04;letter-spacing:-0.03em;margin:8px 0 14px;}
.hero h2 .ital{color:var(--accent);font-weight:800;}
.hero-desc{color:var(--text-dim);font-weight:300;font-size:15px;line-height:1.6;max-width:54ch;}
.badge-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;}
.badge{font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;border:1px solid var(--hairline);padding:5px 9px;color:var(--text-dim);}
.badge.accent{border-color:var(--accent);color:var(--accent);}
.badge.solid{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);}

/* Readout / stat row */
.stat-row{display:grid;grid-template-columns:repeat(5,1fr);gap:0;border:1px solid var(--hairline-soft);margin-top:28px;}
.stat{padding:20px 22px;border-right:1px solid var(--hairline-soft);display:flex;flex-direction:column;gap:6px;}
.stat:last-child{border-right:none;}
.stat .l{font-family:var(--font-mono);font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);}
.stat .n{font-family:var(--font-display);font-weight:700;font-size:36px;line-height:1;color:var(--text);letter-spacing:-0.035em;}
.stat .s{font-family:var(--font-mono);font-size:11px;color:var(--text-dim);}

/* Two-col rows */
.row2{display:grid;grid-template-columns:1fr 1fr;gap:var(--gap-card);margin-top:var(--gap-card);}
@media(max-width:1100px){.row2{grid-template-columns:1fr}}

/* Key/value list */
.kv{list-style:none;margin:0;padding:0;}
.kv li{display:grid;grid-template-columns:160px 1fr;gap:18px;padding:11px 0;border-bottom:1px dashed var(--hairline-soft);font-size:13.5px;}
.kv li:last-child{border-bottom:none;}
.kv .k{font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);align-self:center;}
.kv .v{color:var(--text);font-weight:400;}
.kv .v code,.kv .v .mono{font-family:var(--font-mono);font-size:12.5px;color:var(--accent);background:transparent;padding:0;}

/* Progress bar */
.progress-wrap{margin-top:8px;}
.progress-bar{display:flex;height:8px;background:var(--surface-2);border:1px solid var(--hairline-soft);}
.progress-bar>div{height:100%;}
.pb-done{background:var(--ok);}.pb-now{background:var(--accent);}.pb-next{background:var(--info);}.pb-block{background:var(--danger);}.pb-rest{background:var(--surface-2);}
.progress-legend{display:flex;flex-wrap:wrap;gap:18px;margin-top:14px;font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-dim);}
.progress-legend span{display:flex;align-items:center;gap:6px;}
.progress-legend span::before{content:"";width:8px;height:8px;display:inline-block;background:var(--muted);}
.progress-legend .pl-done::before{background:var(--ok);}.pl-now::before{background:var(--accent);}.pl-next::before{background:var(--info);}.pl-block::before{background:var(--danger);}.pl-back::before{background:var(--faint);}

/* Mini bar */
.mini-bar{height:6px;background:var(--surface-2);border:1px solid var(--hairline-soft);overflow:hidden;}
.mini-bar>div{height:100%;background:var(--accent);}
.mini-bar.done>div{background:var(--ok);}

/* File viewer */
.file-tabs{display:flex;flex-wrap:wrap;gap:0;border-bottom:1px solid var(--hairline-soft);margin-bottom:18px;}
.file-tab{font-family:var(--font-mono);font-size:11.5px;padding:10px 16px;border-right:1px solid var(--hairline-soft);color:var(--muted);cursor:pointer;letter-spacing:0.02em;}
.file-tab:hover{color:var(--text-dim);background:color-mix(in oklch,var(--surface-2) 60%,transparent);}
.file-tab.active{color:var(--text);background:var(--surface-2);}
.file-tab .icon{color:var(--accent);margin-right:6px;}
.file-body{font-family:var(--font-mono);font-size:12.5px;line-height:1.7;color:var(--text-dim);background:var(--surface-2);border:1px solid var(--hairline-soft);padding:24px 28px;max-height:520px;overflow:auto;font-weight:300;}
.file-body .md-h1{display:block;font-family:var(--font-display);font-size:22px;color:var(--text);font-weight:800;margin:4px 0 16px;letter-spacing:-0.025em;padding-bottom:10px;border-bottom:1px solid var(--hairline-soft);}
.file-body .md-h2{display:block;font-family:var(--font-display);font-size:16px;color:var(--text);font-weight:600;margin:20px 0 8px;letter-spacing:-0.01em;}
.file-body .md-h3{display:block;color:var(--text);font-family:var(--font-ui);font-weight:600;font-size:12px;margin:16px 0 4px;letter-spacing:0.02em;text-transform:uppercase;}
.file-body .md-li{display:list-item;margin-left:24px;}
.file-body .md-code{color:var(--accent);}
.file-body .md-hr{display:block;border-top:1px dashed var(--hairline);margin:18px 0;}
.file-body .md-quote{display:block;padding:6px 14px;border-left:2px solid var(--accent);color:var(--text-dim);margin:6px 0;}

/* Commands */
.cmd-tabs{display:flex;gap:0;border-bottom:1px solid var(--hairline-soft);margin-bottom:14px;flex-wrap:wrap;}
.cmd-cat{font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.15em;text-transform:uppercase;padding:9px 14px;color:var(--muted);cursor:pointer;border-right:1px solid var(--hairline-soft);}
.cmd-cat.active{color:var(--text);background:var(--surface-2);}
.cmd-cat:hover{color:var(--text-dim);}
.cmd-list{display:flex;flex-direction:column;}
.cmd-item{display:grid;grid-template-columns:260px 1fr auto;gap:24px;align-items:center;padding:14px 0;border-bottom:1px dashed var(--hairline-soft);}
.cmd-item:last-child{border-bottom:none;}
.cmd-item .lbl{font-size:13.5px;color:var(--text);font-weight:500;}
.cmd-item .desc{font-size:12.5px;color:var(--muted);font-weight:300;}
.cmd-item .run{font-family:var(--font-mono);font-size:11.5px;color:var(--text-dim);background:var(--surface-2);padding:6px 10px;border:1px solid var(--hairline-soft);white-space:nowrap;cursor:pointer;transition:all .15s;}
.cmd-item .run:hover{color:var(--accent-ink);background:var(--accent);border-color:var(--accent);}
.cmd-item .run::before{content:"$ ";color:var(--accent);}
.cmd-item .run:hover::before{color:var(--accent-ink);}

/* Table */
.tbl{width:100%;border-collapse:collapse;font-size:13px;}
.tbl thead th{text-align:left;font-family:var(--font-mono);font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);font-weight:500;padding:10px 16px 10px 0;border-bottom:1px solid var(--hairline);}
.tbl tbody td{padding:14px 16px 14px 0;border-bottom:1px dashed var(--hairline-soft);vertical-align:middle;color:var(--text);}
.tbl tbody tr:last-child td{border-bottom:none;}
.tbl tbody tr:hover td{background:color-mix(in oklch,var(--surface-2) 50%,transparent);}
.tbl .mono{font-family:var(--font-mono);font-size:12px;color:var(--text-dim);}
.tbl .port{color:var(--accent);font-family:var(--font-mono);font-weight:500;}
.btn-row{display:flex;gap:6px;align-items:center;}
.btn{font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;padding:6px 12px;border:1px solid var(--hairline);background:transparent;color:var(--text);cursor:pointer;transition:all .15s;}
.btn:hover{border-color:var(--accent);color:var(--accent);}
.btn-primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);}
.btn-primary:hover{filter:brightness(1.08);color:var(--accent-ink);}
.btn-danger{border-color:var(--hairline);color:var(--text-dim);}
.btn-danger:hover{border-color:var(--danger);color:var(--danger);}

/* Status dot */
.dot{width:7px;height:7px;border-radius:50%;display:inline-block;}
.dot.ok{background:var(--ok);box-shadow:0 0 0 3px color-mix(in oklch,var(--ok) 20%,transparent);}
.dot.warn{background:var(--warn);}
.dot.dim{background:var(--faint);}

/* Kanban */
.kanban{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--hairline-soft);border:1px solid var(--hairline-soft);}
.k-col{background:var(--surface);padding:18px 16px;min-height:520px;}
.k-col-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--hairline-soft);}
.k-col-head .title{font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;color:var(--text);}
.k-col-head .count{font-family:var(--font-display);font-weight:700;font-size:22px;color:var(--accent);line-height:1;letter-spacing:-0.04em;}
.k-col[data-col="now"] .count{color:var(--accent);}
.k-col[data-col="next"] .count{color:var(--info);}
.k-col[data-col="library"] .count{color:var(--ok);}
.k-col[data-col="thinktank"] .count{color:var(--violet);}
.k-col[data-col="blocked"] .count{color:var(--danger);}
.k-card{background:var(--surface-2);border:1px solid var(--hairline-soft);padding:14px 14px 12px;margin-bottom:10px;cursor:pointer;}
.k-card:hover{border-color:var(--accent);}
.k-card .tag{font-family:var(--font-mono);font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between;margin-bottom:6px;}
.k-card .tag .id{color:var(--accent);}
.k-card .title{font-size:13.5px;color:var(--text);line-height:1.4;margin-bottom:8px;font-weight:400;}
.k-card .meta{font-family:var(--font-mono);font-size:10.5px;color:var(--text-dim);display:flex;gap:10px;align-items:center;}
.k-card .meta .sep{color:var(--faint);}
.k-card .pri.a{color:var(--ok);}.k-card .pri.b{color:var(--warn);}.k-card .pri.c{color:var(--danger);}
.k-col-head .collapse{font-family:var(--font-mono);font-size:14px;color:var(--muted);width:22px;height:22px;display:flex;align-items:center;justify-content:center;border:1px solid var(--hairline-soft);cursor:pointer;line-height:1;}
.k-col-head .collapse:hover{color:var(--accent);border-color:var(--accent);}
.k-col.collapsed{min-height:auto;padding-bottom:12px;}
.k-col.collapsed .k-card{display:none;}
.k-col.collapsed .k-col-head{margin-bottom:0;padding-bottom:0;border-bottom:none;}
.k-col-summary{display:none;margin-top:8px;font-family:var(--font-mono);font-size:10.5px;color:var(--text-dim);letter-spacing:0.05em;line-height:1.6;}
.k-col.collapsed .k-col-summary{display:block;}

/* Timeline / Gantt */
.timeline-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:20px;}
.timeline-toolbar .seg{display:flex;border:1px solid var(--hairline);}
.timeline-toolbar .seg button{font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;padding:7px 14px;color:var(--muted);border-right:1px solid var(--hairline);}
.timeline-toolbar .seg button:last-child{border-right:none;}
.timeline-toolbar .seg button.active{background:var(--accent);color:var(--accent-ink);}
.gantt{display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--hairline-soft);}
.hcell{font-family:var(--font-mono);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);padding:12px 14px;border-bottom:1px solid var(--hairline);background:var(--surface-2);}
.gantt-track{display:grid;position:relative;border-bottom:1px solid var(--hairline);background:var(--surface-2);}
.tick{font-family:var(--font-mono);font-size:10px;color:var(--muted);padding:12px 0 12px 8px;border-right:1px dashed var(--hairline-soft);}
.tick:last-child{border-right:none;}
.label{padding:18px 14px;border-bottom:1px dashed var(--hairline-soft);display:flex;flex-direction:column;gap:4px;cursor:pointer;}
.label:hover,.lane:hover{background:color-mix(in oklch,var(--surface-2) 70%,transparent);}
.label .id{font-family:var(--font-mono);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent);}
.label .ttl{font-size:13px;color:var(--text);}
.label .dt{font-family:var(--font-mono);font-size:10.5px;color:var(--muted);}
.lane{position:relative;border-bottom:1px dashed var(--hairline-soft);background:repeating-linear-gradient(to right,transparent 0,transparent calc(100%/12 - 1px),var(--hairline-soft) calc(100%/12 - 1px),var(--hairline-soft) calc(100%/12));cursor:pointer;min-height:66px;}
.gantt-bar{position:absolute;top:50%;transform:translateY(-50%);height:30px;background:var(--accent);color:var(--accent-ink);display:flex;align-items:center;gap:8px;padding:0 12px;font-size:12px;font-weight:500;border:1px solid color-mix(in oklch,var(--accent) 70%,black);overflow:hidden;min-width:0;}
.gantt-bar>span:first-child{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.gantt-bar.done{background:var(--ok);border-color:color-mix(in oklch,var(--ok) 70%,black);color:oklch(0.18 0.03 155);}
.gantt-bar.planned{background:transparent;border:1px dashed var(--info);color:var(--info);}
.gantt-bar.active{background:var(--accent);}
.gantt-bar.cancelled{background:color-mix(in oklch,var(--danger) 40%,var(--surface-2));border-color:var(--danger);color:var(--text-dim);text-decoration:line-through;}
.gantt-bar .perc{margin-left:auto;font-family:var(--font-mono);font-size:11px;opacity:.85;flex-shrink:0;}
.now-line{position:absolute;top:0;bottom:0;width:1px;background:var(--accent);box-shadow:0 0 0 1px color-mix(in oklch,var(--accent) 30%,transparent);z-index:2;}
.now-line::after{content:"NOW";position:absolute;top:-18px;left:-16px;font-family:var(--font-mono);font-size:9.5px;letter-spacing:0.18em;color:var(--accent);}

/* Graph */
.graph-frame{width:100%;height:82vh;min-height:600px;border:1px solid var(--hairline-soft);border-radius:12px;background:var(--surface);display:block;}
.legend{display:flex;flex-wrap:wrap;gap:18px;font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.1em;color:var(--text-dim);}
.legend span{display:flex;align-items:center;gap:6px;text-transform:uppercase;}
.legend .lg-dot{width:9px;height:9px;display:inline-block;border-radius:50%;}

/* Stack — 카테고리별 그룹, 정렬된 카드 그리드 (size = 강조 등급, 레이아웃 X) */
.stack-wrap{display:flex;flex-direction:column;gap:0;border:1px solid var(--hairline-soft);background:var(--surface);}
.stack-cat{border-bottom:1px solid var(--hairline-soft);}
.stack-cat:last-child{border-bottom:none;}
.stack-cat-head{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;padding:16px 24px;background:var(--surface);border-bottom:1px solid var(--hairline-soft);}
.stack-cat-head .num{font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.16em;color:var(--muted);}
.stack-cat-head .lbl{font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:-0.02em;color:var(--text);display:flex;align-items:baseline;gap:12px;}
.stack-cat-head .lbl .primary-note{font-family:var(--font-mono);font-weight:500;font-size:10.5px;color:var(--accent);letter-spacing:0.14em;text-transform:uppercase;}
.stack-cat-head .count{font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);}
.stack-cat-head .count b{color:var(--accent);font-weight:600;font-size:13px;letter-spacing:0;margin-right:4px;}
.stack-cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1px;background:var(--hairline-soft);}
.stack-card{background:var(--surface);padding:18px 22px;display:flex;flex-direction:column;gap:6px;cursor:pointer;position:relative;transition:background .12s;min-height:148px;}
.stack-card:hover{background:var(--surface-2);}
.stack-card .role{font-family:var(--font-mono);font-size:11px;letter-spacing:0.02em;color:var(--muted);font-weight:400;}
.stack-card .name{font-family:var(--font-display);font-weight:700;font-size:17px;letter-spacing:-0.015em;color:var(--text);line-height:1.25;margin:2px 0 0;}
.stack-card .tag{font-family:var(--font-mono);font-size:11px;color:var(--accent);letter-spacing:0.02em;margin-top:2px;}
.stack-card .reason{font-size:12.5px;color:var(--text-dim);font-weight:300;line-height:1.55;margin-top:auto;padding-top:10px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.stack-card .chev{position:absolute;bottom:16px;right:20px;color:var(--muted);font-size:13px;opacity:0;transition:opacity .12s,transform .12s;}
.stack-card:hover .chev{opacity:1;transform:translateX(2px);color:var(--accent);}
.stack-card.hero{background:color-mix(in oklch,var(--surface) 82%, var(--accent) 4%);}
.stack-card.hero::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--accent);}
.stack-card.hero .star{position:absolute;top:16px;right:20px;font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;color:var(--accent);font-weight:500;}
.stack-card.hero .name{font-size:20px;letter-spacing:-0.02em;}
.stack-card.hero:hover{background:color-mix(in oklch,var(--surface) 68%, var(--accent) 6%);}
@media (max-width:680px){
  .stack-cat-head{grid-template-columns:1fr auto;gap:12px;}
  .stack-cat-head .num{display:none;}
  .stack-cat-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr));}
}

/* Section head */
.section-head{margin-top:48px;display:flex;justify-content:space-between;align-items:end;margin-bottom:24px;}
.section-head h2{font-family:var(--font-display);font-weight:800;font-size:32px;letter-spacing:-0.03em;margin:0;line-height:1;}
.section-head h2 em{color:var(--accent);font-weight:800;font-style:normal;}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.divider{height:1px;background:var(--hairline);margin:48px 0 24px;position:relative;}
.divider::after{content:"";position:absolute;left:0;top:-3px;width:32px;height:7px;background:var(--accent);}

/* Modal */
.modal-overlay{position:fixed;inset:0;z-index:2000;background:color-mix(in oklch,black 55%,transparent);backdrop-filter:blur(3px);display:flex;animation:mo-fade .15s ease-out;}
@keyframes mo-fade{from{opacity:0;}to{opacity:1;}}
@keyframes mo-slide{from{transform:translateX(24px);opacity:0;}to{transform:translateX(0);opacity:1;}}
.modal-overlay.side{justify-content:flex-end;}
.modal{background:var(--surface);border:1px solid var(--hairline);display:flex;flex-direction:column;max-height:100vh;overflow:hidden;}
.modal.side{width:560px;max-width:92vw;height:100vh;border-right:none;border-top:none;border-bottom:none;animation:mo-slide .22s ease-out;}
.modal-head{padding:24px 28px 18px;border-bottom:1px solid var(--hairline-soft);display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-shrink:0;}
.modal-head .eyebrow{margin-bottom:8px;}
.modal-head h3{margin:0;font-family:var(--font-display);font-weight:800;font-size:22px;letter-spacing:-0.025em;color:var(--text);line-height:1.2;}
.modal-close{width:32px;height:32px;border:1px solid var(--hairline);color:var(--text-dim);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:18px;line-height:1;}
.modal-close:hover{border-color:var(--accent);color:var(--accent);}
.modal-body{padding:24px 28px 28px;overflow:auto;flex:1;}
.modal-body .section{margin-bottom:24px;}
.modal-body .section:last-child{margin-bottom:0;}
.modal-body .section .eyebrow{margin-bottom:10px;}
.modal-foot{padding:16px 28px;border-top:1px solid var(--hairline-soft);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-shrink:0;background:var(--surface-2);}
.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--hairline-soft);}
.meta-grid .cell{padding:14px 18px;border-right:1px solid var(--hairline-soft);border-bottom:1px solid var(--hairline-soft);}
.meta-grid .cell:nth-child(2n){border-right:none;}
.meta-grid .cell:nth-last-child(-n+2){border-bottom:none;}
.meta-grid .l{font-family:var(--font-mono);font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;color:var(--muted);}
.meta-grid .v{font-size:13.5px;color:var(--text);margin-top:4px;font-family:var(--font-mono);}
.checklist{list-style:none;padding:0;margin:0;}
.checklist li{display:grid;grid-template-columns:18px 1fr;gap:10px;align-items:start;padding:9px 0;border-bottom:1px dashed var(--hairline-soft);font-size:13.5px;}
.checklist li:last-child{border-bottom:none;}
.checklist li .box{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border:1.5px solid var(--hairline);margin-top:3px;color:var(--accent-ink);font-size:10px;}
.checklist li.done .box{background:var(--ok);border-color:var(--ok);color:oklch(0.15 0.04 155);}
.checklist li.done .t{color:var(--muted);text-decoration:line-through;}
.checklist li .t{color:var(--text);line-height:1.5;}
.rel-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;}
.rel-list li{display:grid;grid-template-columns:80px 1fr auto;gap:14px;align-items:center;padding:10px 0;border-bottom:1px dashed var(--hairline-soft);font-size:13px;}
.rel-list li:last-child{border-bottom:none;}
.rel-list .rid{font-family:var(--font-mono);font-size:11px;color:var(--accent);}
.rel-list .rttl{color:var(--text);}
.rel-list .rpri{font-family:var(--font-mono);font-size:10px;letter-spacing:0.14em;color:var(--muted);}
.tag-row{display:flex;flex-wrap:wrap;gap:6px;}
.tag-row .tg{font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;border:1px solid var(--hairline);padding:4px 8px;color:var(--text-dim);}
.tag-row .tg.accent{border-color:var(--accent);color:var(--accent);}
.tag-row .tg.ok{border-color:color-mix(in oklch,var(--ok) 60%,var(--hairline));color:var(--ok);}
.tag-row .tg.warn{border-color:color-mix(in oklch,var(--warn) 60%,var(--hairline));color:var(--warn);}
.tag-row .tg.danger{border-color:color-mix(in oklch,var(--danger) 60%,var(--hairline));color:var(--danger);}
.modal-prose{color:var(--text-dim);font-weight:300;font-size:14px;line-height:1.6;}
.modal-prose strong{color:var(--text);font-weight:600;}
.modal-prose code{font-family:var(--font-mono);color:var(--accent);font-size:12.5px;}

/* Responsive */
@media(max-width:1100px){
  .hero{grid-template-columns:1fr;}
  .hero-left{padding-right:0;border-right:none;padding-bottom:32px;border-bottom:1px solid var(--hairline-soft);}
  .hero-right{padding-left:0;padding-top:32px;}
  .stat-row{grid-template-columns:repeat(2,1fr);}
  .kanban{grid-template-columns:repeat(2,1fr);}
}
@media(max-width:680px){
  .app{padding:0 20px 60px;}
  .mast-title{font-size:44px;}
  .tabs{overflow-x:auto;flex-wrap:nowrap;}
  .tab{flex-shrink:0;}
  .kanban{grid-template-columns:1fr;}
  .stat-row{grid-template-columns:1fr;}
}
</style>
</head>
<body data-theme="warm" data-accent="amber" data-density="cozy">
<div class="app">

  <!-- Masthead -->
  <header class="masthead">
    <div>
      <div class="mast-eyebrow">
        <span class="dot"></span>
        <span id="mast-project-name">METHODOLOGY</span>
        <span class="sep">·</span>
        <span id="mast-phase">v3</span>
        <span class="sep">·</span>
        <span>EVIDENCE-DRIVEN AI DEVELOPMENT</span>
      </div>
      <h1 class="mast-title">in<em>-</em>spire</h1>
    </div>
    <div class="mast-right">
      <div class="branch" id="mast-branch"></div>
      <div class="commit" id="mast-commit"></div>
      <div class="generated" id="mast-generated"></div>
    </div>
  </header>

  <!-- Tabs -->
  <nav class="tabs">
    <div class="tab active" data-page="status"><span class="num">01</span><span>상태</span></div>
    <div class="tab" data-page="docs"><span class="num">02</span><span>문서</span></div>
    <div class="tab" data-page="graph"><span class="num">03</span><span>관계 그래프</span></div>
  </nav>

  <!-- Page 01: Overview -->
  <section class="page active" id="page-status">
    <section class="hero">
      <div class="hero-left">
        <span class="eyebrow">Project / <span id="hero-project-name">methodology</span></span>
        <h2>Evidence-driven<br/><span class="ital">AI development</span></h2>
        <p class="hero-desc" id="hero-objective"></p>
        <div class="badge-row" id="hero-badges"></div>
      </div>
      <div class="hero-right">
        <span class="eyebrow">Current phase</span>
        <div id="hero-phase-content"><span style="color:var(--muted)">—</span></div>
      </div>
    </section>
    <section class="stat-row" id="stat-row"></section>
    <div class="row2" id="stack-progress-row"></div>
    <div class="section-head" style="margin-top:var(--gap-card)">
      <h2>칸반 <em>보드</em>.</h2>
      <div class="row">
        <span id="kanban-count" style="font-family:var(--font-mono);font-size:11px;color:var(--muted);letter-spacing:.14em;text-transform:uppercase"></span>
        <button class="btn" id="kanban-collapse-all">Collapse all</button>
        <button class="btn" id="kanban-expand-all">Expand all</button>
      </div>
    </div>
    <div class="kanban" id="kanban-board"></div>
  </section>

  <!-- Page 02: Docs -->
  <section class="page" id="page-docs">
    <div class="card" style="margin-top:0">
      <div class="card-head"><h3>문서 <em>뷰어</em></h3><span class="meta">live state · meta files</span></div>
      <div class="file-tabs" id="file-tabs"></div>
      <div class="file-body" id="file-body"></div>
    </div>
  </section>


  <!-- Page 03: Graph — 문서 파이프라인 & 역할 지식그래프 (generate-graph-viz.py 임베드) -->
  <section class="page" id="page-graph">
    <iframe id="graph-frame" class="graph-frame" title="문서 파이프라인 & 역할 지식그래프" loading="lazy"></iframe>
  </section>




</div><!-- .app -->

<!-- Side-sheet modal -->
<div id="modal-overlay" class="modal-overlay side" style="display:none" onclick="if(event.target===this)closeModal()">
  <div class="modal side">
    <div class="modal-head">
      <div>
        <span class="eyebrow" id="modal-eyebrow"></span>
        <h3 id="modal-title"></h3>
      </div>
      <button class="modal-close" onclick="closeModal()">&#x2715;</button>
    </div>
    <div class="modal-body" id="modal-body"></div>
    <div class="modal-foot">
      <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--muted);letter-spacing:.14em;text-transform:uppercase">Esc / click outside to close</span>
      <div class="btn-row">
        <button class="btn" onclick="closeModal()">Close</button>
      </div>
    </div>
  </div>
</div>

<script>
const DATA = __DATA__;

// ── Utilities ────────────────────────────────────────────────
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }
function renderInline(text){
  return String(text)
    .replace(/`([^`]+)`/g,'<span class="md-code">$1</span>')
    .replace(/\b([A-Z]+-\d{3,}|S-\d{3}|T-\d{3}|M\d|METH-\d+)\b/g,'<span class="md-code">$&</span>')
    .replace(/\[A\]/g,'<span style="color:var(--ok);font-weight:600">[A]</span>')
    .replace(/\[B\]/g,'<span style="color:var(--warn);font-weight:600">[B]</span>')
    .replace(/\[C\]/g,'<span style="color:var(--danger);font-weight:600">[C]</span>');
}
function renderMd(text){
  if(!text) return '<span style="color:var(--muted)">(없음)</span>';
  return esc(text)
    .replace(/^# (.+)$/mg,'<span class="md-h1">$1</span>')
    .replace(/^## (.+)$/mg,'<span class="md-h2">$1</span>')
    .replace(/^### (.+)$/mg,'<span class="md-h3">$1</span>')
    .replace(/^&gt; (.+)$/mg,'<span class="md-quote">$1</span>')
    .replace(/^---$/mg,'<span class="md-hr"></span>')
    .replace(/^[-*] (.+)$/mg,'<span class="md-li">$1</span>')
    .replace(/`([^`]+)`/g,'<span class="md-code">$1</span>');
}

// ── Tab switching ─────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(t=>{
  t.onclick=()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('page-'+t.dataset.page).classList.add('active');
    if(t.dataset.page==='graph') initGraph();
  };
});

// ── Masthead ─────────────────────────────────────────────────
(function(){
  const meta = (DATA.project_overview||{}).meta||{};
  document.getElementById('mast-branch').textContent = DATA.git_branch||'unknown';
  document.getElementById('mast-commit').textContent = 'commit '+(DATA.git_commit||'unknown');
  document.getElementById('mast-generated').textContent = 'generated '+(DATA.generated_at||'').replace('T',' ');
  const name = meta['Project Name']||'methodology';
  document.getElementById('mast-project-name').textContent = name.toUpperCase();
  document.getElementById('hero-project-name').textContent = name;
  document.getElementById('hero-objective').textContent = meta['Objective']||'';
  const badges = document.getElementById('hero-badges');
  badges.innerHTML = [
    meta['Mode']&&`<span class="badge solid">${esc(meta['Mode'])}</span>`,
    meta['Stack']&&`<span class="badge accent">${esc(meta['Stack'])}</span>`,
    meta['Release Policy']&&`<span class="badge">${esc(meta['Release Policy'])}</span>`,
    meta['Primary Approver']&&`<span class="badge">approver · ${esc(meta['Primary Approver'])}</span>`,
    meta['Started On']&&`<span class="badge">started · ${esc(meta['Started On'])}</span>`,
  ].filter(Boolean).join('');
})();

// ── Hero phase card (2층 구조 — 스프린트 폐지, METH-086) ─────────
(function(){
  const mp = (DATA.project_overview||{}).master_plan_meta || {};
  const el = document.getElementById('hero-phase-content');
  if(!el) return;
  const phase = mp.current_phase || '—';
  const gate = mp.next_gate || '—';
  const blocking = mp.blocking_decisions;
  el.innerHTML=`
    <div style="display:flex;align-items:baseline;gap:14px;margin-top:4px">
      <div style="font-family:var(--font-display);font-weight:800;font-size:42px;line-height:1;letter-spacing:-0.035em;color:var(--accent)">${esc(phase)}</div>
    </div>
    <ul class="kv" style="margin-top:14px">
      <li><span class="k">next gate</span><span class="v" style="font-size:12.5px">${esc(gate)}</span></li>
      <li><span class="k">blocking</span><span class="v" style="font-size:12.5px">${esc(Array.isArray(blocking)?(blocking.join(', ')||'none'):(blocking||'none'))}</span></li>
    </ul>
    <div style="font-size:12px;color:var(--muted);margin-top:12px">cadence·forecast: flow metrics (WIP · throughput · Monte Carlo)</div>`;
})();

// ── Stat row ──────────────────────────────────────────────────
function buildStatHtml(){
  const ov=DATA.project_overview||{}, ks=ov.kanban_summary||{};
  const total=Object.values(ks).reduce((a,b)=>a+b,0);
  const now=ks.InProgress||0,next=ks.Ready||0,blocked=ks.Blocked||0;
  return [
    {label:'WIP',value:now,sub:`InProgress · cap 3`},
    {label:'TODO',value:total,sub:`${now} NOW · ${next} NEXT · ${blocked} blocked`},
    {label:'ADR',value:ov.adr_count||0,sub:'40_dev/adr/'},
    {label:'Snapshots',value:ov.snapshot_count||0,sub:'40_dev/snapshots/'},
    {label:'Guides',value:(ov.methodology_assets||{}).observations||0,sub:'L1 관찰 로그'},
  ].map(s=>`<div class="stat"><span class="l">${s.label}</span><span class="n">${s.value}</span><span class="s">${s.sub}</span></div>`).join('');
}
document.getElementById('stat-row').innerHTML = buildStatHtml();

// ── Stack + Progress row ──────────────────────────────────────
(function(){
  const ov=DATA.project_overview||{}, meta=ov.meta||{}, ks=ov.kanban_summary||{};
  const total=Object.values(ks).reduce((a,b)=>a+b,0)||1;
  const now=ks.InProgress||0,next=ks.Ready||0,blocked=ks.Blocked||0,done=ks.Done||0,backlog=ks.Backlog||0;
  const pct=n=>(n/total*100).toFixed(1);
  const rows=[
    meta['Stack']&&`<li><span class="k">stack</span><span class="v"><span class="mono">${esc(meta['Stack'])}</span></span></li>`,
    '<li><span class="k">cli</span><span class="v"><span class="mono">60_tools/methodology.py</span></span></li>',
    ov.dev_url&&`<li><span class="k">dev url</span><span class="v"><a class="mono" style="color:var(--accent)" href="${esc(ov.dev_url)}">${esc(ov.dev_url)}</a></span></li>`,
    meta['Mode']&&`<li><span class="k">mode</span><span class="v">${esc(meta['Mode'])}</span></li>`,
    meta['Release Policy']&&`<li><span class="k">release</span><span class="v">${esc(meta['Release Policy'])}</span></li>`,
  ].filter(Boolean).join('');
  document.getElementById('stack-progress-row').innerHTML=`
    <div class="card">
      <div class="card-head"><h3>스택 · <em>개발 정보</em></h3><span class="meta">project / stack</span></div>
      <ul class="kv">${rows}</ul>
    </div>
    <div class="card">
      <div class="card-head"><h3>진행 <em>현황</em></h3><span class="meta">${total} todos</span></div>
      <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:10px">
        <div style="font-family:var(--font-display);font-weight:700;font-size:60px;line-height:1;letter-spacing:-0.04em">${Math.round(done/total*100)}<span style="font-family:var(--font-mono);font-size:14px;color:var(--muted);letter-spacing:.1em;margin-left:4px">%</span></div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim);letter-spacing:.1em;text-transform:uppercase">done /<br>${total} todos</div>
      </div>
      <div class="progress-wrap">
        <div class="progress-bar">
          <div class="pb-done" style="width:${pct(done)}%"></div>
          <div class="pb-now" style="width:${pct(now)}%"></div>
          <div class="pb-next" style="width:${pct(next)}%"></div>
          <div class="pb-block" style="width:${pct(blocked)}%"></div>
          <div class="pb-rest" style="width:${pct(backlog)}%"></div>
        </div>
        <div class="progress-legend">
          <span class="pl-done">done · ${done}</span>
          <span class="pl-now">now · ${now}</span>
          <span class="pl-next">next · ${next}</span>
          <span class="pl-block">blocked · ${blocked}</span>
          <span class="pl-back">backlog · ${backlog}</span>
        </div>
      </div>
    </div>`;
})();

// ── File viewer ───────────────────────────────────────────────
(function(){
  const ov=DATA.project_overview||{};
  const files=[
    {id:'claude',  label:'CLAUDE.md',     icon:'›', text:ov.claude_md},
    {id:'handoff', label:'HANDOFF.md',    icon:'›', text:ov.handoff_md},
    {id:'todo',    label:'TODO.md',       icon:'›', text:ov.todo_md},
    {id:'plan',    label:'MASTER_PLAN.md',icon:'›', text:DATA.master_plan_text},
    {id:'agents',  label:'AGENTS.md',     icon:'›', text:ov.agents_md},
  ];
  const tabsEl=document.getElementById('file-tabs');
  const bodyEl=document.getElementById('file-body');
  function show(id){
    tabsEl.querySelectorAll('.file-tab').forEach(t=>t.classList.toggle('active',t.dataset.fid===id));
    const f=files.find(x=>x.id===id);
    bodyEl.innerHTML=f&&f.text?renderMd(f.text.slice(0,15000))+(f.text.length>15000?'<span class="md-hr"></span><span style="color:var(--muted)">(truncated)</span>':''):'<span style="color:var(--muted)">(파일 없음)</span>';
  }
  tabsEl.innerHTML=files.map(f=>`<div class="file-tab" data-fid="${f.id}"><span class="icon">${f.icon}</span>${f.label}</div>`).join('');
  tabsEl.querySelectorAll('.file-tab').forEach(t=>t.onclick=()=>show(t.dataset.fid));
  show('claude');
})();

// ── Kanban ────────────────────────────────────────────────────
const KANBAN_MAP=[
  {sec:'InProgress',id:'now',      title:'NOW',       hint:'진행 중인 작업 (WIP cap 3)'},
  {sec:'Ready',     id:'next',     title:'NEXT',      hint:'다음 작업 후보'},
  {sec:'Done',      id:'library',  title:'LIBRARY',   hint:'완료된 작업 아카이브'},
  {sec:'Backlog',   id:'thinktank',title:'THINKTANK', hint:'아이디어 인큐베이터'},
  {sec:'Blocked',   id:'blocked',  title:'BLOCKED',   hint:'외부 의존으로 보류 중'},
];
const collapseState={};
function renderKanban(){
  const kb=DATA.kanban||{};
  const board=document.getElementById('kanban-board');
  board.innerHTML='';
  let total=0;
  KANBAN_MAP.forEach(col=>{
    const items=kb[col.sec]||[];
    total+=items.length;
    const collapsed=!!collapseState[col.id];
    const colEl=document.createElement('div');
    colEl.className='k-col'+(collapsed?' collapsed':'');
    colEl.dataset.col=col.id;
    colEl.innerHTML=`
      <div class="k-col-head">
        <span class="title">${col.title}</span>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="count">${String(items.length).padStart(2,'0')}</span>
          <button class="collapse" data-col="${col.id}">${collapsed?'+':'−'}</button>
        </div>
      </div>
      <div class="k-col-summary">${col.hint}</div>
      ${items.map(c=>{
        const cls=(c.fields['change-class']||'').replace(/\s/g,'').toUpperCase();
        const priCss=cls==='A'?'a':cls==='B'?'b':cls==='C'?'c':'';
        return `<div class="k-card" data-card-id="${esc(c.id)}" data-col-id="${col.id}">
          <div class="tag">
            <span class="id">${esc(c.id)}</span>
            <span class="pri ${priCss}">${cls?`[${esc(cls)}]`:''}</span>
          </div>
          <div class="title">${esc(c.fields.title||c.id)}</div>
          <div class="meta">
            ${c.fields.milestone?`<span>${esc(c.fields.milestone)}</span><span class="sep">·</span>`:''}
            <span>${esc(c.fields.owner||'—')}</span>
            ${c.fields['blocked-on']?`<span class="sep">·</span><span style="color:var(--danger)">${esc(c.fields['blocked-on'])}</span>`:''}
          </div>
        </div>`;
      }).join('')}`;
    board.appendChild(colEl);
  });
  document.getElementById('kanban-count').textContent=`${total} todos`;
  board.querySelectorAll('.collapse').forEach(btn=>{
    btn.onclick=e=>{e.stopPropagation();const col=btn.dataset.col;collapseState[col]=!collapseState[col];renderKanban();};
  });
  board.querySelectorAll('.k-card').forEach(card=>{
    card.onclick=()=>{
      const colData=KANBAN_MAP.find(c=>c.id===card.dataset.colId);
      const cardData=(DATA.kanban[colData&&colData.sec]||[]).find(c=>c.id===card.dataset.cardId);
      if(cardData)openTodoModal(cardData,colData);
    };
  });
}
document.getElementById('kanban-collapse-all').onclick=()=>{KANBAN_MAP.forEach(c=>collapseState[c.id]=true);renderKanban();};
document.getElementById('kanban-expand-all').onclick=()=>{KANBAN_MAP.forEach(c=>delete collapseState[c.id]);renderKanban();};
renderKanban();


// ── Graph ─────────────────────────────────────────────────────
let graphInited=false;
function initGraph(){
  if(graphInited)return;graphInited=true;
  // 그래프는 generate-graph-viz.py 산출물(dagre 레이아웃)을 iframe 으로 임베드.
  // 탭 첫 진입 시 lazy-load — 같은 폴더의 methodology-graph-viz.html.
  const f=document.getElementById('graph-frame');
  if(f&&!f.getAttribute('src')) f.setAttribute('src','methodology-graph-viz.html');
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(eyebrow,title,bodyHtml){
  document.getElementById('modal-eyebrow').textContent=eyebrow;
  document.getElementById('modal-title').textContent=title;
  document.getElementById('modal-body').innerHTML=bodyHtml;
  const overlay=document.getElementById('modal-overlay');
  overlay.style.display='';
  document.body.style.overflow='hidden';
  const onEsc=e=>{if(e.key==='Escape')closeModal();};
  window.addEventListener('keydown',onEsc);
  overlay._removeEsc=()=>window.removeEventListener('keydown',onEsc);
}
function closeModal(){
  const overlay=document.getElementById('modal-overlay');
  overlay.style.display='none';
  document.body.style.overflow='';
  if(overlay._removeEsc){overlay._removeEsc();overlay._removeEsc=null;}
}

window._findCard=function(id){const all=Object.entries(DATA.kanban||{}).flatMap(([sec,cards])=>cards.map(c=>({...c,_sec:sec})));return all.find(c=>c.id===id)||{id,fields:{},criteria:[],_sec:'Backlog'};};

function openTodoModal(card,colData){
  if(!card)return;
  const acc=card.criteria||[],doneAcc=acc.filter(a=>a[0]).length;
  const cls=(card.fields['change-class']||'').replace(/\s/g,'').toUpperCase();
  const priCss={A:'ok',B:'warn',C:'danger'}[cls]||'';
  const colId=colData&&colData.id||'';const colTitle=colData&&colData.title||'';
  const milestone=card.fields.milestone||'';
  const body=`
    <div class="section">
      <div class="tag-row" style="margin-bottom:14px">
        ${cls?`<span class="tg ${priCss}">Priority [${esc(cls)}]</span>`:''}
        ${colTitle?`<span class="tg ${colId==='now'?'accent':''}">${esc(colTitle)}</span>`:''}
        ${milestone?`<span class="tg">${esc(milestone)}</span>`:''}
        ${card.fields.owner?`<span class="tg">${esc(card.fields.owner)}</span>`:''}
      </div>
      <p class="modal-prose">${esc(card.fields.notes||card.fields.title||card.id)}</p>
    </div>
    <div class="section">
      <span class="eyebrow">Meta</span>
      <div class="meta-grid">
        <div class="cell"><div class="l">ID</div><div class="v">${esc(card.id)}</div></div>
        <div class="cell"><div class="l">Mode</div><div class="v">${esc(card.fields.mode||'—')}</div></div>
        <div class="cell"><div class="l">Milestone</div><div class="v">${esc(milestone||'—')}</div></div>
        <div class="cell"><div class="l">Owner</div><div class="v">${esc(card.fields.owner||'—')}</div></div>
      </div>
    </div>
    ${acc.length?`<div class="section"><span class="eyebrow">Acceptance criteria · ${doneAcc}/${acc.length}</span><div class="mini-bar ${doneAcc===acc.length?'done':''}" style="margin-bottom:14px"><div style="width:${acc.length?doneAcc/acc.length*100:0}%"></div></div><ul class="checklist">${acc.map(a=>`<li class="${a[0]?'done':''}"><span class="box">${a[0]?'&#x2713;':''}</span><span class="t">${esc(a[1])}</span></li>`).join('')}</ul></div>`:''}
    `;
  openModal(`TODO · ${card.id}`,card.fields.title||card.id,body);
}

// ── 소스 변경 감지 → 새로고침 배너 (서버 재시작 불필요) ──────────────
// TODO.md/HANDOFF.md 등이 바뀌면 서버가 dashboard.html 을 재생성한다.
// 클라이언트는 /api/src-mtime 를 폴링해 변경을 감지하고, 사용자가
// 원할 때 새로고침하도록 배너만 띄운다 (강제 reload 안 함 — 읽는 중 방해 X).
(function(){
  let baseline=null, stale=false;
  async function poll(){
    try{
      const r=await fetch('/api/src-mtime',{cache:'no-store'});
      if(!r.ok)return;
      const {mtime}=await r.json();
      if(baseline===null){baseline=mtime;return;}
      if(mtime>baseline && !stale){stale=true;showBanner();}
    }catch(e){/* file:// 또는 서버 없음 — 무시 */}
  }
  function showBanner(){
    if(document.getElementById('stale-banner'))return;
    const b=document.createElement('div');
    b.id='stale-banner';
    b.innerHTML='● TODO/HANDOFF 변경됨 — <u>새로고침</u>';
    b.style.cssText='position:fixed;right:20px;bottom:20px;z-index:9999;'
      +'background:var(--accent,#e0a23a);color:#1a1a1a;font:600 13px/1 var(--font-ui,sans-serif);'
      +'padding:12px 18px;cursor:pointer;border:none;box-shadow:0 4px 16px rgba(0,0,0,.35);'
      +'letter-spacing:-.01em;user-select:none';
    b.onclick=()=>location.reload();
    document.body.appendChild(b);
  }
  // 4초 주기 폴링 (탭 비활성 시 브라우저가 자동 스로틀)
  setInterval(poll,4000); poll();
})();
</script>
</body>
</html>

"""


def render_html(data: dict[str, Any]) -> str:
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    return HTML_TEMPLATE.replace("__DATA__", payload)


# ──────────────────────────────────────── main ────────────────────────────────────────


def main() -> int:
    parser = argparse.ArgumentParser(description="방법론 대시보드 빌더")
    parser.add_argument("--root", default=str(ROOT), help="프로젝트 루트 (기본: 스크립트 위치)")
    parser.add_argument("--out", default=None, help="출력 HTML 경로 (기본: <root>/dashboard.html)")
    parser.add_argument("--serve", action="store_true", help="생성 후 8765 포트로 서빙")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    root = Path(args.root).resolve()
    out = Path(args.out) if args.out else root / "dashboard.html"

    data = assemble(root)
    out.write_text(render_html(data), encoding="utf-8")
    print(f"[ok] {out}  (kanban={sum(len(v) for v in data['kanban'].values())} cards, "
          f"nodes={len(data['graph'].get('nodes',[]))})", file=sys.stderr)

    if args.serve:
        _serve_with_api(out, args.port, root)

    return 0


# ───────────────────────────────────────────────────────────────────────
# Dev-server 제어 API + 정적 파일 서빙
# ───────────────────────────────────────────────────────────────────────

_servers_lock = __import__("threading").Lock()
_servers: dict[int, dict] = {}  # pid -> {pid, port, cwd, cmd, started_at}


def _find_free_port(start: int = 3000, end: int = 3099) -> int | None:
    import socket
    for p in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.1)
            try:
                s.bind(("127.0.0.1", p))
                return p
            except OSError:
                continue
    return None


# dashboard 가 launchd / Finder 더블클릭 등 비대화형 환경에서 떠 있으면
# PATH=/usr/bin:/bin:/usr/sbin:/sbin 만 상속받아 npm/pnpm/node 를 못 찾는다.
# dev 서버 spawn 시 사용자 shell 가 보통 가지고 있는 위치를 PATH 앞에 보강.
def _augmented_path_env() -> dict[str, str]:
    env = os.environ.copy()
    home = os.path.expanduser("~")
    extra = [
        "/opt/homebrew/bin",
        "/opt/homebrew/sbin",
        "/usr/local/bin",
        f"{home}/.local/bin",
        f"{home}/.bun/bin",
        f"{home}/Library/pnpm",
        f"{home}/.volta/bin",
    ]
    # nvm: ~/.nvm/versions/node/*/bin (최신 1개만)
    nvm_root = Path(home) / ".nvm" / "versions" / "node"
    if nvm_root.is_dir():
        versions = sorted(
            (p for p in nvm_root.iterdir() if p.is_dir()),
            key=lambda p: p.name, reverse=True,
        )
        if versions:
            extra.append(str(versions[0] / "bin"))
    current = env.get("PATH", "")
    parts = [p for p in extra if Path(p).is_dir()]
    if current:
        parts.append(current)
    env["PATH"] = ":".join(parts)
    return env


def _kill_port(port: int) -> list[int]:
    """해당 포트 점유 프로세스 PID 들을 SIGTERM. 반환: 죽인 PID 목록."""
    import signal
    killed: list[int] = []
    try:
        out = subprocess.check_output(
            ["lsof", "-ti", f":{port}", "-sTCP:LISTEN"],
            text=True, stderr=subprocess.DEVNULL,
        ).strip()
    except subprocess.CalledProcessError:
        return killed
    for pid_str in out.splitlines():
        try:
            pid = int(pid_str.strip())
            os.kill(pid, signal.SIGTERM)
            killed.append(pid)
        except (ValueError, ProcessLookupError, PermissionError):
            pass
    return killed


def _serve_with_api(out: Path, start_port: int, root: Path) -> None:
    import http.server
    import json as _json
    import signal as _signal
    import socketserver
    import urllib.parse

    os.chdir(out.parent)

    # 칸반/그래프 데이터 소스 — 이 중 하나라도 dashboard.html 보다 새것이면
    # GET 시 자동 재생성 (서버 재시작 불필요, 브라우저 새로고침만으로 최신).
    _src_files = [
        root / "TODO.md",
        root / "HANDOFF.md",
        root / ".ai" / "checkpoint.md",
        root / "60_tools" / "methodology-graph.json",
        root / "60_tools" / "commands.json",
        root / "60_tools" / "stack.json",
    ]

    def _src_mtime() -> float:
        return max((p.stat().st_mtime for p in _src_files if p.exists()), default=0.0)

    def _maybe_rebuild() -> bool:
        try:
            out_m = out.stat().st_mtime
        except FileNotFoundError:
            out_m = 0.0
        if _src_mtime() > out_m:
            try:
                out.write_text(render_html(assemble(root)), encoding="utf-8")
                return True
            except Exception as exc:  # 빌드 실패 시 옛 파일 유지
                print(f"[warn] auto-rebuild 실패: {exc}", file=sys.stderr)
        return False

    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, fmt, *args):
            # 노이즈 줄이기
            return

        def _send_json(self, status: int, payload: dict) -> None:
            body = _json.dumps(payload).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            # 루트 요청을 dashboard.html 로 자동 rewrite (디렉터리 listing 회피)
            # urllib.parse 가 ? 쿼리스트링 분리하므로 self.path 직접 비교
            if self.path == "/" or self.path == "" or self.path.startswith("/?"):
                self.path = "/dashboard.html" + self.path[1:]
            parsed = urllib.parse.urlparse(self.path)

            # 소스 mtime — 클라이언트가 폴링해 변경 감지 시 자동 새로고침
            if parsed.path == "/api/src-mtime":
                return self._send_json(200, {"mtime": _src_mtime()})

            # dashboard.html 요청이면 소스 변경 여부 확인 후 필요 시 재생성
            if parsed.path == "/dashboard.html":
                _maybe_rebuild()

            if parsed.path == "/api/servers":
                with _servers_lock:
                    # 죽은 프로세스 정리
                    alive: dict[int, dict] = {}
                    for pid, e in _servers.items():
                        try:
                            os.kill(pid, 0)
                            alive[pid] = e
                        except ProcessLookupError:
                            pass
                    _servers.clear()
                    _servers.update(alive)
                    return self._send_json(200, {"servers": list(_servers.values())})

            if parsed.path == "/api/dashboards":
                # ~/.methodology-dashboards.json 레지스트리 + 죽은 항목 정리
                import pathlib as _pl
                reg_file = _pl.Path.home() / ".methodology-dashboards.json"
                entries: list[dict] = []
                if reg_file.exists():
                    try:
                        entries = _json.loads(reg_file.read_text(encoding="utf-8"))
                    except Exception:
                        entries = []
                alive_dash: list[dict] = []
                for e in entries:
                    pid = e.get("pid")
                    if pid:
                        try:
                            os.kill(int(pid), 0)
                            alive_dash.append(e)
                        except (ProcessLookupError, ValueError, PermissionError):
                            continue
                    else:
                        alive_dash.append(e)
                if len(alive_dash) != len(entries):
                    try:
                        reg_file.write_text(_json.dumps(alive_dash, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
                    except Exception:
                        pass
                return self._send_json(200, {"dashboards": alive_dash})

            if parsed.path == "/api/branches":
                # 현재 root 의 git branch 목록 (로컬 + 원격)
                root = str(Path.cwd())
                try:
                    out = subprocess.check_output(
                        ["git", "-C", root, "branch", "-a", "--no-color"],
                        text=True, stderr=subprocess.DEVNULL,
                    )
                except Exception:
                    return self._send_json(200, {"current": None, "branches": []})
                current = None
                branches: list[str] = []
                for line in out.splitlines():
                    s = line.strip()
                    if not s:
                        continue
                    is_current = s.startswith("* ")
                    # *  현재 브랜치 / +  다른 worktree 에서 체크아웃 / -- detached HEAD
                    name = re.sub(r"^[*+-]\s+", "", s).strip()
                    # remotes/origin/HEAD -> origin/main 같은 심볼릭 참조 제외
                    if " -> " in name:
                        continue
                    # remotes/ 접두 제거 (선택적 표시용으로 유지)
                    if name.startswith("remotes/"):
                        name = name[len("remotes/"):]
                    if is_current:
                        current = name
                    if name not in branches:
                        branches.append(name)
                return self._send_json(200, {"current": current, "branches": branches})

            return super().do_GET()

        def do_POST(self):
            parsed = urllib.parse.urlparse(self.path)
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length).decode("utf-8") if length else ""
            try:
                payload = _json.loads(raw) if raw else {}
            except _json.JSONDecodeError:
                return self._send_json(400, {"error": "invalid JSON"})

            if parsed.path == "/api/servers/start":
                cwd = payload.get("cwd", "").strip()
                cmd_raw = payload.get("cmd", "pnpm dev")
                cmd = cmd_raw.split() if isinstance(cmd_raw, str) else list(cmd_raw)
                if not cwd or not Path(cwd).is_dir():
                    return self._send_json(400, {"error": f"invalid cwd: {cwd}"})
                port = _find_free_port()
                if port is None:
                    return self._send_json(503, {"error": "포트 3000-3099 모두 점유"})
                env = _augmented_path_env()
                env["PORT"] = str(port)
                # 자식 PATH 로 cmd[0] 해석 (launchd 환경 회피)
                import shutil as _shutil
                resolved = _shutil.which(cmd[0], path=env["PATH"])
                if not resolved:
                    return self._send_json(500, {
                        "error": f"명령 미발견: {cmd[0]} — PATH 에 없음. "
                                 f"node/pnpm/npm 설치 위치 확인 (예: /opt/homebrew/bin).",
                        "path": env["PATH"],
                    })
                cmd[0] = resolved
                try:
                    proc = subprocess.Popen(
                        cmd,
                        cwd=cwd,
                        env=env,
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        start_new_session=True,
                    )
                except FileNotFoundError as e:
                    return self._send_json(500, {"error": f"명령 미발견: {cmd[0]} ({e})"})
                entry = {
                    "pid": proc.pid,
                    "port": port,
                    "cwd": cwd,
                    "cmd": cmd,
                    "started_at": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
                }
                with _servers_lock:
                    _servers[proc.pid] = entry
                return self._send_json(200, entry)

            if parsed.path.startswith("/api/servers/") and parsed.path.endswith("/stop"):
                try:
                    pid = int(parsed.path.split("/")[3])
                except (ValueError, IndexError):
                    return self._send_json(400, {"error": "invalid pid in path"})
                with _servers_lock:
                    entry = _servers.get(pid)
                if not entry:
                    return self._send_json(404, {"error": "추적 안 됨"})
                try:
                    os.killpg(os.getpgid(pid), _signal.SIGTERM)
                except ProcessLookupError:
                    pass
                except Exception as e:
                    return self._send_json(500, {"error": str(e)})
                with _servers_lock:
                    _servers.pop(pid, None)
                return self._send_json(200, {"stopped": pid})

            if parsed.path == "/api/servers/kill-range":
                p_from = int(payload.get("from", 3000))
                p_to = int(payload.get("to", 3099))
                killed_all: list[dict] = []
                for port in range(p_from, p_to + 1):
                    for pid in _kill_port(port):
                        killed_all.append({"pid": pid, "port": port})
                # 추적 dict 정리
                killed_pids = {k["pid"] for k in killed_all}
                with _servers_lock:
                    for pid in list(_servers.keys()):
                        if pid in killed_pids:
                            _servers.pop(pid, None)
                return self._send_json(200, {"killed": killed_all})

            if parsed.path == "/api/dashboard/spawn":
                # body: {"branch": "<name>"} — 그 브랜치 dashboard 를 별도 포트에 spawn
                branch_name = (payload.get("branch") or "").strip()
                if not branch_name:
                    return self._send_json(400, {"error": "branch 필요"})
                root = Path.cwd()
                meth = resolve_methodology_py(root)
                if not meth.exists():
                    return self._send_json(500, {"error": f"methodology.py 미발견 ({meth})"})
                try:
                    out = subprocess.check_output(
                        [sys.executable, str(meth), "dashboard", "--branch", branch_name],
                        cwd=str(root), text=True, stderr=subprocess.STDOUT, timeout=30,
                    )
                except subprocess.CalledProcessError as e:
                    return self._send_json(500, {"error": "spawn 실패", "output": e.output})
                except subprocess.TimeoutExpired:
                    return self._send_json(504, {"error": "spawn 30초 초과"})
                # 출력에서 URL 추출
                m = re.search(r"http://localhost:(\d+)", out)
                if not m:
                    return self._send_json(500, {"error": "URL 미발견", "output": out})
                port = int(m.group(1))
                return self._send_json(200, {"port": port, "url": f"http://localhost:{port}", "branch": branch_name, "output": out})

            if parsed.path == "/api/dashboard/stop":
                # body: {"port": N} — 해당 dashboard 종료 (methodology dashboard stop)
                port = payload.get("port")
                if not port:
                    return self._send_json(400, {"error": "port 필요"})
                root = Path.cwd()
                meth = resolve_methodology_py(root)
                try:
                    subprocess.check_output(
                        [sys.executable, str(meth), "dashboard", "stop", "--port", str(int(port))],
                        cwd=str(root), text=True, stderr=subprocess.STDOUT, timeout=10,
                    )
                except subprocess.CalledProcessError as e:
                    return self._send_json(500, {"error": "stop 실패", "output": e.output})
                except subprocess.TimeoutExpired:
                    return self._send_json(504, {"error": "stop 10초 초과"})
                return self._send_json(200, {"stopped": int(port)})

            return self._send_json(404, {"error": "unknown endpoint"})

    class Server(socketserver.ThreadingTCPServer):
        allow_reuse_address = True
        daemon_threads = True

    port = start_port
    for _ in range(20):
        try:
            with Server(("127.0.0.1", port), Handler) as httpd:
                print(f"[serve] http://localhost:{port}/{out.name}", file=sys.stderr)
                print(f"[serve] dev-server API: /api/servers (GET/POST start|stop|kill-range)", file=sys.stderr)
                try:
                    httpd.serve_forever()
                except KeyboardInterrupt:
                    print("\n[stop]", file=sys.stderr)
                return
        except OSError as e:
            if e.errno == 48:  # Address already in use
                print(f"[warn] port {port} busy, trying {port+1}", file=sys.stderr)
                port += 1
                continue
            raise


if __name__ == "__main__":
    sys.exit(main())
