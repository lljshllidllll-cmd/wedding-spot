import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(),out=path.join(root,'dist');
const catalog=JSON.parse(fs.readFileSync('catalog.json','utf8'));
const files=['index.html','styles.css','gallery.css','script.js','catalog.js','catalog.json','catalog.csv','SURVEY_REPORT.md','ENRICHMENT_REPORT.md',...catalog.venues.flatMap(v=>v.photos.map(p=>p.localPath))];
fs.mkdirSync(out,{recursive:true});
let bytes=0;
for(const file of new Set(files)){
 const source=path.resolve(root,file),target=path.resolve(out,file);
 assert(source.startsWith(root+path.sep)&&target.startsWith(out+path.sep),'Asset stays within project');
 assert(fs.statSync(source).isFile(),file);
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);bytes+=fs.statSync(source).size;
}
fs.writeFileSync(path.join(out,'.nojekyll'),'');
fs.writeFileSync(path.join(out,'404.html'),'<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>페이지를 찾을 수 없습니다</title><h1>페이지를 찾을 수 없습니다</h1><p><a href="./">예식장 목록으로 돌아가기</a></p></html>');
fs.writeFileSync(path.join(out,'release.json'),JSON.stringify({checkedAt:catalog.checkedAt,venues:catalog.venues.length,photos:catalog.enrichment.photos,galleries:catalog.enrichment.completeGalleries},null,2));
console.log(JSON.stringify({output:'dist',files:new Set(files).size+3,photos:catalog.enrichment.photos,sizeMB:Math.round(bytes/1024/1024)},null,2));
