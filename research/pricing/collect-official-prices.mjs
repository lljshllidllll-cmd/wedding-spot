import fs from 'node:fs';
const c=JSON.parse(fs.readFileSync('catalog.json','utf8'));
const output='research/local-only/official-pricing';fs.mkdirSync(output,{recursive:true});
const strip=s=>s.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
let index=0;await Promise.all(Array.from({length:7},async()=>{while(index<c.venues.length){const v=c.venues[index++],file=output+'/'+v.id+'.json';if(fs.existsSync(file))continue;
 const r={id:v.id,name:v.name,checkedAt:'2026-11-22',website:v.website,pages:[],errors:[]};
 if(v.website){let urls=[v.website];const prior='research/enrichment/'+v.id+'-official.json';if(fs.existsSync(prior)){const pages=JSON.parse(fs.readFileSync(prior,'utf8')).pages??[];urls.push(...pages.filter(p=>/wedding|웨딩|price|요금|견적|package|cost/i.test(p.url+' '+p.title)).map(p=>p.url));}urls=[...new Set(urls)].slice(0,v.id>='venue-099'?1:3);
 for(const url of urls){try{const response=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{'User-Agent':'Mozilla/5.0'}});if(!response.ok)throw new Error('HTTP '+response.status);const html=await response.text(),text=strip(html);const snippets=[...text.matchAll(/식대|식사비|대관료|홀\s*사용료|연출료|플라워|데코레이션|이용요금|Meal|Rental|Wedding Package/gi)].map(m=>text.slice(Math.max(0,m.index-80),m.index+340)).slice(0,30);r.pages.push({url:response.url,title:strip(html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]??''),snippets,text:text.slice(0,50000)});}catch(error){r.errors.push({url,error:error.message});}}}
 r.status=r.pages.length?'read':v.website?'unavailable':'website-unconfirmed';fs.writeFileSync(file,JSON.stringify(r,null,2));console.log(v.id,r.status,r.pages.reduce((n,p)=>n+p.snippets.length,0));
}}));
