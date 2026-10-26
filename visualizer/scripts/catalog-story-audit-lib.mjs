import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from '@babel/parser';

const cache = new Map();
function reachable(file, seen = new Set()) {
  if (seen.has(file)) return seen;
  seen.add(file);
  if (!cache.has(file)) {
    const source = fs.readFileSync(file,'utf8');
    const tree = parse(source,{sourceType:'module',plugins:['jsx']});
    const imports = tree.program.body.map(n=>n.source?.value).filter(s=>s?.startsWith('.'));
    const dependencies = imports.map(s=>path.resolve(path.dirname(file),s)).map(base=>
      [base,base+'.jsx',base+'.js',path.join(base,'index.jsx')].find(f=>/\.jsx?$/.test(f)&&fs.existsSync(f)&&fs.statSync(f).isFile())).filter(Boolean);
    cache.set(file,{source,dependencies});
  }
  for (const dependency of cache.get(file).dependencies) reachable(dependency,seen);
  return seen;
}

export async function auditCatalogStories() {
  const entries=[], failures=[];
  for (const folder of fs.readdirSync('src/problems')) {
    const base=path.resolve('src/problems',folder), entry=path.join(base,'index.jsx'), metaFile=path.join(base,'meta.js');
    if(!fs.existsSync(entry)||!fs.existsSync(metaFile)) continue;
    const {meta}=await import(pathToFileURL(metaFile));
    if(!meta?.number||!meta?.title) { failures.push(`${folder}: incomplete route metadata`);continue; }
    const files=[...reachable(entry)];
    const own=files.filter(f=>f.startsWith(base+path.sep)).map(f=>cache.get(f).source).join('\n');
    const all=files.map(f=>cache.get(f).source).join('\n');
    const catalog=own.includes('withProblemStory(');
    const authored=/narrative:\s*\w|<AlgorithmNarrative\b|<(?:NextPointersWorkspace|PascalWorkspace)\b/.test(own);
    if (!catalog&&!authored) failures.push(`${folder}: no story connected`);
    if(catalog){
      const guideFile=path.join(base,'storyGuide.json');
      if(!fs.existsSync(guideFile)) {failures.push(`${folder}: no guide`);continue;}
      const guide=JSON.parse(fs.readFileSync(guideFile,'utf8'));
      if(guide.number!==String(meta.number)||guide.title!==meta.title)failures.push(`${folder}: guide identity mismatch`);
      if(!guide.strategy||guide.strategy.length<30)failures.push(`${folder}: missing strategy`);
      if(!guide.edgeCases.length&&!guide.checks.length&&!guide.inputRules.length)failures.push(`${folder}: missing boundary cases`);
      // Require a publisher in a reachable code panel, not merely in the HOC.
      if(!files.some(f=>/Code(?:Trace)?Panel\.jsx$/.test(f)&&cache.get(f).source.includes('useNarrativeTrace(')))failures.push(`${folder}: no reachable trace publisher`);
    }
    if(!all.includes('AlgorithmNarrative'))failures.push(`${folder}: shared renderer unreachable`);
    entries.push({folder,number:String(meta.number),title:meta.title,kind:catalog?'catalog-story':'authored-workspace'});
  }
  entries.sort((a,b)=>a.number.localeCompare(b.number,undefined,{numeric:true}));
  return {routes:entries.length,covered:entries.length-failures.filter(f=>f.includes('no story')).length,entries,failures};
}
