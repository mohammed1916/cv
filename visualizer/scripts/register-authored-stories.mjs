import fs from 'node:fs';
import { definitions as scans } from '../src/problems/families/scanStories/definitions.js';
import { definitions as trees } from '../src/problems/families/treeStories/definitions.js';
const definitions={...scans,...trees};

// Register only explicit, implemented definitions. Never fabricate a solver
// or overwrite an existing independently maintained visualizer.
for(const [id,d] of Object.entries(definitions)) {
 const folder=`src/problems/Problem${id}`;
 const family=id in trees?'treeStories':'scanStories';
 if(fs.existsSync(folder)) {
  const index=fs.existsSync(`${folder}/index.jsx`)?fs.readFileSync(`${folder}/index.jsx`,'utf8'):'';
  if(!index.includes(`../families/${family}/definitions`))throw new Error(`Refusing to replace existing ${folder}`);
  continue;
 }
 for(const example of d.examples)d.build(d.parse(example.input));
 fs.mkdirSync(folder);
 const tags=id in trees?['Tree','Binary Tree']:[661,718,733].includes(+id)?['Array','Matrix']:[673,714,740].includes(+id)?['Dynamic Programming']:[682,735,844,856].includes(+id)?['Stack']:[594,599,692,771,804].includes(+id)?['Hash Table']:[658,744,852].includes(+id)?['Binary Search']:['Array','String'];
 fs.writeFileSync(`${folder}/meta.js`,`export const meta = ${JSON.stringify({number:id,title:d.title,slug:d.slug,difficulty:d.difficulty,tags,accent:'#0891b2',description:d.goal},null,2)};\n`);
 fs.writeFileSync(`${folder}/storyGuide.json`,JSON.stringify({number:id,title:d.title,goal:d.goal,strategy:d.strategy,phases:d.phases.map(p=>p.id),phasePurposes:Object.fromEntries(d.phases.map(p=>[p.id,p.description])),edgeCases:d.examples.slice(1).map(e=>e.label),checks:[],inputRules:['The input parser enforces the problem domain and explicit limits for an inspectable trace.']},null,2)+'\n');
 fs.writeFileSync(`${folder}/index.jsx`, `import { getExamples } from '../../config/examplesRegistry';
import Story from '../families/${id in trees?'treeStories/TreeStory':'sequenceStories/SequenceStory'}';
import { definitions } from '../families/${family}/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[${id}], examples: getExamples('${id in trees?'tree':'scan'}:${id}') };
function Visualizer() { return <Story definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
`);
}
console.log(`Registered ${Object.keys(definitions).length} explicit authored definitions.`);
