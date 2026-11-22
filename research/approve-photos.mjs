import fs from 'node:fs';
// Indices refer to the contact sheets reviewed on 2026-11-22. Keep the exact
// original URL/hash so later downloads cannot silently change an approval.
const keep={ '007':[1,2,3],'009':[2,3,4,5],'010':[1],'013':[1,2,5],'015':[1,2,3],'027':[1,2,3,4],'031':[3,4,5],'032':[1],'034':[3,4,5],'039':[2,5],'040':[],'041':[2,3],'042':[1,2,3,5],'043':[1],'046':[1,2,3,4],'049':[1,3,4,5],'053':[1,2,5],'054':[2,3,4],'059':[1,2],'060':[1],'062':[],'063':[3,4,5],'064':[4,5],'091':[],'092':[],'097':[1] };
for(const id of ['032','091','092'])delete keep[id]; // Newly reviewed, venue-specific galleries.
for(const id of ['009','015','031','034','042','046','053','054','059'])delete keep[id];
Object.assign(keep,{'007':[1,2,3,4],'010':[1,4,5],'013':[1,2,3,4],'041':[1,2],'043':[3,4,5],'049':[1,2,3,4],'063':[1,2,3,4],'064':[1,2,3,4]});
for(const id of ['007','010','063','064'])delete keep[id];
keep['043']=[1,2,3,4];
const approved={};
for(const file of fs.readdirSync('research/enrichment').filter(f=>/^venue-\d+-photos.json$/.test(f))){const r=JSON.parse(fs.readFileSync('research/enrichment/'+file));const indices=keep[r.id.slice(-3)];approved[r.id]=r.photos.filter((p,i)=>indices===undefined||indices.includes(i+1)).map(p=>({...p,reviewStatus:'visually-reviewed',reviewedAt:'2026-11-22'}));}
fs.writeFileSync('research/enrichment/reviewed-photos.json',JSON.stringify(approved,null,2));
console.log('Reviewed galleries:',Object.values(approved).filter(p=>p.length).length,'photos:',Object.values(approved).reduce((n,p)=>n+p.length,0));
