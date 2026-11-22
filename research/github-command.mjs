import {spawnSync} from 'node:child_process';
// Use the existing Git credential manager session; never persist or print tokens.
const args=process.argv.slice(2);
if(!['api','repo','run'].includes(args[0]))throw new Error('Unsupported deployment command.');
let token=process.env.GH_TOKEN;
if(!token){
 const result=spawnSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',env:{...process.env,GCM_INTERACTIVE:'never',GIT_TERMINAL_PROMPT:'0'},timeout:15000});
 if(result.status!==0)throw new Error('GitHub sign-in is unavailable.');
 token=result.stdout.split(/\r?\n/).find(line=>line.startsWith('password='))?.slice(9);
}
if(!token)throw new Error('GitHub sign-in is unavailable.');
const result=spawnSync('gh',args,{encoding:'utf8',env:{...process.env,GH_TOKEN:token},timeout:120000,maxBuffer:4*1024*1024});
const redact=s=>String(s??'').split(token).join('[redacted]');
if(result.stdout)process.stdout.write(redact(result.stdout));
if(result.stderr)process.stderr.write(redact(result.stderr));
process.exit(result.status??1);
