import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const c=read('catalog.json'),scope=read('research/catalog-scope.json');
assert.equal(c.regions.length,7);assert.equal(c.venues.length,37);assert(c.venues.every(v=>v.pricing));
assert.equal(c.pricingScope.planning.year,2027);assert.deepEqual(c.pricingScope.requestedHistory.years,[2025,2026]);
const get=n=>c.venues.find(v=>v.id==='venue-'+String(n).padStart(3,'0')).pricing;
const source=read('research/pricing/kintex-official-rows.json');
for(const [row,production] of [['A5:','3,300,000원~5,500,000원'],['A7:','2,860,000원']]){const raw=source.rows.find(s=>s.startsWith(row));assert(raw.includes('77,000~150,000원'));assert(raw.includes(production));}
for(const v of c.venues){const p=v.pricing,r=p.research;assert(r.generalSearch.status.includes('완료'));assert(r.blogSearch.query.includes(v.name));assert(r.checkedAt==='2026-11-22');assert(p.historical['2025']&&p.historical['2026']);assert(p.rentalSummary&&p.mealSummary);for(const s of p.records){assert(s.period&&s.extras&&s.source);for(const amounts of [s.rentalKRW,s.adultMealKRW])if(amounts){assert(amounts.length===2);assert(amounts.every(Number.isFinite));assert(amounts[0]>=0&&amounts[1]>=amounts[0]);}if(s.adultMealKRW)assert(s.adultMealKRW[0]>25000);assert(['http:','https:'].includes(new URL(s.source).protocol));}if(!p.records.length){assert(!/무료|0원/.test(p.rentalSummary));}if(v.indoorOnly)assert(p.records.every(s=>!/야외|루프탑|벨타워가든|스퀘어가든/.test(s.label)));}
const rawRows=read('research/pricing/disclosures/rows.json');
const sheet=(id,sheetIndex=0)=>rawRows.find(v=>v.file==='venue-'+String(id).padStart(3,'0')+'.xlsx').sheets[sheetIndex].rows.join('\n');
assert(sheet(9).includes('27년 7월~12월'));assert(sheet(9).includes('69,000원~91,000원'));assert(sheet(50).includes('27년 하반기'));assert(get(50).records.some(r=>r.period.includes('하반기')&&r.extras.includes('600만원')));
assert(sheet(32).includes('8,800원'));
assert(!c.venues.some(v=>['venue-004','venue-073'].includes(v.id)));
for(const id of ['venue-049','venue-058','venue-059','venue-063','venue-064','venue-096','venue-097'])assert(!c.venues.some(v=>v.id===id));
assert(!c.venues.some(v=>['venue-067','venue-068'].includes(v.id)));
for(const id of ['venue-012','venue-045','venue-062','venue-066'])assert(!c.venues.some(v=>v.id===id));
assert(c.excluded.some(v=>v.name==='베뉴비안'&&v.reason.includes('문화원')));
assert(get(18).availabilityNote.includes('2027년 10월'));
assert.deepEqual(get(1).records[0].adultMealKRW,[58000,68000]);
assert.deepEqual(c.venues.filter(v=>v.region==='ilsan-west').map(v=>v.id),['venue-001','venue-018']);
for(const id of Object.keys(scope.excludedVenues))assert(!c.venues.some(v=>v.id===id));
for(const file of ['index.html','catalog.csv','pricing.csv','PRICING_REPORT.md','SURVEY_REPORT.md','ENRICHMENT_REPORT.md'])assert(!/은평|eunpyeong|서대문|seodaemun/.test(fs.readFileSync(file,'utf8')),file+' removed area absent');
for(const collection of [c.regions,c.venues,c.excluded,c.nonVenues])assert(!collection.some(v=>v.id==='seodaemun'||v.region==='seodaemun'),'removed area absent from catalog');
console.log(JSON.stringify({pass:true,regions:c.regions.length,venues:c.venues.length,priced:c.venues.filter(v=>v.pricing.records.length).length,records:c.venues.reduce((n,v)=>n+v.pricing.records.length,0),blogBodies:c.venues.filter(v=>v.pricing.research.blogReferences.length).length,exclusionChecks:'passed',sourceSpreadsheetChecks:'matched'}));
