@echo off
REM in-spire — methodology dashboard launcher (Windows)
REM Double-click entry point.

cd /d "%~dp0\.."

REM 3-tier 구조 탐지: v4.0(60_tools) -> v3.2(50_tools) -> root fallback
set "METH="
if exist "60_tools\methodology.py" set "METH=60_tools\methodology.py"
if not defined METH if exist "50_tools\methodology.py" set "METH=50_tools\methodology.py"
if not defined METH if exist "methodology.py" set "METH=methodology.py"

if not defined METH (
  echo [err] methodology.py not found ^(60_tools / 50_tools / root^).
  echo Run this file inside a project where methodology is applied.
  pause
  exit /b 1
)

python "%METH%" dashboard --open
echo.
echo Dashboard is serving in the background. Stop with:
echo   python "%METH%" dashboard stop --all
pause
