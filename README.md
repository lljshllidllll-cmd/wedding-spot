# Wedding Spot

고양 3개 구와 서울 4개 구의 실내 예식 공간을 비교합니다.

[배포 사이트](https://lljshllidllll-cmd.github.io/wedding-spot/) · [GitHub 저장소](https://github.com/lljshllidllll-cmd/wedding-spot)

- 현재 후보 41곳, 별도 제외 67곳. 지역 탭·상호 검색·상태·사진 필터.
- 모든 후보에 대관료·성인 식대와 적용기간·출처 확인 양식 제공. 공개 가격 확보 38곳.
- 업체 공시·공식 안내·중개 공개가와 블로그 참고 자료를 구분. 날짜별 확정 견적은 별도 상담 필요.
- 대학·동문·군 시설, 문화·체험 시설, 공원·야외 예식 공간은 제외. 혼합 운영 시설은 실내 상품만 수록.
- 현재 공식 사진 172장. 5장 확보 31곳, 일부 7곳, 미확보 3곳.

## 재생성

범위: research/catalog-scope.json. 가격 입력: research/pricing/all-regions.json. 원시 조사 파일은 로컬 전용 폴더에 보관하며 일반 재생성에 필요하지 않습니다.

1. node research/build-catalog.mjs
2. node research/report.mjs
3. node research/enrichment-report.mjs
4. node research/pricing-report.mjs
5. node research/verify.mjs
6. node research/verify-enrichment.mjs
7. node research/verify-pricing.mjs
8. node research/build-public.mjs

배포 생성 시 `dist/`를 비우고 현재 후보의 사진과 화면 파일만 다시 복사합니다.

로컬 미리보기: node research/preview.mjs 후 http://127.0.0.1:8765 접속.

GitHub Pages 게시 원본은 gh-pages 루트. 배포 파일 생성 후 node research/prepare-pages-commit.mjs 및 git push origin main gh-pages를 사용합니다. 사진 원본을 삭제하지 않고 현재 선택된 파일만 배포합니다.

- 지역 내 기본 정렬: 네이버 방문자리뷰 내림차순, 동률은 블로그 리뷰 내림차순. 미확인 건수는 0으로 치환하지 않고 뒤에 표시합니다. 호텔 등은 전체 시설 리뷰임을 구분합니다. 리뷰 원본 집계와 주소 대조는 `research/review-counts.json`에 보관합니다.
