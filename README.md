# Wedding Spot — 결혼식 대작전

고양 3개 구와 서울 6개 구의 예식장 후보를 비교하는 정적 웹사이트입니다.

[배포 사이트](https://lljshllidllll-cmd.github.io/wedding-spot/) · [GitHub 저장소](https://github.com/lljshllidllll-cmd/wedding-spot)

- 지역별 탭, 상호·주소 검색, 확인 상태·사진 필터
- 공식 사이트에서 수집하고 검수한 사진 확대 갤러리와 원본 출처
- 대학·동문·군 관련 시설 등의 별도 제외 목록
- 2026-11-22 기준 후보 118곳, 사진 312장: 52곳 5장, 23곳 일부, 43곳 미확보

현재 영업 및 신규 예약 여부를 전화로 확정한 명부는 아닙니다. 상세 범위와 미확인 항목은 [조사 보고서](SURVEY_REPORT.md), [자료 보완 보고서](ENRICHMENT_REPORT.md)에 기록했습니다.

## 로컬 확인

Node.js 20 이상에서 `node research/preview.mjs`를 실행하고 http://127.0.0.1:8765 를 엽니다. 별도 설치나 서버 비밀키는 필요하지 않습니다.

## 검사와 배포

1. `node research/verify.mjs`
2. `node research/verify-enrichment.mjs`
3. `node research/build-public.mjs`
4. `node research/prepare-pages-commit.mjs`
5. `git push origin gh-pages`

GitHub Pages의 게시 원본은 `gh-pages` 브랜치의 루트입니다. `main`은 소스와 조사 자료를 보관하고, 배포 브랜치는 선택한 사진·최신 데이터·보고서와 화면 파일을 담습니다. `dist/`는 배포 파일을 만드는 전용 폴더입니다.

후보 목록 재생성은 `research/build-catalog.mjs` → `research/report.mjs` → `research/enrichment-report.mjs` 순서입니다. 원시 웹 페이지 HTML은 로컬 조사 자료로 보관합니다. 사진 원본·출처·검수 결과는 `research/enrichment/reviewed-photos.json`과 `catalog.json`에 있습니다.
