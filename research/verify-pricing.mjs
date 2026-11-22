import fs from 'node:fs';
import assert from 'node:assert/strict';
const c=JSON.parse(fs.readFileSync('catalog.json','utf8'));
const priced=c.venues.filter(v=>v.pricing);
assert.equal(priced.length,4);assert(priced.every(v=>v.region==='ilsan-west'));
assert.equal(c.pricingScope.planning.year,2027);assert.deepEqual(c.pricingScope.requestedHistory.years,[2025,2026]);
const source=JSON.parse(fs.readFileSync('research/pricing/kintex-official-rows.json','utf8').replace(/^\ufeff/,''));
for(const [id,row,production] of [['venue-002','A5:','3,300,000원~5,500,000원'],['venue-017','A7:','2,860,000원']]){
 const raw=source.rows.find(s=>s.startsWith(row));assert(raw.includes('77,000~150,000원'));assert(raw.includes(production));
 const primary=priced.find(v=>v.id===id).pricing.records[0];assert.equal(primary.rentalKRW,null);assert.deepEqual(primary.adultMealKRW,[77000,150000]);assert.equal(new URL(primary.source).hostname,'www.price.go.kr');
}
assert.deepEqual(priced.find(v=>v.id==='venue-001').pricing.records[0].adultMealKRW,[58000,68000]);
for(const v of priced)for(const p of v.pricing.records){assert(p.period&&p.extras&&p.source);assert(!p.rentalKRW||p.rentalKRW.every(Number.isFinite));assert(p.adultMealKRW.every(Number.isFinite));assert(p.adultMealKRW[0]>25000);}
assert(priced.find(v=>v.id==='venue-018').pricing.availabilityNote.includes('2027년 10월'));
console.log(JSON.stringify({pass:true,venues:4,referenceRecords:priced.reduce((n,v)=>n+v.pricing.records.length,0),sourceSpreadsheetAmounts:'matched',seasonSpecificQuotes:0}));
