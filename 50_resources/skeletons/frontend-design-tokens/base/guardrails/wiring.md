# 가드레일 연결 (wiring) — 3지점

> 가드레일은 *코드를 쓰기 전에* 켠다. 아래 3지점에 모두 연결해야 fail-closed가 성립한다.
> 1지점만 연결하면(예: CI만) 로컬에서 위반이 새어 들어온다.

## 1. package.json — lint:tokens 스크립트

```jsonc
{
  "scripts": {
    "lint:tokens": "bash guardrails/check-no-arbitrary-color.sh src",
    // 기존 lint와 묶으려면:
    "lint": "eslint . && npm run lint:tokens"
  }
}
```

## 2. CI (PR 게이트) — 위반 시 머지 차단

GitHub Actions 예 (`.github/workflows/ci.yml`):

```yaml
  design-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Design token guardrail
        run: bash guardrails/check-no-arbitrary-color.sh src
```

PR에서 이 job이 실패하면 머지가 막히도록 브랜치 보호 규칙에 required check로 등록.

## 3. pre-push 훅 — push 직전 로컬 차단

`.git/hooks/pre-push` (또는 husky `.husky/pre-push`):

```bash
#!/usr/bin/env bash
bash guardrails/check-no-arbitrary-color.sh src || {
  echo "✗ design-token 위반 — push 차단. 토큰으로 교체 후 재시도."
  exit 1
}
```

```bash
chmod +x .git/hooks/pre-push   # 훅 활성화
```

비상 탈출(의식적): `git push --no-verify` — 남용 시 가드레일 무력화.

## 4. 의도적 예외 (ALLOW_HEX)

순백 max-contrast·메달 gold/silver 등 *진짜 의도적 예외*만 스크립트 상단 `ALLOW_HEX` 배열에 hex로 등록. 귀찮아서 넣으면 가드레일이 죽는다. 등록 시 PR에 근거 한 줄.

## 5. 켠 직후 — 더미 위반으로 검증 (의무)

```bash
echo 'const x = () => <div className="bg-[#123456]">dummy</div>;' > src/__token_check__.tsx
bash guardrails/check-no-arbitrary-color.sh src   # exit 1 이어야 정상
rm src/__token_check__.tsx
```

빌드가 *깨지지 않으면* 가드레일이 연결되지 않은 것 — 죽은 가드레일.
