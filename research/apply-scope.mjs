import fs from 'node:fs';
export function applyScope(catalog){
 const scope=JSON.parse(fs.readFileSync('research/catalog-scope.json','utf8'));
 const keep=v=>!scope.removedRegions.includes(v.region);
 catalog.regions=catalog.regions.filter(keepRegion=>!scope.removedRegions.includes(keepRegion.id));
 catalog.venues=catalog.venues.filter(keep);
 catalog.excluded=catalog.excluded.filter(keep);
 catalog.nonVenues=catalog.nonVenues.filter(keep);
 for(const v of catalog.venues.filter(v=>scope.excludedVenues[v.id]))catalog.excluded.push({region:v.region,name:v.name,address:v.address,reason:scope.excludedVenues[v.id]});
 catalog.venues=catalog.venues.filter(v=>!scope.excludedVenues[v.id]);
 for(const v of catalog.venues)if(scope.indoorOnlyVenues.includes(v.id)){v.indoorOnly=true;v.note+=' 비교 대상은 실내 예식 상품만 포함합니다.';}
 catalog.publicDirectory.inScope=catalog.venues.filter(v=>v.type==='공공 예식'&&v.website?.includes('wedding.seoulwomen.or.kr')).length;
 catalog.scope={regions:catalog.regions.length,indoorOnlyVenues:scope.indoorOnlyVenues};
}
