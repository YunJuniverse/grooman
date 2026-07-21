#!/bin/bash
# in-spire — methodology dashboard launcher (Linux)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT" || exit 1
# 3-tier 구조 탐지: v4.0(60_tools) → v3.2(50_tools) → root fallback
METH=""
if   [ -f "60_tools/methodology.py" ]; then METH="60_tools/methodology.py"
elif [ -f "50_tools/methodology.py" ]; then METH="50_tools/methodology.py"
elif [ -f "methodology.py" ];           then METH="methodology.py"
fi
if [ -z "$METH" ]; then
  echo "[err] methodology.py not found (60_tools / 50_tools / root)"
  exit 1
fi
exec /usr/bin/env python3 "$METH" dashboard --open
