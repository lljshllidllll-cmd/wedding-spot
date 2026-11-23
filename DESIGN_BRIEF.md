# Design Brief

## Product job
예비부부가 7개 구의 예식 공간을 지역과 주차 조건으로 좁혀 주소, 전화, 주차, 공식 홈페이지를 바로 비교한다.

## Direction
한 화면에서 지역 선택과 결과 목록을 이어 읽는 탐색 대시보드. 크림색 종이 바탕, 병아리 노랑, 짙은 갈색 글자로 밝고 장난스러운 결혼 준비 노트의 분위기를 만든다.

## Brand reading
사용자가 제목을 `우당탕탕 결혼식 대작전`으로 지정했다. 병아리는 직접 만든 단순 벡터 그림을 헤더, 히어로, 안내 영역에 작게 반복한다. 시설 사진과 수치, 출처는 그대로 둔다.

## Reference evidence
- 서울시 더 아름다운 결혼식의 서교스퀘어 상세 페이지(2026-11-22 확인): 장소명, 수용 규모, 주차, 주소, 운영 정보를 순서대로 제시한다. 지역별 비교와 달리 단일 시설 상세에 집중한다.
- 더블유페스타 일산점의 위치 안내 검색 결과(2026-11-22 확인): 주소·대표전화·주차장 진입 정보를 함께 제공한다. 실제 페이지 열기는 시간 초과로 확인하지 못했다.

## Reference synthesis
서울시 상세 정보의 필드 순서를 목록 카드에 압축한다. 공식 사이트의 길찾기와 문의 연결 방식을 각 카드 행동으로 옮긴다. 원본 브랜드 스타일과 문구는 복제하지 않는다.

## Reference implementation map
| Reference evidence | Extracted principle | Local component | Motion/state | Mobile translation | Acceptance evidence |
|---|---|---|---|---|---|
| 서울시 시설 상세의 장소·주차·주소 | 핵심 필드 우선 노출 | `.venue-card` | 필터 시 목록 교체 | 정보 행을 세로 배치 | 카드에 네 필드 표시 |
| 더블유페스타 위치 안내의 전화·주차장 | 바로 문의하고 지도 열기 | `.card-actions` | 링크 hover/focus | 버튼을 두 줄로 재배치 | 전화·지도·홈페이지 링크 |
| 사용자가 제공한 첫 화면 캡처(2026-11-23) | 큰 제목과 부제, 오른쪽 보조 시각 영역 | `.hero-copy`, `.hero-art` | 제목과 병아리 순차 진입 | 그림을 짧은 가로 띠로 압축 | 데스크톱·390px 첫 화면 |

## Signature composition and component
왼쪽 지역 탐색 레일과 오른쪽 결과 대시보드. 선택한 구의 건수와 주차 정보를 함께 바꾸는 지역 헤더를 대표 컴포넌트로 쓴다.

## Motion storyboard
| Beat | Trigger | Elements | From → to | Duration/ease | Purpose | Reduced motion |
|---|---|---|---|---|---|---|
| 첫 진입 | 로드 | 제목·요약 | 아래 12px에서 제자리 | 450ms ease-out | 작업 안내 | 즉시 표시 |
| 지역 선택 | 탭 클릭 | 헤더·목록 | 불투명도 0.6에서 1 | 220ms ease-out | 결과 전환 표시 | 즉시 교체 |
| 카드 반응 | hover/focus | 카드·링크 | 배경과 테두리 변화 | 160ms ease | 조작 가능 표시 | 색 변화만 |

## Tokens
진한 갈색 `#4a371d`, 병아리 노랑 `#f3c845`, 크림 `#fff9e8`, 고딕 시스템 폰트, 카드 반경 18px. 노란 면 위의 본문은 갈색으로 대비를 확보한다.

## Copy ladder
지역 선택 → 확인된 예식 공간 보기 → 전화·지도·홈페이지에서 최종 확인.

## Screen priorities
1. 지역 전환
2. 핵심 정보 비교
3. 출처 및 미확인 정보 명시

## Behavior that must remain unchanged
신규 프로젝트. 대학 운영 웨딩홀, 동문회관, 군 관련 회관은 본 목록에서 제외하고 별도 제외 페이지에 이름·위치·이유만 표시한다.

## Anti-template decisions
동일한 KPI 카드 묶음 대신 지역 레일과 명확한 정보 행을 쓴다. 확인되지 않은 수치는 추정하지 않는다.

## Responsive and motion contract
- Viewports: 320 / 360 / 390 / 430 / desktop
- 모바일에서는 왼쪽 레일을 가로 스크롤 탭으로 바꾸고 검색을 결과 바로 위에 둔다.
- 히어로의 큰 병아리는 모바일에서 얕은 장식 띠로 줄이고 제목과 첫 행동을 위에 둔다.
- Reduced-motion final state: 모든 항목을 전환 효과 없이 즉시 표시한다.

## Verification captures
구현 후 데스크톱과 390px 화면, 탭·검색·주차 필터 상태를 확인한다.
