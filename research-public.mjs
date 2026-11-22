import fs from 'node:fs';
fs.mkdirSync('research', {recursive:true});
const strip = s => s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ').trim();
const pages = await Promise.all(Array.from({length:7},(_,i)=>fetch(`https://wedding.seoulwomen.or.kr/facilities${i?'/page/'+(i+1):''}`).then(r=>r.text())));
const cards=pages.flatMap(html=>[...html.matchAll(/<a class="w-full" href="(https:\/\/wedding.seoulwomen.or.kr\/facilities\/\d+)"[^>]*>([\s\S]*?)<\/a>/g)].map(m=>({url:m[1],text:strip(m[2])})));
const relevant=cards.filter(c=>/^(마포구|서대문구|강서구|영등포구|은평구|양천구)/.test(c.text));
const details=await Promise.all(relevant.map(async c=>{const html=await fetch(c.url).then(r=>r.text());return {...c,detail:strip(html)};}));
fs.writeFileSync('research/public-venues.json',JSON.stringify({checkedAt:'2026-11-22',total:cards.length,venues:details},null,2));
console.log(JSON.stringify({total:cards.length,relevant:details.map(c=>({url:c.url,text:c.text}))},null,2));
