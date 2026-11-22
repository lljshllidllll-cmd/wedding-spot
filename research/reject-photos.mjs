import fs from 'node:fs';
const file='research/enrichment/photo-rejections.json';
const data=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
const rules=JSON.parse(process.argv[2]);
for(const [id,indexes] of Object.entries(rules)){const p='research/enrichment/'+id+'-photos.json';const rows=JSON.parse(fs.readFileSync(p,'utf8')).photos;data[id]=[...new Set([...(data[id]??[]),...indexes.map(i=>rows[i-1]?.imageUrl).filter(Boolean)])];}
fs.writeFileSync(file,JSON.stringify(data,null,2));
