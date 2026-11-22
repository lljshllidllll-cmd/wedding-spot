import fs from 'node:fs';
const urls = [
'https://www.cnilsan.com/page/page3','https://thenewwed.kr/Location','https://kwanseivista.com/','https://www.yeseoheon.com/',
'https://www.jkart.co.kr/location/','https://www.yyrwed.com/41','https://www.theverde-g.kr/','https://ydp.thebennevis.co.kr/',
'https://www.iruumwedding.co.kr/brand/location.php','https://thepartyum.com/','https://www.kinaflower.com/VENUE','https://arteseoul.kr/location/',
'https://www.rysehotel.co.kr/ryse_wedding/','https://www.stanfordseoul.com/','https://lunamiele.co.kr/',
'https://www.seoulgarden.co.kr/view/viewLink.do?page=homepage%2FKOR%2Ffacilities%2Fwedding',
'https://www.swissgrand.co.kr/ko/wedding-banquet/grand-ballroom/','https://www.glad-hotels.com/yeouido/wedding/wedding.do',
'https://m.kensington.co.kr/hyd/wedding_party/detail?idx=73&type=wedding','https://botanicparkwedding.com/','https://venueg.co.kr/','https://ywedding.co.kr/'
];
const strip=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const items=await Promise.all(urls.map(async url=>{try{const r=await fetch(url,{signal:AbortSignal.timeout(15000)});const html=await r.text();return{url,finalUrl:r.url,status:r.status,title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],text:strip(html)};}catch(e){return{url,error:e.message};}}));
fs.writeFileSync('research/official-pages.json',JSON.stringify({checkedAt:'2026-11-22',items},null,2));
console.log(JSON.stringify(items.map(i=>({url:i.url,status:i.status,error:i.error,title:i.title,phones:[...new Set(i.text?.match(/(?:0\d{1,2})[-. ]\d{3,4}[-. ]\d{4}|1[568]\d{2}[-. ]\d{4}/g))],parking:i.text?.match(/.{0,30}주차.{0,110}/g)?.slice(0,4)})),null,2));
