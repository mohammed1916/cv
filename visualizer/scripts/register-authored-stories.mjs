import fs from 'node:fs';
import { definitions as scans } from '../src/problems/families/scanStories/definitions.js';
import { definitions as trees } from '../src/problems/families/treeStories/definitions.js';
import { definitions as collections } from '../src/problems/families/collectionStories/definitions.js';
const definitions={...scans,...trees,...collections};
const collectionTags={
  1053:['Array','Greedy'],1064:['Binary Search'],1071:['String','Math'],1078:['String'],1085:['Array','Math'],1089:['Array','Simulation'],1094:['Prefix Sum','Sorting'],1099:['Two Pointers','Sorting'],
  1006:['Math','Stack'],1007:['Array','Greedy'],1009:['Bit Manipulation'],1010:['Hash Table','Counting'],1011:['Binary Search','Array'],1013:['Array','Greedy'],1014:['Array','Dynamic Programming'],1015:['Math'],1017:['Math'],1018:['Bit Manipulation','Array'],1021:['String','Stack'],1023:['String','Two Pointers'],1025:['Math','Dynamic Programming','Game Theory'],1029:['Sorting','Greedy'],1030:['Matrix','Sorting'],1037:['Math','Geometry'],1041:['Simulation'],1046:['Sorting','Simulation'],1051:['Sorting','Array'],1052:['Sliding Window'],
  860:['Greedy'],861:['Array','Matrix','Greedy'],868:['Bit Manipulation'],869:['Counting','Enumeration'],881:['Greedy','Two Pointers'],883:['Matrix','Geometry'],884:['String','Hash Table'],888:['Array','Hash Table'],890:['String','Hash Table'],892:['Matrix','Geometry'],893:['String','Hash Table'],898:['Bit Manipulation','Dynamic Programming'],899:['String','Sorting'],901:['Stack','Monotonic Stack'],904:['Sliding Window'],908:['Math'],914:['Counting','Math'],915:['Array'],917:['String','Two Pointers'],918:['Dynamic Programming'],921:['String','Greedy'],925:['String','Two Pointers'],926:['Dynamic Programming'],929:['String','Hash Table'],930:['Prefix Sum','Hash Table'],931:['Matrix','Dynamic Programming'],933:['Queue'],941:['Array'],942:['Greedy'],944:['String','Array'],945:['Sorting','Greedy'],946:['Stack'],948:['Greedy','Two Pointers'],950:['Queue','Simulation'],953:['String','Hash Table'],961:['Hash Table'],962:['Monotonic Stack'],970:['Math','Hash Table'],973:['Geometry','Sorting'],974:['Prefix Sum','Hash Table'],976:['Sorting','Greedy'],978:['Array','Dynamic Programming'],983:['Dynamic Programming'],985:['Array','Simulation'],989:['Array','Math'],991:['Math','Greedy'],997:['Graph'],999:['Matrix','Simulation'],1002:['String','Counting'],1005:['Sorting','Greedy'],
};

// Register only explicit, implemented definitions. Never fabricate a solver
// or overwrite an existing independently maintained visualizer.
for(const [id,d] of Object.entries(definitions)) {
 const folder=`src/problems/Problem${id}`;
 const family=id in trees?'treeStories':id in collections?'collectionStories':'scanStories';
 if(fs.existsSync(folder)) {
  const index=fs.existsSync(`${folder}/index.jsx`)?fs.readFileSync(`${folder}/index.jsx`,'utf8'):'';
  if(!index.includes(`../families/${family}/definitions`))throw new Error(`Refusing to replace existing ${folder}`);
  continue;
 }
 for(const example of d.examples)d.build(d.parse(example.input));
 fs.mkdirSync(folder);
 const tags=collectionTags[id]??(id in trees?['Tree','Binary Tree']:[661,718,733].includes(+id)?['Array','Matrix']:[673,714,740].includes(+id)?['Dynamic Programming']:[682,735,844,856].includes(+id)?['Stack']:[594,599,692,771,804].includes(+id)?['Hash Table']:[658,744,852].includes(+id)?['Binary Search']:['Array','String']);
 fs.writeFileSync(`${folder}/meta.js`,`export const meta = ${JSON.stringify({number:id,title:d.title,slug:d.slug,difficulty:d.difficulty,tags,accent:'#0891b2',description:d.goal},null,2)};\n`);
 fs.writeFileSync(`${folder}/storyGuide.json`,JSON.stringify({number:id,title:d.title,goal:d.goal,strategy:d.strategy,phases:d.phases.map(p=>p.id),phasePurposes:Object.fromEntries(d.phases.map(p=>[p.id,p.description])),edgeCases:d.examples.slice(1).map(e=>e.label),checks:[],inputRules:['The input parser enforces the problem domain and explicit limits for an inspectable trace.']},null,2)+'\n');
 fs.writeFileSync(`${folder}/index.jsx`, `import { getExamples } from '../../config/examplesRegistry';
import Story from '../families/${id in trees?'treeStories/TreeStory':'sequenceStories/SequenceStory'}';
import { definitions } from '../families/${family}/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[${id}], examples: getExamples('${id in trees?'tree':id in collections?'collection':'scan'}:${id}') };
function Visualizer() { return <Story definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
`);
}
console.log(`Registered ${Object.keys(definitions).length} explicit authored definitions.`);
