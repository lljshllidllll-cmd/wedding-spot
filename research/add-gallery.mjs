import fs from 'node:fs';
let html=fs.readFileSync('index.html','utf8'),js=fs.readFileSync('script.js','utf8');
const replace=(text,from,to)=>{if(!text.includes(from))throw new Error('Missing anchor: '+from);return text.replace(from,to);};
html=replace(html,'<div id="result-summary"','<label class="photo-filter"><input id="photo-filter" type="checkbox"> 사진이 있는 공간만 보기</label>\n            <div id="result-summary"');
html=replace(html,'<div id="survey-metrics" class="survey-metrics"></div>','<div id="survey-metrics" class="survey-metrics"></div><div class="survey-section"><h2>명칭별 검색 · 사진 보완 현황</h2><div id="enrichment-summary"></div><p>각 후보의 명칭으로 네이버·구글을 각각 검색했습니다. 공식 사이트에서 해당 장소 사진을 확인하고 로고·광고·지도·중복 이미지를 제외했습니다. 확보한 사진만 표시하며 5장 미만인 곳도 있습니다.</p><a href="ENRICHMENT_REPORT.md" target="_blank" rel="noopener">시설별 검색·미확보 내역 보기</a></div>');
html=replace(html,'  <script src="catalog.js" defer></script>',`  <dialog id="photo-dialog" aria-labelledby="photo-title" aria-describedby="photo-description">
    <div class="gallery-header"><div><p>OFFICIAL GALLERY</p><h2 id="photo-title"></h2></div><button type="button" id="photo-close" aria-label="사진 닫기">닫기 ×</button></div>
    <p id="photo-description" class="gallery-description"></p>
    <div class="gallery-stage"><button type="button" id="photo-prev" aria-label="이전 사진">‹</button><img id="photo-image" alt=""><button type="button" id="photo-next" aria-label="다음 사진">›</button><p id="photo-error" hidden>사진을 불러오지 못했습니다. 아래 원본 이미지 링크를 이용해 주세요.</p></div>
    <p id="photo-counter" aria-live="polite"></p><div id="photo-thumbs" class="photo-thumbs" aria-label="사진 선택"></div>
    <div class="gallery-source"><span>사진 제공: 해당 시설 공식 사이트 · 2026. 11. 22. 확인</span><a id="photo-source" target="_blank" rel="noopener noreferrer">출처 페이지 ↗</a><a id="photo-original" target="_blank" rel="noopener noreferrer">원본 이미지 ↗</a></div>
  </dialog>
  <script src="catalog.js" defer></script>`);
js=replace(js,'let selectedRegion',"const photoFilter = document.querySelector('#photo-filter');\nlet selectedRegion");
js=replace(js,'return matchesText && matchesParking && matchesStatus;','return matchesText && matchesParking && matchesStatus && (!photoFilter.checked || venue.photos.length > 0);');
js=replace(js,'function renderVenues() {',`function fieldSource(venue,field) {
  const source = venue.fieldSources?.[field];
  return source ? '<a class="field-source" href="'+escapeHtml(source.url)+'" target="_blank" rel="noopener noreferrer">'+(source.type==='official'?'공식 근거':source.type==='historical'?'과거 자료':'외부 근거')+' ↗</a>' : '';
}
function renderVenues() {`);
js=replace(js,'<dl class="info-list">','${venue.photos.length ? `<button type="button" class="venue-cover" data-gallery="${venue.id}" aria-label="${escapeHtml(venue.name)} 사진 ${venue.photos.length}장 보기"><img src="${escapeHtml(venue.photos[0].localPath)}" alt="${escapeHtml(venue.name)} 공식 사이트 대표 이미지" loading="lazy" width="640" height="360"><span>사진 ${venue.photos.length}/5장 · 확대 보기 ↗</span></button>` : `<div class="photo-unavailable">공식 사이트 사진 미확보</div>`}<dl class="info-list">');
js=replace(js,'infoRow("전화", phone,','infoRow("전화", phone + fieldSource(venue,"phone"),');
js=replace(js,'infoRow("주차", escapeHtml(venue.parking),','infoRow("주차", escapeHtml(venue.parking) + fieldSource(venue,"parking"),');
js=replace(js,'<div class="card-actions">${links}</div>','<p class="photo-note">${escapeHtml(venue.photoNote)}</p><div class="search-links">명칭 검색 <a href="${escapeHtml(venue.searchChecks.naver.url)}" target="_blank" rel="noopener noreferrer">네이버 ↗</a><a href="${escapeHtml(venue.searchChecks.google.url)}" target="_blank" rel="noopener noreferrer">구글 ↗</a></div><div class="card-actions">${links}</div>');
js += fs.readFileSync('research/gallery-ui.js','utf8');
fs.writeFileSync('index.html',html);fs.writeFileSync('script.js',js);
