import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const c=JSON.parse(fs.readFileSync('catalog.json','utf8')),data=JSON.parse(fs.readFileSync('research/review-counts.json','utf8'));
assert.deepEqual(Object.keys(data.venues).sort(),c.venues.map(v=>v.id).sort());
const ids=new Set();for(const v of c.venues){const r=v.reviews;assert.deepEqual(r,data.venues[v.id]);for(const n of [r.visitor,r.blog])assert(n===null||(Number.isInteger(n)&&n>=0));if(r.status==='matched'){assert(r.placeId&&r.placeAddress&&r.sourceUrl);assert(!ids.has(r.placeId));ids.add(r.placeId);assert(r.placeAddress.includes(c.regions.find(x=>x.id===v.region).name));}else{assert.equal(r.visitor,null);assert.equal(r.blog,null);}if(/호텔|리조트/.test(r.category??''))assert(r.scope.includes('전체'));}
for(const id of ['venue-006'])assert.equal(data.venues[id].status,'unconfirmed');
assert.notEqual(data.venues['venue-018'].placeId,data.venues['venue-019'].placeId);
const s=fs.readFileSync('script.js','utf8'),code=s.slice(s.indexOf('function reviewSortValue'),s.indexOf('function reviewCount('));const ctx={};vm.createContext(ctx);vm.runInContext(code,ctx);
const venue=(name,visitor,blog)=>({name,reviews:{visitor,blog}});
const examples=[venue('unknown',null,5000),venue('zero',0,0),venue('tie-low',20,10),venue('tie-high',20,30),venue('higher',21,0)];
assert.deepEqual(examples.sort((a,b)=>ctx.compareReviews(a,b)).map(v=>v.name),['higher','tie-high','tie-low','zero','unknown']);
assert.equal(ctx.reviewSortValue(venue('partial',3,null),'total'),null);
for(const r of c.regions){const sorted=c.venues.filter(v=>v.region===r.id).sort((a,b)=>ctx.compareReviews(a,b));for(let i=1;i<sorted.length;i++)assert(ctx.compareReviews(sorted[i-1],sorted[i])<=0);}
console.log(JSON.stringify({pass:true,searched:c.venues.length,matched:ids.size,visitorCounts:c.venues.filter(v=>Number.isFinite(v.reviews.visitor)).length,blogCounts:c.venues.filter(v=>Number.isFinite(v.reviews.blog)).length,tieAndUnknownChecks:'passed'}));
