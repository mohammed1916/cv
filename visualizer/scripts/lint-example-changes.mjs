import { ESLint } from 'eslint';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const eslint=new ESLint();
const files=process.argv.length>2?process.argv.slice(2):execFileSync('git',['diff','--name-only','--relative'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim().split('\n').filter(f=>/\.(js|jsx|mjs)$/.test(f));
files.push('src/config/authoredExamples.js','src/problems/Problem432/algorithm.js');
const prefix=execFileSync('git',['rev-parse','--show-prefix'],{encoding:'utf8'}).trim();
const introduced=[];
for(const f of files){
 const [current]=await eslint.lintFiles(f);let baseline=[];
 try{const old=execFileSync('git',['show',`HEAD:${prefix}${f}`],{encoding:'utf8',stdio:['ignore','pipe','ignore']});baseline=(await eslint.lintText(old,{filePath:f}))[0].messages;}catch{/* new file */}
 const signature=m=>m.ruleId+' '+m.message.split('\n')[0].replace(/at line \d+/g,'at line N');
 const counts=new Map();for(const m of baseline){const key=signature(m);counts.set(key,(counts.get(key)||0)+1);}
 for(const m of current.messages){const key=signature(m);if(counts.get(key)){counts.set(key,counts.get(key)-1);continue;}introduced.push({file:f,...m});}
}
fs.writeFileSync('docs/example-lint-report.json',JSON.stringify(introduced,null,2)+'\n');
console.log(introduced.map(m=>`${m.file}:${m.line}:${m.column} ${m.ruleId}: ${m.message}`).join('\n'));
console.log(`${introduced.length} introduced lint findings`);
process.exitCode=introduced.length?1:0;
