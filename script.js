const { regions, venues, excluded, statusLabels } = venueCatalog;

const tabsElement = document.querySelector("#region-tabs");
const listElement = document.querySelector("#venue-list");
const searchElement = document.querySelector("#search");
const reviewSortElement = document.querySelector('#review-sort');
let selectedRegion = regions[0].id;
const choiceStorageKey = 'wedding-spot-choices-v1';
const choiceLimits = { first: 3, second: 5 };
const choiceLabels = { first: '1순위', second: '2순위', excluded: '제외' };
const venueIds = new Set(venues.map(venue => venue.id));
function loadChoices() {
  const result = Object.create(null);
  try {
    const saved = JSON.parse(localStorage.getItem(choiceStorageKey) || '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return result;
    const counts = { first: 0, second: 0 };
    for (const [id, choice] of Object.entries(saved)) {
      if (!venueIds.has(id) || !Object.hasOwn(choiceLabels, choice)) continue;
      if (choiceLimits[choice] && counts[choice] >= choiceLimits[choice]) continue;
      result[id] = choice;
      if (choiceLimits[choice]) counts[choice]++;
    }
  } catch { /* 저장 공간을 사용할 수 없어도 현재 화면에서는 선택할 수 있습니다. */ }
  return result;
}
const choices = loadChoices();
function choiceCounts() {
  const values = Object.values(choices);
  return { first: values.filter(value => value === 'first').length, second: values.filter(value => value === 'second').length, excluded: values.filter(value => value === 'excluded').length };
}
function updateChoiceStatus(message = '') {
  const counts = choiceCounts();
  document.querySelector('#choice-status').textContent = `전체 선택 · 1순위 ${counts.first}/3 · 2순위 ${counts.second}/5 · 제외 ${counts.excluded}곳`;
  document.querySelector('#choice-message').textContent = message || '선택은 이 브라우저에 저장됩니다.';
}
function renderChoiceCell(venue) {
  return `<td class="choice-cell"><div class="choice-options" role="group" aria-label="${escapeHtml(venue.name)} 선택">${Object.entries(choiceLabels).map(([value,label])=>`<label class="choice-option"><input type="checkbox" data-choice-id="${venue.id}" value="${value}" aria-label="${escapeHtml(venue.name)} ${label}"${choices[venue.id]===value?' checked':''}><span>${label}</span></label>`).join('')}</div></td>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[char]);
}

function mapUrl(address) {
  return `https://map.naver.com/p/search/${encodeURIComponent(address)}`;
}

function renderTabs() {
  tabsElement.innerHTML = regions.map(region => {
    const count = venues.filter(venue => venue.region === region.id).length;
    const active = region.id === selectedRegion;
    return `<button type="button" class="region-tab" role="tab" id="tab-${region.id}" aria-selected="${active}" aria-controls="venue-list" tabindex="${active ? 0 : -1}" data-region="${region.id}"><span>${escapeHtml(region.name)}</span><small>${count}</small></button>`;
  }).join("");
}

function infoRow(label, value, className = "") {
  return `<div class="info-row"><dt>${label}</dt><dd class="${className}">${value}</dd></div>`;
}

function fieldSource(venue,field) {
  const source = venue.fieldSources?.[field];
  return source ? '<a class="field-source" href="'+escapeHtml(source.url)+'" target="_blank" rel="noopener noreferrer">'+(source.type==='official'?'공식 근거':source.type==='historical'?'과거 자료':'외부 근거')+' ↗</a>' : '';
}
function reviewSortValue(venue, mode) {
  const r=venue.reviews;
  if(!r)return null;
  if(mode==='total')return Number.isFinite(r.visitor)&&Number.isFinite(r.blog)?r.visitor+r.blog:null;
  return r[mode];
}
function compareReviews(a,b,mode='visitor') {
  const x=reviewSortValue(a,mode),y=reviewSortValue(b,mode);
  if(Number.isFinite(x)!==Number.isFinite(y))return Number.isFinite(x)?-1:1;
  if(Number.isFinite(x)&&x!==y)return y-x;
  const secondary=mode==='blog'?'visitor':'blog';
  const sx=a.reviews?.[secondary],sy=b.reviews?.[secondary];
  if(Number.isFinite(sx)!==Number.isFinite(sy))return Number.isFinite(sx)?-1:1;
  if(Number.isFinite(sx)&&sx!==sy)return sy-sx;
  return a.name.localeCompare(b.name,'ko');
}
function reviewCount(value){return Number.isFinite(value)?value.toLocaleString('ko-KR')+'건':'미확인';}
function renderReviews(venue){
 const r=venue.reviews;
 if(!r)return '';
 return '<section class="venue-reviews" aria-label="'+escapeHtml(venue.name)+' 네이버 리뷰"><h4>네이버 리뷰</h4><div class="review-counts"><span>방문자 <strong>'+reviewCount(r.visitor)+'</strong></span><span>블로그 <strong>'+reviewCount(r.blog)+'</strong></span></div><p>'+escapeHtml(r.scope)+'</p>'+(r.note?'<p>'+escapeHtml(r.note)+'</p>':'')+'<a href="'+escapeHtml(r.sourceUrl)+'" target="_blank" rel="noopener noreferrer">네이버 집계 출처 ↗</a>'+(r.placeUrl?' · <a href="'+escapeHtml(r.placeUrl)+'" target="_blank" rel="noopener noreferrer">플레이스 리뷰 보기 ↗</a>':'')+'<p class="review-date">확인 '+escapeHtml(r.checkedAt)+' · 이후 수치는 달라질 수 있습니다.</p></section>';
}

function renderVenuePricing(venue) {
  const p=venue.pricing;if(!p)return '';
  const r=p.research,link=(url,label)=>`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>`;
  return `<section class="venue-pricing" id="price-${venue.id}" aria-label="${escapeHtml(venue.name)} 대관료와 식대"><h4>대관료 · 성인 식대</h4><dl class="price-summary">${infoRow('홀 대관료',escapeHtml(p.rentalSummary))}${infoRow('성인 1인',escapeHtml(p.mealSummary))}</dl><p class="price-period">${escapeHtml(p.summaryType)} · 확인 2026-11-22</p>${p.availabilityNote?`<p class="price-availability">${escapeHtml(p.availabilityNote)}</p>`:''}${p.comparisonNote?`<p class="price-comparison">${escapeHtml(p.comparisonNote)}</p>`:''}<details class="price-details"><summary>${p.records.length?`가격 근거 · 포함 항목 ${p.records.length}개 자료`:'가격 미확보 · 확인 내역'}</summary>${p.records.map(record=>`<article class="price-record"><h5>${escapeHtml(record.label)}</h5><p class="price-period">${escapeHtml(record.kind)}<br>${escapeHtml(record.period)}</p><dl>${infoRow('홀 대관료',escapeHtml(record.rental))}${infoRow('성인 식대',escapeHtml(record.adultMeal))}</dl><p>${escapeHtml(record.extras)}</p>${link(record.source,record.sourceLabel)}</article>`).join('')}<p class="price-period">2025년 9~11월: ${escapeHtml(p.historical['2025'])}<br>2026년 9~11월: ${escapeHtml(p.historical['2026'])}</p>${r?`<div class="source-audit"><h5>공식 사이트 · 검색 확인</h5><p>${escapeHtml(r.official.status)}${r.official.url?' · '+link(r.official.url,'공식 안내'):''}</p><p class="price-period">${escapeHtml(r.official.note)}</p><p>${link(r.generalSearch.url,'명칭별 구글 검색')} · ${link(r.blogSearch.url,'네이버 블로그 검색')}</p><p>${escapeHtml(r.blogSearch.status)}</p></div>`:''}</details>${r?.blogReferences.length?`<details class="blog-details"><summary>네이버 블로그 · 본문 확인 및 채택 여부</summary>${r.blogReferences.map(b=>`<article class="blog-reference"><p>${link(b.url,b.title)}</p><p class="price-period">작성 ${escapeHtml(b.publishedAt)} · ${escapeHtml(b.readLevel)}<br>${escapeHtml(b.priceUse)}</p><p>${escapeHtml(b.note)}</p><p class="price-period">${escapeHtml(b.independence)}</p></article>`).join('')}</details>`:`<p class="price-period">유효한 네이버 후기 미확보 · 가격 근거로 사용한 블로그 없음</p>`}</section>`;
}
function renderPricingOverview(filtered) {
  const element=document.querySelector('#pricing-overview');element.hidden=false;
  const region=regions.find(r=>r.id===selectedRegion),rows=filtered.filter(v=>v.pricing),count=rows.filter(v=>v.pricing.records.length).length;
  element.innerHTML=`<p class="heading-label">2027년 9~11월 예식 준비</p><h3>${escapeHtml(region.name)} 대관료 · 식대 비교</h3><p class="pricing-scope">${escapeHtml(venueCatalog.pricingScope.scopeNote)}</p><div class="price-coverage"><span>표시 후보 <strong>${rows.length}곳</strong></span><span>공개 가격 자료 <strong>${count}곳</strong></span><span>금액 미확보 <strong>${rows.length-count}곳</strong></span></div><p class="pricing-footnote">식장명을 누르면 홀별 가격·포함 항목·출처와 후기 확인 내역을 볼 수 있습니다. 검색·필터는 비교표와 목록에 함께 적용됩니다.</p><div class="table-scroll" role="region" aria-label="${escapeHtml(region.name)} 가격 비교표, 좁은 화면에서 좌우로 이동" tabindex="0"><table class="pricing-table"><thead><tr><th scope="col">예식장</th><th scope="col">홀 대관료</th><th scope="col">성인 1인 식대</th><th scope="col">방문자리뷰</th><th scope="col">블로그 리뷰</th><th scope="col">자료 구분·적용 범위</th></tr></thead><tbody>${rows.map(v=>`<tr><th scope="row"><a href="#price-${v.id}">${escapeHtml(v.name)}</a></th><td>${escapeHtml(v.pricing.rentalSummary)}</td><td>${escapeHtml(v.pricing.mealSummary)}</td><td class="review-number">${reviewCount(v.reviews?.visitor)}</td><td class="review-number">${reviewCount(v.reviews?.blog)}<small>${escapeHtml(v.reviews?.scope??'집계 미확인')}</small></td><td>${escapeHtml(v.pricing.summaryType)}</td></tr>`).join('')}</tbody></table>${rows.length?'':'<p>조건에 맞는 식장이 없습니다. 검색어나 필터를 변경해 주세요.</p>'}</div><p class="pricing-history">대관료만으로 총비용을 비교하지 마세요. 필수 꽃장식·연출비·촬영비, 음주류·VAT·봉사료와 보증인원을 함께 확인해야 합니다. 서로 다른 출처의 최저 금액을 합산하지 않았습니다.</p><p class="pricing-footnote">명칭별 개별 검색과 후보 블로그 본문 열람을 구분했습니다. 인터넷의 모든 후기 전수 열람이나 전화 견적 확인을 뜻하지 않습니다.</p><div class="report-links"><a href="PRICING_REPORT.md" target="_blank" rel="noopener">전체 지역 가격·출처 보고서</a><a href="pricing.csv" download>가격·미확보 내역 CSV</a></div>`;
  const table = element.querySelector('.pricing-table');
  table.querySelector('thead tr').insertAdjacentHTML('beforeend', '<th scope="col" class="choice-heading">선택</th>');
  table.querySelectorAll('tbody tr').forEach((row, index) => row.insertAdjacentHTML('beforeend', renderChoiceCell(rows[index])));
  element.querySelector('.price-coverage').insertAdjacentHTML('afterend', '<div class="choice-summary"><strong id="choice-status"></strong><span id="choice-message" role="status" aria-live="polite"></span></div>');
  updateChoiceStatus();
}

document.querySelector('#pricing-overview').addEventListener('change', event => {
  const input = event.target;
  if (!input.matches('input[data-choice-id]')) return;
  const id = input.dataset.choiceId;
  if (!venueIds.has(id) || !Object.hasOwn(choiceLabels, input.value)) return;
  const next = input.checked ? input.value : null;
  if (next && choices[id] !== next && choiceLimits[next] && choiceCounts()[next] >= choiceLimits[next]) {
    input.checked = false;
    updateChoiceStatus(`${choiceLabels[next]}는 ${choiceLimits[next]}곳까지만 선택할 수 있습니다.`);
    return;
  }
  if (next) choices[id] = next;
  else delete choices[id];
  try { localStorage.setItem(choiceStorageKey, JSON.stringify(choices)); } catch { /* 저장 공간이 없어도 현재 선택은 유지합니다. */ }
  input.closest('tr').querySelectorAll('input[data-choice-id]').forEach(box => { box.checked = choices[id] === box.value; });
  updateChoiceStatus();
});

function renderVenues() {
  const region = regions.find(item => item.id === selectedRegion);
  const all = venues.filter(venue => venue.region === selectedRegion);
  const query = searchElement.value.trim().toLocaleLowerCase("ko");
  const filtered = all.filter(venue => {
    const matchesText = `${venue.name} ${venue.address} ${venue.aliases.join(' ')}`.toLocaleLowerCase("ko").includes(query);
    return matchesText;
  });
  filtered.sort((a,b)=>compareReviews(a,b,reviewSortElement.value));
  document.querySelector('#review-sort-note').textContent=({visitor:'방문자리뷰 많은 순 · 동률은 블로그 리뷰순',blog:'블로그 리뷰 많은 순 · 동률은 방문자리뷰순',total:'방문자·블로그 합계순 · 두 건수가 모두 확인된 업체 기준'})[reviewSortElement.value]+' · 건수 미확인 업체는 뒤에 표시합니다. 확인 2026. 11. 22. 호텔·뷔페는 숙박·식음·돌잔치 등 전체 리뷰가 포함되며, 리뷰 수가 예식 품질을 뜻하지 않습니다.';
  renderPricingOverview(filtered);
  document.querySelector("#region-title").textContent = region.name;
  document.querySelector("#region-subtitle").textContent = `${region.area} · ${region.note}`;
  document.querySelector("#region-count").textContent = all.length;
  document.querySelector("#result-summary").textContent = `검색 결과 ${filtered.length}곳 / 조사 후보 ${all.length}곳 · 공식 안내 ${all.filter(v=>v.status==='official').length} · 외부 목록 ${all.filter(v=>v.status==='listed').length} · 운영 미확인 ${all.filter(v=>v.status==='pending').length} · 개장 예정 ${all.filter(v=>v.status==='planned').length}`;
  listElement.innerHTML = filtered.length ? filtered.map((venue, index) => {
    const phone = venue.phone ? `<a href="tel:${venue.phone.replace(/[^0-9+]/g, "")}">${escapeHtml(venue.phone)}</a>${venue.phoneLabel ? `<small class="field-note">${escapeHtml(venue.phoneLabel)}</small>` : ''}` : "전화번호 미확인";
    const website = venue.website ? `<a href="${escapeHtml(venue.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(new URL(venue.website).hostname.replace(/^www\./, ""))}</a>` : "공식 홈페이지 확인 필요";
    const links = [
      venue.phone ? `<a href="tel:${venue.phone.replace(/[^0-9+]/g, "")}">전화 문의</a>` : "",
      `<a href="${mapUrl(venue.address)}" target="_blank" rel="noopener noreferrer">지도 보기</a>`,
      venue.website ? `<a class="primary" href="${escapeHtml(venue.website)}" target="_blank" rel="noopener noreferrer">홈페이지</a>` : ""
    ].filter(Boolean).join("");
    return `<article class="venue-card" data-status="${venue.status}"><div class="card-head"><div><span class="card-type">${escapeHtml(venue.type)}</span> <span class="status-badge status-${venue.status}">${escapeHtml(statusLabels[venue.status])}</span><h3>${escapeHtml(venue.name)}</h3></div><span class="card-index">${String(index + 1).padStart(2,"0")}</span></div>${venue.photos.length ? `<button type="button" class="venue-cover" data-gallery="${venue.id}" aria-label="${escapeHtml(venue.name)} 사진 ${venue.photos.length}장 보기"><img src="${escapeHtml(venue.photos[0].localPath)}" alt="${escapeHtml(venue.name)} 공식 사이트 대표 이미지" loading="lazy" width="640" height="360"><span>사진 ${venue.photos.length}/5장 · 확대 보기 ↗</span></button>` : `<div class="photo-unavailable">공식 사이트 사진 미확보</div>`}<dl class="info-list">${infoRow("위치", escapeHtml(venue.address))}${infoRow("전화", phone + fieldSource(venue,"phone"), venue.phone ? "" : "unknown")}${infoRow("주차", escapeHtml(venue.parking) + fieldSource(venue,"parking"), venue.parkingKnown ? "" : "unknown")}${infoRow("홈페이지", website, venue.website ? "" : "unknown")}${infoRow("정보 출처", `<a href="${escapeHtml(venue.source)}" target="_blank" rel="noopener noreferrer">원문 확인</a>`)}</dl>${renderReviews(venue)}${renderVenuePricing(venue)}${venue.aliases.length ? `<p class="alias-note">관련·과거 표기: ${escapeHtml(venue.aliases.join(' · '))}</p>` : ''}${venue.note ? `<p class="venue-note">${escapeHtml(venue.note)}</p>` : ''}<p class="photo-note">${escapeHtml(venue.photoNote)}</p><div class="search-links">명칭 검색 <a href="${escapeHtml(venue.searchChecks.naver.url)}" target="_blank" rel="noopener noreferrer">네이버 ↗</a><a href="${escapeHtml(venue.searchChecks.google.url)}" target="_blank" rel="noopener noreferrer">구글 ↗</a></div><div class="card-actions">${links}</div></article>`;
  }).join("") : `<div class="empty-state"><strong>검색 결과가 없어요</strong>검색어 또는 주차 조건을 바꿔보세요.</div>`;
}

function selectRegion(id, focus = false) {
  if (!regions.some(region => region.id === id)) return;
  selectedRegion = id;
  searchElement.value = "";
  renderTabs();
  renderVenues();
  if (focus) document.querySelector(`#tab-${id}`).focus();
}

tabsElement.addEventListener("click", event => {
  const tab = event.target.closest("[data-region]");
  if (tab) selectRegion(tab.dataset.region);
});
tabsElement.addEventListener("keydown", event => {
  if (!["ArrowRight","ArrowLeft","ArrowDown","ArrowUp","Home","End"].includes(event.key)) return;
  event.preventDefault();
  const current = regions.findIndex(region => region.id === selectedRegion);
  const next = event.key === "Home" ? 0 : event.key === "End" ? regions.length - 1 : (current + (["ArrowRight","ArrowDown"].includes(event.key) ? 1 : -1) + regions.length) % regions.length;
  selectRegion(regions[next].id, true);
});
searchElement.addEventListener("input", renderVenues);
reviewSortElement.addEventListener("change",renderVenues);

const excludedSearchElement=document.querySelector('#excluded-search');
function renderExcluded(){
 const query=excludedSearchElement.value.trim().toLocaleLowerCase('ko').replace(/\s+/g,'');
 const matches=excluded.filter(item=>(item.name+' '+item.address+' '+item.reason).toLocaleLowerCase('ko').replace(/\s+/g,'').includes(query));
 document.querySelector('#excluded-result-summary').textContent='검색 결과 '+matches.length+'곳 / 제외된 예식장 '+excluded.length+'곳';
 document.querySelector('#excluded-list').innerHTML=matches.length?matches.map(item=>'<article class="excluded-item"><h2>'+escapeHtml(item.name)+'</h2><p>'+escapeHtml(item.address)+'</p><p class="reason">'+escapeHtml(item.reason)+'</p></article>').join(''):'<p class="empty-state">검색 결과가 없습니다. 다른 이름이나 위치로 검색해 주세요.</p>';
}
excludedSearchElement.addEventListener('input',renderExcluded);
renderExcluded();

function renderView() {
  const view = location.hash === "#excluded" ? 'excluded' : location.hash === '#survey' ? 'survey' : 'venues';
  ['venues','excluded','survey'].forEach(id => document.querySelector(`#${id}-view`).hidden = id !== view);
  document.querySelectorAll("[data-view-link]").forEach(link => {
    if (link.dataset.viewLink === view) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (view !== 'venues') window.scrollTo(0, 0);
}

const countStatus = status => venues.filter(v=>v.status===status).length;
document.querySelector('#survey-total').textContent = `${regions.length}개 지역 · 조사 후보 ${venues.length}곳 · 제외 ${excluded.length}곳`;
document.querySelector('#survey-metrics').innerHTML = Object.entries(statusLabels).map(([status,label])=>`<div><strong>${countStatus(status)}</strong><span>${escapeHtml(label)}</span></div>`).join('');
document.querySelector('#survey-region-rows').innerHTML = regions.map(r=>`<tr><th scope="row"><a href="#venues" data-survey-region="${r.id}">${escapeHtml(r.name)}</a></th><td>${venues.filter(v=>v.region===r.id).length}</td>${Object.keys(statusLabels).map(s=>`<td>${venues.filter(v=>v.region===r.id&&v.status===s).length}</td>`).join('')}</tr>`).join('');
document.querySelector('#survey-region-rows').addEventListener('click',event=>{const link=event.target.closest('[data-survey-region]');if(link)selectRegion(link.dataset.surveyRegion);});
document.querySelector('#survey-other-records').innerHTML = venueCatalog.nonVenues.map(v=>`<p><strong>${escapeHtml(v.name)}</strong> · ${escapeHtml(v.address)}<br>${escapeHtml(v.reason)} <a href="${escapeHtml(v.source)}" target="_blank" rel="noopener noreferrer">근거</a></p>`).join('');

window.addEventListener("hashchange", renderView);
renderTabs();
renderVenues();
renderView();


// Gallery uses the venue's verified local originals and keeps per-photo sources.
const photoDialog = document.querySelector('#photo-dialog');
const photoImage = document.querySelector('#photo-image');
let galleryVenue = null, galleryIndex = 0;
function showPhoto(index) {
  const photos = galleryVenue.photos;
  galleryIndex = (index + photos.length) % photos.length;
  const photo = photos[galleryIndex];
  document.querySelector('#photo-error').hidden = true;
  photoImage.hidden = false;
  photoImage.src = photo.localPath;
  photoImage.alt = `${galleryVenue.name} 공식 사진 ${galleryIndex + 1}`;
  document.querySelector('#photo-counter').textContent = `${galleryIndex + 1} / ${photos.length}`;
  document.querySelector('#photo-source').href = photo.sourcePage;
  document.querySelector('#photo-original').href = photo.imageUrl;
  document.querySelector('#photo-prev').disabled = photos.length < 2;
  document.querySelector('#photo-next').disabled = photos.length < 2;
  const thumbs=document.querySelector('#photo-thumbs');
  if(thumbs.dataset.venue!==galleryVenue.id){thumbs.innerHTML=photos.map((p,i)=>`<button type="button" data-photo="${i}" aria-label="${i+1}번 사진"><img src="${escapeHtml(p.localPath)}" alt="" width="100" height="65"></button>`).join('');thumbs.dataset.venue=galleryVenue.id;}
  thumbs.querySelectorAll('[data-photo]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.photo)===galleryIndex)));
}
listElement.addEventListener('click',event=>{
  const button=event.target.closest('[data-gallery]');
  if(!button)return;
  galleryVenue=venues.find(v=>v.id===button.dataset.gallery);
  if(!galleryVenue?.photos.length)return;
  document.querySelector('#photo-title').textContent=galleryVenue.name;
  document.querySelector('#photo-description').textContent=galleryVenue.photoNote;
  showPhoto(0);photoDialog.showModal();document.body.classList.add('gallery-open');
});
document.querySelector('#photo-close').addEventListener('click',()=>photoDialog.close());
document.querySelector('#photo-prev').addEventListener('click',()=>showPhoto(galleryIndex-1));
document.querySelector('#photo-next').addEventListener('click',()=>showPhoto(galleryIndex+1));
document.querySelector('#photo-thumbs').addEventListener('click',event=>{const button=event.target.closest('[data-photo]');if(button)showPhoto(Number(button.dataset.photo));});
photoDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showPhoto(galleryIndex+(event.key==='ArrowLeft'?-1:1));}});
photoDialog.addEventListener('click',event=>{if(event.target===photoDialog){const box=photoDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)photoDialog.close();}});
photoDialog.addEventListener('close',()=>document.body.classList.remove('gallery-open'));
photoImage.addEventListener('error',()=>{photoImage.hidden=true;document.querySelector('#photo-error').hidden=false;});
const enrichment=venueCatalog.enrichment;
document.querySelector('#enrichment-summary').textContent=`명칭별 검색: 네이버 ${enrichment.naverResults}/${venues.length} · 구글 ${enrichment.googleResults}/${venues.length} | 사진 ${enrichment.photos}장 · 5장 확보 ${enrichment.completeGalleries}곳 · 일부 확보 ${enrichment.partialGalleries}곳 · 미확보 ${enrichment.missingGalleries}곳`;
