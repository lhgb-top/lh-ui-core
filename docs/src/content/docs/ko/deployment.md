---
title: "배포 안내"
---

이 문서 사이트는 가족 약정에 따라 `www.lhgb.top`의 `/lhui/core/` 접두사 아래에 배포됩니다(android / ios / harmony / windows 네 사이트와 동일한 체계).

사이트 프레임워크는 **Astro Starlight**입니다(2026-10-12에 VitePress에서 마이그레이션, 선정 기록은 [문서 사이트 기술 선정](./guide/tech-choice) 참고).

## 빌드

```bash
pnpm docs:build
```

산출물은 `docs/dist/`에 있습니다(`astro.config.mjs`의 `outDir: 'docs/dist'`로 명시적으로 지정, **codegen의 리포지터리 루트 `dist/`를 의도적으로 피함**, 레드라인 6 참고. `.gitignore`에 포함되어 버전 관리에서 제외).

배포 관련 설정은 모두 `docs/astro.config.mjs`에 있습니다.

| 설정 항목 | 값 | 설명 |
| --- | --- | --- |
| `site` | `https://www.lhgb.top` | sitemap과 SEO의 사이트 출처 |
| `base` | `/lhui/core/` | 배포 접두사, 시작과 끝에 슬래시 필수 |
| `build.format` | `'file'` | `page/index.html` 대신 `page.html`을 산출, 가족 nginx 계약에 맞춤 |
| `trailingSlash` | `'never'` | Starlight가 담당, `format: 'file'`과 함께 사용 |

<Aside type="tip" title="배포 경로 변경은 한 곳에서">
`base`는 시작과 끝에 슬래시가 있어야 합니다. Astro의 `base`는 산출물의 자원 경로, sitemap, pagefind 검색 인덱스에 모두 적용되므로, VitePress 시절처럼 `.env` 파일을 따로 유지할 필요가 없습니다.
</Aside>

<Aside type="caution" title="base가 적용되지 않는 두 종류의 링크">
`base`는 Astro / Starlight가 직접 생성하는 부분에만 적용됩니다: 페이지 자원, 사이드바, 페이지 매김, locale 전환, sitemap, pagefind 인덱스. **다음 두 종류에는 base가 자동으로 붙지 않습니다**:

1. **frontmatter의 `hero.actions[].link`**(`template: splash` 홈페이지의 CTA 버튼) — Starlight 0.42.6은 이를 있는 그대로 `href`로 사용하므로, `index.mdx`에 전체 접두사를 직접 적어야 합니다(예: `/lhui/core/guide/quickstart`).
2. **markdown 본문에서 `/`로 시작하는 절대 경로 링크** — Astro 7의 markdown 렌더링은 base를 이어붙이지 않습니다.

이 리포지터리에서는 `astro.config.mjs`의 `basePrefixPlugin` 플러그인이 빌드 시 두 번째 종류에 자동으로 접두사를 붙여 주므로, 본문에는 `/tokens/reference`와 같은 절대 경로를 그대로 쓸 수 있습니다. 첫 번째 종류는 전체 접두사를 직접 적어야 합니다. `base`를 바꿀 때는 홈페이지 hero의 버튼 2개도 함께 바꿔 주세요.
</Aside>

## 업로드

`docs/dist/`의 내용을 서버 디렉터리 `/home/webuser/nginx/lh-ui/core/`에 업로드합니다.

## nginx 설정

```nginx
location ^~ /lhui/core/ {
    alias /home/webuser/nginx/lh-ui/core/;
    index index.html;
    try_files $uri $uri.html $uri/ /lhui/core/index.html;
}
```

가족에서 채험한 세 가지 계약(Starlight 마이그레이션 후에도 여전히 유효함을 항목별로 확인):

1. **`try_files` 폴백에 base 접두사가 필수**(`/lhui/core/index.html`). 그렇지 않으면 딥 링크 새로고침 시 404가 납니다.
2. **`alias`의 끝 슬래시는 생략할 수 없으며**, `location ^~ /lhui/core/`와 짝지어 사용합니다.
3. **`$uri.html`이 필수** — 이 사이트는 `build.format: 'file'`로 `page.html` 형태를 산출하므로(URL은 `/lhui/core/page`, 끝 슬래시 없음) nginx가 `$uri.html`로 실제 파일을 찾습니다. 이것을 빼면 딥 링크가 404가 됩니다.

## 배포 후 자체 점검

```bash
curl -I https://www.lhgb.top/lhui/core/guide/introduction
grep -c "lhui/core" docs/dist/index.html   # 0보다 커야 함
# 역방향 어서션: 산출물에 base가 빠진 사이트 내부 링크가 없어야 함(일치 수는 0이어야 함)
grep -rcE 'href="/(guide|tokens|specs|cases|codegen|artifacts)/' docs/dist/ | grep -v ':0$' || echo OK
```

## 로컬 미리보기

```bash
pnpm docs:dev        # http://localhost:5185/lhui/core/
pnpm docs:preview    # 프로덕션 빌드로 미리보기, 마찬가지로 base 접두사 포함
```

Astro의 `base`는 dev server에서도 동일하게 적용됩니다(VitePress처럼 `.env.development`로 `DOCS_BASE=/`를 구분하는 방식과 다름). 따라서 로컬 경로에도 **`/lhui/core/` 접두사가 붙습니다** — 로컬과 프로덕션의 URL 구조가 완전히 동일하여, 예전의 "로컬에는 접두사 없음, 프로덕션에는 접두사 있음"이라는 인지 부담이 사라졌습니다.

## 포트 할당

| 리포지터리 | dev 포트 | base |
| --- | --- | --- |
| lh-ui-vue2 | 5177 | `/lhui/vue2/` |
| lh-ui-plus | 5178 | `/lhui/vue3/` |
| lh-ui-react | 5179 | `/lhui/react/` |
| lh-ui-uniapp | 5187 | `/lhui/uniapp/` |
| lh-ui-android | 5181 | `/lhui/android/` |
| lh-ui-ios | 5182 | `/lhui/ios/` |
| lh-ui-harmony | 5183 | `/lhui/harmony/` |
| lh-ui-windows | 5186 | `/lhui/windows/` |
| **lh-ui-core(이 사이트)** | **5185** | **`/lhui/core/`** |

가족 배포의 권위 있는 참고 자료는 `lh-ui/docs` 리포지터리의 `部署/nginx-lhui.conf.md`에 있습니다. 이 문서는 이 리포지터리에서 보관하는 운영 매뉴얼입니다. 배포가 반영된 뒤에는 가족 총괄 표를 함께 업데이트해야 합니다(이번 변경에는 리포지터리 간 수정이 포함되지 않습니다).
