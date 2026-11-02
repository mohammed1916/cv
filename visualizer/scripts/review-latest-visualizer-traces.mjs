// Read-only reproduction: validate the exact presets wired into routed index.jsx files.
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { parse } from '@babel/parser'
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['3785','3788','3789','3797','3800','3818','3838','3842','3880']
const results=[]
for(const id of ids) {
 const folder=`src/problems/Problem${id}`
 const ast=parse(fs.readFileSync(`${folder}/index.jsx`,'utf8'),{sourceType:'module',plugins:['jsx']})
 const declaration=ast.program.body.flatMap(n=>n.type==='VariableDeclaration'?n.declarations:[]).find(n=>n.id.name==='definition')
 const examples=declaration?.init.properties.find(p=>p.key.name==='examples')?.value.elements
 if(!examples)throw Error(`No literal presets for ${id}; inspect manually`)
 const m=await import(`../${folder}/algorithm.js`)
 for(const ex of examples) {
  const value=k=>ex.properties.find(p=>p.key.name===k)?.value.value
  const row={id,label:value('label'),input:value('input'),issues:[]}
  try {
   const run=m.buildTrace(m.parseInput(row.input));row.result=run.result;row.frames=run.frames.length
   for(const [i,f] of run.frames.entries()) {
    if(!Number.isInteger(f.activeLine)||f.activeLine<1||f.activeLine>m.code.length)row.issues.push({frame:i,phase:f.phase,kind:'invalid-pseudocode-line',line:f.activeLine})
    if(f.pythonLine!==undefined&&(!Number.isInteger(f.pythonLine)||f.pythonLine<1||f.pythonLine>m.python.trim().split('\n').length))row.issues.push({frame:i,phase:f.phase,kind:'invalid-python-line',line:f.pythonLine})
   }
  } catch(e) {row.issues.push({kind:'preset-execution-error',message:e.message})}
  results.push(row)
 }
}
const report={baseline:execFileSync('git',['rev-parse','--short=9','HEAD'],{encoding:'utf8'}).trim(),checkedOn:new Date().toISOString().slice(0,10),scope:'Actual literal presets plus frame line ranges; not browser acceptance or semantic-line proof',presets:results.length,failingPresets:results.filter(r=>r.issues.length).length,results}
console.log(JSON.stringify(report,null,2));if(report.failingPresets)process.exitCode=1
