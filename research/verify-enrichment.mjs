import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const c=JSON.parse(fs.readFileSync('catalog.json'));
let photos=0;
for(const v of c.venues){
 const record=JSON.parse(fs.readFileSync(`research/enrichment/${v.id}-browser-search.json`));
 for(const engine of ['naver','google']){assert.equal(v.searchChecks[engine].status,'results',v.id+' '+engine);assert(record.engines[engine].text.length>100);assert(new URL(v.searchChecks[engine].url).hostname.includes(engine));}
 assert(v.photos.length<=5);assert.equal(new Set(v.photos.map(p=>p.sha256)).size,v.photos.length,'重複 '+v.id);
 for(const p of v.photos){assert.equal(p.reviewStatus,'visually-reviewed');assert(p.sourcePage&&p.imageUrl);assert(p.localPath.startsWith('public/photos/'+v.id+'-'));const bytes=fs.readFileSync(p.localPath);assert.equal(bytes.length,p.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),p.sha256,v.id+' 原本');assert(p.width>=220&&p.height>=220);photos++;}
 for(const s of Object.values(v.fieldSources??{}))assert(['http:','https:'].includes(new URL(s.url).protocol));
}
assert.equal(photos,c.enrichment.photos);assert.equal(c.enrichment.completeGalleries+c.enrichment.partialGalleries+c.enrichment.missingGalleries,c.venues.length);
for(const id of ['venue-091','venue-092'])assert.equal(c.venues.find(v=>v.id===id).photos.length,5);
assert(!c.venues.find(v=>v.id==='venue-091').photos.some(p=>c.venues.find(v=>v.id==='venue-092').photos.some(q=>q.sha256===p.sha256)));
const result={pass:true,checkedAt:c.checkedAt,searches:{naver:c.venues.length,google:c.venues.length},...c.enrichment};fs.writeFileSync('research/enrichment-verification.json',JSON.stringify(result,null,2));console.log(result);
