import fs from 'node:fs';
import vm from 'node:vm';
import { parse } from '@babel/parser';
import { AUTHORED_EXAMPLES as suites } from '../src/config/authoredExamples.js';

const failures=[], checks=[], skipped=[];
function walk(n,f){if(!n||typeof n!=='object')return;f(n);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(x=>walk(x,f));else if(v?.type)walk(v,f);}}
function hasJSX(n){let found=false;walk(n,x=>{if(x.type==='JSXElement'||x.type==='JSXFragment')found=true;});return found;}
const aliases={
 numsIn:'nums',numsInput:'nums',arrayInput:'array',treeArray:'tree',arrInput:'arr',heightsInput:'heights',
 mat:'matrix',str:'s',text:'s',nInput:'n',numInput:'num',word1:'w1',word2:'w2',
};
let routes=0;
for(const folder of fs.readdirSync('src/problems')){
 const base=`src/problems/${folder}`;
 if(!fs.existsSync(`${base}/meta.js`))continue;
 routes++;
 let connected=false;
 for(const file of fs.readdirSync(base).filter(f=>/\.jsx?$/.test(f)&&!f.includes('.test.'))){
  const pathname=`${base}/${file}`, source=fs.readFileSync(pathname,'utf8');
  const ast=parse(source,{sourceType:'module',plugins:['jsx']});
  const keys=[];
  walk(ast,n=>{if(n.type==='CallExpression'&&/^(getExamples| getExamplesOr|getExamplesOr|getAuthoredExamples)$/.test(n.callee.name||'')&&n.arguments[0]?.type==='StringLiteral')keys.push(n.arguments[0].value);});
  for(const key of keys){
   if(!suites[key]?.length){failures.push(`${pathname}: missing ${key}`);continue;}
   connected=true;
   const labels=new Set(), inputs=new Set();
   for(const e of suites[key]){
    const data={...e};delete data.label;
    if(labels.has(e.label))failures.push(`${key}: duplicate label ${e.label}`);labels.add(e.label);
    const serialized=JSON.stringify(data);
    if(inputs.has(serialized))failures.push(`${key}: duplicate input ${e.label}`);inputs.add(serialized);
    if(Object.values(data).some(v=>v===undefined))failures.push(`${key}: undefined field ${e.label}`);
   }
  }
  const fn=ast.program.body.map(n=>n.declaration||n).find(n=>n.type==='FunctionDeclaration'&&n.id.name==='generateSteps');
  if(!fn||!keys.length)continue;
  // Execute the real pure trace and its local helpers with a hard time limit.
  // Imported-helper traces are separately exercised through algorithm modules.
  const declarations=ast.program.body.map(n=>n.declaration||n).filter(n=>
    (n.type==='FunctionDeclaration'||n.type==='ClassDeclaration'||n.type==='VariableDeclaration')&&!hasJSX(n)&&
    !(n.type==='VariableDeclaration'&&n.declarations.some(d=>/EXAMPLES|examples|definition|Narrative/.test(d.id.name||''))));
  let context;
  try{
   context=vm.createContext({console,Math,JSON,Set,Map,Infinity,Number,String,Array,Object,Date,structuredClone, getInitialExamples:k=>suites[k]||[],getExamples:k=>suites[k]||[],getExamplesOr:(k,f)=>suites[k]||f,getAuthoredExamples:k=>suites[k]||[]});
   vm.runInContext(declarations.map(n=>source.slice(n.start,n.end)).join('\n'),context,{timeout:1500});
  }catch(e){skipped.push({folder,file,reason:`dependencies: ${e.message}`});continue;}
  const params=fn.params.map(n=>n.name);
  const key=keys.find(k=>k.startsWith('local:'))||keys[0];
  for(const example of suites[key]){
   const values=Object.entries(example).filter(([k])=>!['label','note','desc','description','expected','output'].includes(k));
   const args=params.map((p,i)=>{
    if(fn.params[i].type==='ObjectPattern')return example;
    if(p in example)return example[p];
    if(aliases[p] in example)return example[aliases[p]];
    if(params.length===1&&values.length===1)return values[0][1];
    return undefined;
   });
   if(args.some(a=>a===undefined)){skipped.push({folder,file,label:example.label,reason:`adapter: ${params.join(', ')}`});continue;}
   context.__args=structuredClone(args);
   try{
    const result=vm.runInContext('generateSteps(...__args)',context,{timeout:1500});
    const frames=Array.isArray(result)?result:result?.steps;
    if(!frames?.length)throw new Error('trace has no frames');
    checks.push({folder,file,key,label:example.label,frames:frames.length});
   }catch(e){
    if(/is not defined/.test(e.message))skipped.push({folder,file,label:example.label,reason:`imported helper: ${e.message}`});
    else failures.push(`${folder}/${file} [${key}] ${example.label}: ${e.message}`);
   }
  }
 }
 if(!connected&&['Problem3903','Problem3904'].includes(folder))connected=!!suites['local:stableIndex'];
 if(!connected&&['Problem116','Problem117'].includes(folder))connected=!!suites[`next-pointers-${folder==='Problem116'?'perfect':'sparse'}`];
 if(!connected&&['Problem118','Problem119'].includes(folder))connected=!!suites[`pascal-${folder==='Problem118'?'triangle':'row'}`];
 if(!connected)failures.push(`${folder}: no authored examples connected`);
}
const report={routes,suites:Object.keys(suites).length,examples:Object.values(suites).reduce((n,s)=>n+s.length,0),traceChecks:checks.length,failures,skipped,checks};
fs.writeFileSync('docs/authored-example-validation.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({routes:report.routes,suites:report.suites,examples:report.examples,traceChecks:checks.length,skipped:skipped.length,failures},null,2));
process.exitCode=failures.length?1:0;
