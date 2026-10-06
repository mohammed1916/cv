import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { matchCatalog } from '../src/data/catalogCoverage.js';
const catalog = JSON.parse(fs.readFileSync('public/data/leetcodeCatalog.json','utf8'));
const routes=[];
for(const folder of fs.readdirSync('src/problems')) {
  const base=`src/problems/${folder}`;
  if(!fs.existsSync(`${base}/meta.js`) || !fs.existsSync(`${base}/index.jsx`))continue;
  const {meta}=await import(pathToFileURL(path.resolve(base,'meta.js')));
  routes.push({...meta,folder});
}
const entries=matchCatalog(catalog.problems,routes).map(({problem,route})=>({
  number:problem.number,title:problem.title,slug:problem.slug,
  status:route?'route-present':'unimplemented',folder:route?.folder??null,
  ...(route && String(route.number)!==String(problem.number)?{legacyRouteNumber:route.number}:{}),
}));
const matched=entries.filter(e=>e.folder).length;
const report={catalogDate:catalog.generatedAt,catalogProblems:entries.length,routes:routes.length,
  matchedCatalogRoutes:matched,remaining:entries.length-matched,
  note:'Route presence is not certification of algorithm or browser correctness. Nonmatching legacy routes are not counted as implemented catalog entries.',
  unmatchedRoutes:routes.filter(r=>!entries.some(e=>e.folder===r.folder)).map(r=>({folder:r.folder,title:r.title,number:r.number})),entries};
fs.writeFileSync('docs/catalog-coverage.json',JSON.stringify(report,null,2)+'\n');
const scoped=entries.filter(entry=>Number(entry.number)<=2500);
const scopedMissing=scoped.filter(entry=>!entry.folder);
fs.writeFileSync('docs/catalog-through-2500.json',JSON.stringify({
  scope:'Every catalog problem numbered 1 through 2500',catalogDate:catalog.generatedAt,
  catalogProblems:scoped.length,routePresent:scoped.length-scopedMissing.length,
  missing:scopedMissing.length,note:report.note,
  bands:Array.from({length:10},(_,i)=>({from:i*250+1,through:(i+1)*250,missing:scopedMissing.filter(entry=>Number(entry.number)>i*250&&Number(entry.number)<=(i+1)*250).length})),
  entries:scoped,
},null,2)+'\n');
console.log(JSON.stringify({...report,entries:undefined},null,2));
