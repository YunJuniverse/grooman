# setup-windows.ps1 — in-spire (windows).lnk 바로가기 자동 생성 (아이콘 임베드)
# 위치: _start/settings/setup-windows.ps1
# 사용자 1회 실행:
#   1. settings 폴더에서 우클릭 → PowerShell 에서 실행
#   2. 또는: powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1
#
# 결과: _start/in-spire (windows).lnk (부모 디렉터리에 생성)

$here = Split-Path -Parent $MyInvocation.MyCommand.Path       # _start/settings/
$root = Split-Path -Parent $here                                # _start/
$batPath = Join-Path $root "in-spire (windows).bat"
$icoPath = Join-Path $root "assets\in-spire.ico"
$lnkPath = Join-Path $root "in-spire (windows).lnk"

if (-not (Test-Path $batPath)) {
    Write-Host "[err] in-spire (windows).bat not found in $root" -ForegroundColor Red
    exit 1
}

$shell = New-Object -ComObject WScript.Shell
$lnk = $shell.CreateShortcut($lnkPath)
$lnk.TargetPath = $batPath
$lnk.WorkingDirectory = $root
if (Test-Path $icoPath) {
    $lnk.IconLocation = "$icoPath,0"
}
$lnk.Description = "in-spire — methodology dashboard launcher (Windows)"
$lnk.Save()

Write-Host "[ok] Created 'in-spire (windows).lnk' with icon at $lnkPath" -ForegroundColor Green
Write-Host "Double-click the .lnk in _start/ to launch the dashboard."
