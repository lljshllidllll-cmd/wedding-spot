import fs from 'node:fs';
const catalog=JSON.parse(fs.readFileSync('catalog.json'));
const ids=['007','009','010','013','015','031','034','041','042','043','046','049','053','054','059','063','064','097'].map(n=>'venue-'+n).filter(id=>catalog.venues.find(v=>v.id===id).photos.length<5);
const path='research/enrichment/photo-rejections.json',rejections=JSON.parse(fs.readFileSync(path)),approved=JSON.parse(fs.readFileSync('research/enrichment/reviewed-photos.json'));
for(const id of ids){const r=JSON.parse(fs.readFileSync('research/enrichment/'+id+'-photos.json'));const valid=new Set(approved[id].map(p=>p.imageUrl));rejections[id]=[...new Set([...(rejections[id]??[]),...r.photos.filter(p=>!valid.has(p.imageUrl)).map(p=>p.imageUrl)])];}
fs.writeFileSync(path,JSON.stringify(rejections,null,2));console.log(ids.join(','));
