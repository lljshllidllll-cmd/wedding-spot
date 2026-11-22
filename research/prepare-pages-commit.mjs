import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),dist=path.join(root,'dist');
if(!fs.existsSync(path.join(dist,'index.html')))throw new Error('Run node research/build-public.mjs first.');
const gitDir=execFileSync('git',['rev-parse','--absolute-git-dir'],{encoding:'utf8'}).trim();
const index=path.join(gitDir,'pages-index-'+Date.now());
const env={...process.env,GIT_INDEX_FILE:index};
const git=(args,options={})=>execFileSync('git',['--git-dir='+gitDir,'--work-tree='+dist,...args],{cwd:dist,env,encoding:'utf8',...options}).trim();
try{
 git(['read-tree','--empty']);git(['add','--all']);const tree=git(['write-tree']);
 let parent=null;try{parent=git(['rev-parse','--verify','refs/heads/gh-pages'],{stdio:['pipe','pipe','ignore']});}catch{}
 const commit=git(['commit-tree',tree,...(parent?['-p',parent]:[]),'-m','Publish wedding venue dashboard']);
 git(['update-ref','refs/heads/gh-pages',commit]);
 console.log(JSON.stringify({branch:'gh-pages',commit,tree}));
}finally{if(fs.existsSync(index))fs.unlinkSync(index);}
