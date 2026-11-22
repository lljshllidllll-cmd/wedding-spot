import fs from 'node:fs';
export function mergeEnrichment(catalog){
 const folder='research/enrichment/';if(!fs.existsSync(folder))return;
 const scope=JSON.parse(fs.readFileSync('research/catalog-scope.json','utf8'));
 const read=(file,fallback)=>fs.existsSync(folder+file)?JSON.parse(fs.readFileSync(folder+file,'utf8').replace(/^\ufeff/,'')):fallback;
 const updates=read('venue-updates.json',{}),overrides=read('official-overrides.json',{}),reviewed=read('reviewed-photos.json',{}),changes=[];
 for(const v of catalog.venues){const before={phone:v.phone,parking:v.parking,website:v.website};const update=updates[v.id];if(update)Object.assign(v,update);
  const official=read(v.id+'-official.json',null);if(overrides[v.id]?.website&&official?.pages.length){v.website=overrides[v.id].website;v.fieldSources={...v.fieldSources,website:{url:v.website,type:'official',checkedAt:catalog.checkedAt}};}
  const search=read(v.id+'-browser-search.json',null);v.searchChecks=Object.fromEntries(['naver','google'].map(engine=>{const result=search?.engines[engine];const status=result?.status==='loading-or-empty'&&/웹 검색결과|검색 결과/.test(result.text??'')?'results':result?.status??'not-searched';return[engine,{query:search?.query??v.name,url:result?.url??(engine==='naver'?'https://search.naver.com/search.naver?query=':'https://www.google.com/search?q=')+encodeURIComponent(v.name),status,checkedAt:catalog.checkedAt}];}));
  v.photos=(reviewed[v.id]??[]).filter(p=>!scope.excludedPhotos?.includes(p.localPath));v.photoStatus=v.photos.length===5?'complete':v.photos.length?'partial':'missing';v.photoNote=v.photos.length?`공식 사이트 공개 이미지 ${v.photos.length}/5장 · 촬영일 미공개${v.status==='planned'?' · 개장 예정 공간의 홍보 이미지 포함':''}`:v.indoorOnly?'실내 예식 상품의 공식 사진 미확보':'해당 장소의 공식 사이트 사진 미확보';
  for(const field of ['phone','parking','website'])if(before[field]!==v[field])changes.push({id:v.id,name:v.name,field,before:before[field],after:v[field],source:v.fieldSources?.[field]??null});
 }
 catalog.enrichment={checkedAt:catalog.checkedAt,total:catalog.venues.length,naverResults:catalog.venues.filter(v=>v.searchChecks.naver.status==='results').length,googleResults:catalog.venues.filter(v=>v.searchChecks.google.status==='results').length,photos:catalog.venues.reduce((n,v)=>n+v.photos.length,0),completeGalleries:catalog.venues.filter(v=>v.photos.length===5).length,partialGalleries:catalog.venues.filter(v=>v.photos.length>0&&v.photos.length<5).length,missingGalleries:catalog.venues.filter(v=>!v.photos.length).length,missingPhone:catalog.venues.filter(v=>!v.phone).length,missingParking:catalog.venues.filter(v=>!v.parkingKnown).length,missingWebsite:catalog.venues.filter(v=>!v.website).length,changes:changes.length};
 fs.writeFileSync(folder+'change-log.json',JSON.stringify(changes,null,2));
}
