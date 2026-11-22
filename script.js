const { regions, venues, excluded, statusLabels } = venueCatalog;

const tabsElement = document.querySelector("#region-tabs");
const listElement = document.querySelector("#venue-list");
const searchElement = document.querySelector("#search");
const statusElement = document.querySelector("#status-filter");
const photoFilter = document.querySelector('#photo-filter');
let selectedRegion = regions[0].id;

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
function renderVenuePricing(venue) {
  const pricing=venue.pricing;if(!pricing)return '';
  return `<section class="venue-pricing" id="price-${venue.id}" aria-label="${escapeHtml(venue.name)} 대관료와 식대"><h4>대관료 · 성인 식대</h4><p class="price-period">2025·2026년 9~11월 적용 견적 ${venue.status==='planned'?'비교 대상 아님':'미확보'}</p>${pricing.availabilityNote?`<p class="price-availability">${escapeHtml(pricing.availabilityNote)}</p>`:''}<details><summary>공개 참고 가격 · 출처별 ${pricing.records.length}개 자료 보기</summary>${pricing.records.map(record=>`<article class="price-record"><h5>${escapeHtml(record.label)}</h5><p class="price-period">${escapeHtml(record.kind)}<br>${escapeHtml(record.period)}</p><dl>${infoRow('홀 대관료',escapeHtml(record.rental))}${infoRow('성인 식대',escapeHtml(record.adultMeal))}</dl><p>${escapeHtml(record.extras)}</p><a href="${escapeHtml(record.source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(record.sourceLabel)}</a></article>`).join('')}</details></section>`;
}
function renderPricingOverview() {
  const element=document.querySelector('#pricing-overview');
  element.hidden=selectedRegion!=='ilsan-west';
  if(element.hidden)return;
  const priced=venues.filter(v=>v.region==='ilsan-west'&&v.pricing);
  element.innerHTML=`<p class="heading-label">2027년 9~11월 예식 준비</p><h3>일산서구 대관료 · 식대 참고</h3><p class="pricing-scope">${escapeHtml(venueCatalog.pricingScope.scopeNote)}</p><div class="table-scroll"><table class="pricing-table"><thead><tr><th scope="col">예식장</th><th scope="col">홀 대관료</th><th scope="col">성인 1인 식대</th><th scope="col">자료 구분</th></tr></thead><tbody>${priced.map(v=>`<tr><th scope="row"><a href="#price-${v.id}">${escapeHtml(v.name)}</a></th><td>${escapeHtml(v.pricing.rentalSummary)}${v.pricing.records[1]?.kind==='중개업체 정가'?`<small>중개 정가 참고: ${escapeHtml(v.pricing.records[1].rental)}</small>`:''}</td><td>${escapeHtml(v.pricing.mealSummary)}</td><td>${escapeHtml(v.pricing.summaryType)}</td></tr>`).join('')}</tbody></table></div><p class="pricing-footnote">킨텍스 두 홀의 공시 식대와 중개 정가 대관료는 서로 다른 자료입니다. 같은 조건의 견적으로 합산하지 마세요. 시설명을 누르면 홀별 포함 항목과 출처를 볼 수 있습니다.</p><p class="pricing-history">2025년 9~11월: 날짜별 견적 미확보 · 2026년 9~11월: 날짜별 견적 미확보<br>베뉴지1995: 2027년 10월 오픈 예정 상품. 2025~2026년 실제 예식 가격 비교 대상 아님.</p><div class="report-links"><a href="PRICING_REPORT.md" target="_blank" rel="noopener">가격 조사·출처 보고서</a><a href="pricing.csv" download>가격 참고 자료 CSV</a></div>`;
}

function renderVenues() {
  renderPricingOverview();
  const region = regions.find(item => item.id === selectedRegion);
  const all = venues.filter(venue => venue.region === selectedRegion);
  const query = searchElement.value.trim().toLocaleLowerCase("ko");
  const filtered = all.filter(venue => {
    const matchesText = `${venue.name} ${venue.address} ${venue.aliases.join(' ')}`.toLocaleLowerCase("ko").includes(query);
    const matchesStatus = statusElement.value === 'all' || venue.status === statusElement.value;
    return matchesText && matchesStatus && (!photoFilter.checked || venue.photos.length > 0);
  });
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
    return `<article class="venue-card" data-status="${venue.status}"><div class="card-head"><div><span class="card-type">${escapeHtml(venue.type)}</span> <span class="status-badge status-${venue.status}">${escapeHtml(statusLabels[venue.status])}</span><h3>${escapeHtml(venue.name)}</h3></div><span class="card-index">${String(index + 1).padStart(2,"0")}</span></div>${venue.photos.length ? `<button type="button" class="venue-cover" data-gallery="${venue.id}" aria-label="${escapeHtml(venue.name)} 사진 ${venue.photos.length}장 보기"><img src="${escapeHtml(venue.photos[0].localPath)}" alt="${escapeHtml(venue.name)} 공식 사이트 대표 이미지" loading="lazy" width="640" height="360"><span>사진 ${venue.photos.length}/5장 · 확대 보기 ↗</span></button>` : `<div class="photo-unavailable">공식 사이트 사진 미확보</div>`}<dl class="info-list">${infoRow("위치", escapeHtml(venue.address))}${infoRow("전화", phone + fieldSource(venue,"phone"), venue.phone ? "" : "unknown")}${infoRow("주차", escapeHtml(venue.parking) + fieldSource(venue,"parking"), venue.parkingKnown ? "" : "unknown")}${infoRow("홈페이지", website, venue.website ? "" : "unknown")}${infoRow("정보 출처", `<a href="${escapeHtml(venue.source)}" target="_blank" rel="noopener noreferrer">원문 확인</a>`)}</dl>${renderVenuePricing(venue)}${venue.aliases.length ? `<p class="alias-note">관련·과거 표기: ${escapeHtml(venue.aliases.join(' · '))}</p>` : ''}${venue.note ? `<p class="venue-note">${escapeHtml(venue.note)}</p>` : ''}<p class="photo-note">${escapeHtml(venue.photoNote)}</p><div class="search-links">명칭 검색 <a href="${escapeHtml(venue.searchChecks.naver.url)}" target="_blank" rel="noopener noreferrer">네이버 ↗</a><a href="${escapeHtml(venue.searchChecks.google.url)}" target="_blank" rel="noopener noreferrer">구글 ↗</a></div><div class="card-actions">${links}</div></article>`;
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
statusElement.addEventListener("change", renderVenues);

document.querySelector("#excluded-list").innerHTML = excluded.map(item => `<article class="excluded-item"><h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.address)}</p><p class="reason">${escapeHtml(item.reason)}</p></article>`).join("");

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
document.querySelector('#survey-total').textContent = `9개 지역 · 조사 후보 ${venues.length}곳 · 제외 ${excluded.length}곳`;
document.querySelector('#survey-metrics').innerHTML = Object.entries(statusLabels).map(([status,label])=>`<div><strong>${countStatus(status)}</strong><span>${escapeHtml(label)}</span></div>`).join('');
document.querySelector('#survey-region-rows').innerHTML = regions.map(r=>`<tr><th scope="row"><a href="#venues" data-survey-region="${r.id}">${escapeHtml(r.name)}</a></th><td>${venues.filter(v=>v.region===r.id).length}</td>${Object.keys(statusLabels).map(s=>`<td>${venues.filter(v=>v.region===r.id&&v.status===s).length}</td>`).join('')}</tr>`).join('');
document.querySelector('#survey-region-rows').addEventListener('click',event=>{const link=event.target.closest('[data-survey-region]');if(link){statusElement.value='all';selectRegion(link.dataset.surveyRegion);}});
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
photoFilter.addEventListener('change',renderVenues);
const enrichment=venueCatalog.enrichment;
document.querySelector('#enrichment-summary').textContent=`명칭별 검색: 네이버 ${enrichment.naverResults}/${venues.length} · 구글 ${enrichment.googleResults}/${venues.length} | 사진 ${enrichment.photos}장 · 5장 확보 ${enrichment.completeGalleries}곳 · 일부 확보 ${enrichment.partialGalleries}곳 · 미확보 ${enrichment.missingGalleries}곳`;
