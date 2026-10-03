import fs from 'node:fs';
import {createServer} from 'vite';
import {parse} from '@babel/parser';
const files=[];
for(const folder of fs.readdirSync('src/problems')){
 const dir=`src/problems/${folder}`;
 if(!fs.existsSync(`${dir}/meta.js`))continue;
 for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.jsx'))){
  const source=fs.readFileSync(`${dir}/${file}`,'utf8');
  if(/const definition\s*=/.test(source))files.push(`${dir}/${file}`);
 }
}
files.push('src/components/shared/NextPointersWorkspace.jsx','src/components/shared/PascalWorkspace.jsx');
const server=await createServer({server:{middlewareMode:true},appType:'custom',plugins:[{
 name:'expose-example-definitions',enforce:'pre',transform(source,id){
  if(!files.some(f=>id.replaceAll('\\','/').endsWith(f)))return;
  const ast=parse(source,{sourceType:'module',plugins:['jsx']});
  const names=ast.program.body.filter(n=>n.type==='VariableDeclaration').flatMap(n=>n.declarations.map(d=>d.id.name)).filter(n=>['definition','definitions'].includes(n));
  return source+names.map(n=>`\nexport { ${n} as __${n} };`).join('');
 }
}]});
const failures=[],checks=[];
try{
 for(const file of files){
  try{
   const mod=await server.ssrLoadModule('/'+file);
   const defs=mod.__definition?[mod.__definition]:Object.values(mod.__definitions||{});
   for(const d of defs)for(const e of d.examples||[]){
    try{
     let input;
     if(d.fields){const source=e.values??e.input??e;input=Object.fromEntries(d.fields.map(f=>[f.key,source[f.key]??f.defaultValue??'']));}
     else input=e.input;
     const result=d.build(d.parse?d.parse(input):input);
     if(!result)throw new Error('No story returned');
     checks.push({file,label:e.label});
    }catch(error){failures.push(`${file}: ${e.label}: ${error.message}`);}
   }
  }catch(error){failures.push(`${file}: module: ${error.message}`);}
 }
}finally{await server.close();}
fs.writeFileSync('docs/workspace-example-validation.json',JSON.stringify({checks,failures},null,2)+'\n');
console.log(JSON.stringify({checks:checks.length,failures},null,2));
process.exitCode=failures.length?1:0;
