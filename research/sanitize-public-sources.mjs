import fs from 'node:fs';
import path from 'node:path';
// Keep original public-web research locally. Do not publish temporary signed
// download credentials that appeared in third-party search results.
let filesChanged=0,stringsChanged=0;
function cleanString(value){
 let next=value.replace(/https?:\/\/[^\s<>"']+/gi,url=>{
  let decoded=url;try{decoded=decodeURIComponent(url);}catch{}
  if(/(?:x-amz-|AWSAccessKeyId|[?&](?:Signature|credential|token)=)/i.test(decoded))return url.split('?')[0].split('#')[0];
  return url;
 }).replace(/AKIA[A-Z0-9]{16}/g,'[redacted-third-party-access-id]');
 if(next!==value)stringsChanged++;
 return next;
}
function clean(value){if(typeof value==='string')return cleanString(value);if(Array.isArray(value))return value.map(clean);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clean(v)]));return value;}
function walk(folder){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory()){if(entry.name!=='local-only')walk(file);continue;}if(!file.endsWith('.json'))continue;const original=fs.readFileSync(file,'utf8').replace(/^\ufeff/,'');let data;try{data=JSON.parse(original);}catch{continue;}const before=stringsChanged,result=clean(data);if(before===stringsChanged)continue;const backup=path.join('research/local-only/originals',path.relative('research',file));fs.mkdirSync(path.dirname(backup),{recursive:true});if(!fs.existsSync(backup))fs.copyFileSync(file,backup);fs.writeFileSync(file,JSON.stringify(result,null,2));filesChanged++;}}
walk('research');console.log(JSON.stringify({filesChanged,stringsChanged,originals:'research/local-only/originals'}));
