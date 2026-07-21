# _start/ — in-spire 진입점

> **자기 OS 에 맞는 파일을 더블클릭하면 dashboard 가 자동으로 열립니다.**

## 진입점

| OS | 파일 | 사용법 |
|---|---|---|
| **macOS** | `in-spire (mac).app` | 더블클릭 ⭐ |
| **Windows** | `in-spire (windows).bat` (또는 `.lnk` setup 후) | 더블클릭 |
| **Linux** | `in-spire (linux).sh` | 실행 또는 `.desktop` 메뉴 등록 |

## OS 별 1회 설치 (필요한 경우만)

### macOS
첫 실행 시 *"확인되지 않은 개발자"* 경고:
- **우클릭 → 열기 → 열기** (1회만)
- 또는 시스템 설정 → 보안 및 개인정보 → *"그래도 열기"*

### Windows
1. `settings/setup-windows.ps1` 우클릭 → *PowerShell 에서 실행*
2. `in-spire (windows).lnk` (아이콘 박힌 바로가기) 자동 생성
3. 이후: `.lnk` 또는 `.bat` 더블클릭

### Linux
1. `bash settings/setup-linux.sh` 실행 (`.desktop` 의 절대경로 갱신)
2. 다음 중 선택:
   - `./in-spire (linux).sh` 직접 실행
   - `cp assets/in-spire.desktop ~/.local/share/applications/` (시스템 메뉴 등록)

## 동작

모든 실행파일은 동일한 명령을 호출:
```
python3 60_tools/methodology.py dashboard --open
```

즉:
1. 자동 포트 할당 (8765~8799)
2. background HTTP 서버 시작
3. dashboard.html 빌드 (현재 브랜치·commit 반영)
4. 기본 브라우저로 `http://localhost:<port>` 자동 열기

## 종료

```bash
python3 60_tools/methodology.py dashboard stop --all
```
또는 dashboard UI 의 **Local Dashboards** 카드에서 Stop 버튼.

## 폴더 구조

```
_start/
├── in-spire (mac).app/          ← macOS 더블클릭
├── in-spire (windows).bat       ← Windows 더블클릭
├── in-spire (linux).sh          ← Linux 실행
├── settings/                    ← 1회 setup 스크립트
│   ├── setup-windows.ps1        ← Windows .lnk 생성
│   └── setup-linux.sh           ← Linux .desktop 경로 치환
├── README.md                    ← 본 문서
└── assets/                      ← 아이콘·메타·원본
    ├── icons/
    │   ├── in-spire-mac.png     (1024×1024)
    │   ├── in-spire-win.png
    │   ├── in-spire-linux.png
    │   └── in-spire-256-linux.png  (Linux .desktop 용)
    ├── in-spire.ico             (Windows 멀티 사이즈)
    └── in-spire.desktop         (Linux 데스크톱 항목)
```

## 문제 해결

- **"60_tools/methodology.py not found"**: 본 `_start/` 폴더가 *방법론 적용 프로젝트 루트* 안에 있는지 확인.
- **Python 3 미설치**: `python3 --version` 으로 확인.
- **이미 떠 있던 dashboard 충돌**: `python3 60_tools/methodology.py dashboard stop --all` 로 정리.
