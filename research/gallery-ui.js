
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
