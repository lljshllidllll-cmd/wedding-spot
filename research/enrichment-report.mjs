import fs from 'node:fs';
const c=JSON.parse(fs.readFileSync('catalog.json','utf8')),e=c.enrichment;
const esc=x=>String(x??'미확인').replaceAll('|',' / ').replaceAll('\n',' ');
const limitations=v=>{
 const reasons=[];
 if(!v.phone)reasons.push('전화번호 미확인');
 if(!v.parkingKnown)reasons.push('주차 조건 미확인 또는 상충');
 if(!v.website)reasons.push('공식 홈페이지 미확인');
 if(v.photos.length<5){const p='research/enrichment/'+v.id+'-photos.json',r=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):null;reasons.push(v.photos.length?`장소·중복 검수 후 ${v.photos.length}장만 확보`:(r?.photos.length?'수집 후보가 로고·광고·타 장소 등으로 검수 제외됨':r?.errors?.length?'공식 사진 접속·파일 확인 실패 또는 적합 사진 부족':'해당 장소의 공식 사이트 공개 사진 미확보'));}
 return reasons.join('; ')||'5장 확보 · 현재 예약 가능 여부는 별도 문의';
};
const report=`# 예식장 명칭별 검색·자료 보완 결과\n\n확인일: ${c.checkedAt}\n\n- 대상: 기존 후보 ${e.total}곳. 제외 시설 ${c.excluded.length}곳은 명칭·주소·사유만 유지했습니다.\n- 실제 검색 결과 확인: 네이버 ${e.naverResults}곳, 구글 ${e.googleResults}곳. 검색 결과 원문·링크는 시설별 browser-search.json에 보존했습니다. 검색했다는 사실은 현재 영업 확인과 다릅니다.\n- 사진: 공식 사이트에서 수집하고 육안 검수한 ${e.photos}장. 5장 확보 ${e.completeGalleries}곳, 1~4장 ${e.partialGalleries}곳, 미확보 ${e.missingGalleries}곳. 크기만 다른 중복, 지도, 로고, 공지, 지점이 불분명한 사진은 표시하지 않았습니다.\n- 홈페이지·전화·주차 값 변경 ${e.changes}건. 전화 미확인 ${e.missingPhone}곳, 주차 미확인·상충 ${e.missingParking}곳, 홈페이지 미확인 ${e.missingWebsite}곳.\n- 사진 원본 URL, 출처 페이지, 파일 크기, 해시와 확인일을 데이터에 보관했습니다. 사진 촬영일은 확인되지 않으며, 예정 시설의 공식 홍보 이미지에는 완공 전 이미지가 포함될 수 있습니다.\n- 전화 문의와 현장 확인은 수행하지 않았습니다. 과거 번호·호텔 대표번호·통합 예약번호는 별도 설명을 붙였습니다. 전화·주차 자료에서 서로 다른 기관·지점의 정보는 합치지 않았습니다.\n\n## 리뷰 수와 정렬\n\n- 2026-11-22 네이버 명칭별 검색 51곳. 방문자리뷰 45곳, 블로그 리뷰 47곳의 숫자를 확보했습니다. 방문자 숫자 미표시 2곳과 동일 시설 미확인 4곳은 0건으로 간주하지 않았습니다.\n- 기본 정렬은 방문자리뷰 내림차순, 동률은 블로그 리뷰 내림차순입니다. 가격표와 업체 카드에 같은 순서를 적용했습니다.\n- 호텔·뷔페·컨벤션센터 전체 리뷰는 예식 전용 리뷰 수와 다르며 화면에 범위를 명시했습니다. 송파구 베네치아, 강남구 그래머시, 마포구 곤자가의 타 시설 리뷰를 사용하지 않았습니다.\n- 네이버 검색 집계는 상세 화면과 갱신 시차가 있을 수 있고, 협찬·홍보 글도 포함될 수 있습니다. 기준일 이후 자동 갱신되지 않습니다. 시설별 숫자·조회일·원문 링크는 catalog.csv 및 research/review-counts.json에 보관했습니다.\n\n## 시설별 결과 및 남은 항목\n\n| 지역 | 시설 | 전화 | 주차 | 홈페이지 | 사진 | 네이버 | 구글 | 남은 항목 |\n|---|---|---|---|---|---|---|---|---|\n${c.venues.map(v=>`| ${[c.regions.find(r=>r.id===v.region).name,v.name,v.phone,v.parking,v.website,v.photos.length+'/5',`[검색](${v.searchChecks.naver.url})`,`[검색](${v.searchChecks.google.url})`,limitations(v)].map(esc).join(' | ')} |`).join('\n')}\n\n## 보완 근거\n\n${JSON.parse(fs.readFileSync('research/enrichment/change-log.json','utf8')).map(x=>`- **${x.name} / ${x.field}**: ${esc(x.before)} → ${esc(x.after)}${x.source?` [근거](${x.source.url}) · ${x.source.type}`:''}`).join('\n')}\n`;
fs.writeFileSync('ENRICHMENT_REPORT.md',report);
const q=x=>'"'+String(x??'').replaceAll('"','""')+'"';
const cols=['지역','이름','상태','주소','전화','전화설명','전화근거','주차','주차근거','홈페이지','사진수','사진출처','네이버검색','구글검색','남은항목','방문자리뷰','블로그리뷰','리뷰범위','리뷰확인일','리뷰출처'];
const rows=c.venues.map(v=>[c.regions.find(r=>r.id===v.region).name,v.name,c.statusLabels[v.status],v.address,v.phone,v.phoneLabel,v.fieldSources?.phone?.url??v.source,v.parking,v.fieldSources?.parking?.url??v.source,v.website,v.photos.length,[...new Set(v.photos.map(p=>p.sourcePage))].join(' / '),v.searchChecks.naver.url,v.searchChecks.google.url,limitations(v),v.reviews?.visitor,v.reviews?.blog,v.reviews?.scope,v.reviews?.checkedAt,v.reviews?.sourceUrl]);
fs.writeFileSync('catalog.csv','\ufeff'+[cols,...rows].map(row=>row.map(q).join(',')).join('\r\n'));
console.log(e);
