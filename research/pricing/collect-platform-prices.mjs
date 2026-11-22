import fs from 'node:fs';
const c=JSON.parse(fs.readFileSync('catalog.json','utf8'));
const dir='research/local-only/platform-pricing';fs.mkdirSync(dir,{recursive:true});
let index=0;await Promise.all(Array.from({length:7},async()=>{while(index<98){const v=c.venues[index++],file=dir+'/'+v.id+'.json';if(fs.existsSync(file))continue;
const search=JSON.parse(fs.readFileSync('research/local-only/pricing-search/'+v.id+'-web.json','utf8'));
const sources=search.sources.filter(s=>/www.directwedding.co.kr\/weddinghall|yozmwedding.co.kr\/venue\/|app.myweddingfriendz.com\/weddinghall|smartwedding-besthall.com\/|www.weddingbook.com\/weddinghall/.test(s.url)).slice(0,3);
const pages=[];for(const s of sources){try{const r=await fetch(s.url,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('HTTP '+r.status);const html=s.url.includes('myweddingfriendz')?new TextDecoder('euc-kr').decode(await r.arrayBuffer()):await r.text();const text=html.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();pages.push({url:r.url,text,context:[...text.matchAll(/대관료|식사비|식대|홀사용료/g)].map(m=>text.slice(Math.max(0,m.index-40),m.index+450)).slice(0,12)});}catch(e){pages.push({url:s.url,error:e.message});}}
fs.writeFileSync(file,JSON.stringify({id:v.id,name:v.name,pages},null,2));console.log(v.id,pages.filter(p=>p.text).length);
}}));
