import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const config=JSON.parse(fs.readFileSync('deployment.json'));
const base=config.url;
const get=async file=>{const response=await fetch(new URL(file,base),{signal:AbortSignal.timeout(30000)});assert.equal(response.status,200,file);return response;};
const home=await get('');assert((await home.text()).includes('우당탕탕 결혼식 대작전'));
const data=await (await get('catalog.json')).json();
assert.deepEqual(data,JSON.parse(fs.readFileSync('catalog.json','utf8')));
const photos=data.venues.flatMap(v=>v.photos);
const files=['styles.css','gallery.css','pricing.css','theme.css','chick.svg','script.js','catalog.js','catalog.csv','SURVEY_REPORT.md','ENRICHMENT_REPORT.md',...photos.map(p=>p.localPath)];
let index=0;const checks=[];
await Promise.all(Array.from({length:8},async()=>{while(index<files.length){const file=files[index++];try{const response=await fetch(new URL(file,base),{method:'HEAD',signal:AbortSignal.timeout(30000)});checks.push({file,status:response.status,type:response.headers.get('content-type')});}catch(error){checks.push({file,status:0,error:error.message});}}}));
const failed=checks.filter(c=>c.status!==200);assert.equal(failed.length,0,JSON.stringify(failed));
const sample=[photos[0],data.venues.find(v=>v.id==='venue-014').photos[0],photos.at(-1)];
for(const photo of sample){const bytes=Buffer.from(await (await get(photo.localPath)).arrayBuffer());assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),photo.sha256,'Published original '+photo.localPath);}
const result={pass:true,checkedAt:new Date().toISOString(),url:base,homeStatus:200,catalogMatchesLocal:true,venues:data.venues.length,excluded:data.excluded.length,photoFiles:photos.length,checkedFiles:checks.length,failedFiles:failed.length,originalHashSamples:sample.length,browserRender:'Not rechecked on public URL: native browser control stopped because current URL could not be verified. Local desktop/mobile checks are in enrichment-browser-verification.json.',files:checks};
fs.writeFileSync('research/deployment-verification.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,files:undefined},null,2));
