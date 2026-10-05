import fs from 'node:fs';
import { definitions as scans } from '../src/problems/families/scanStories/definitions.js';
import { definitions as trees } from '../src/problems/families/treeStories/definitions.js';
import { definitions as collections } from '../src/problems/families/collectionStories/definitions.js';
const definitions={...scans,...trees,...collections};
const collectionTags={
  1262:['Dynamic Programming'],1266:['Geometry'],1275:['Matrix','Simulation'],1276:['Math'],1277:['Matrix','Dynamic Programming'],1281:['Math'],1282:['Hash Table'],1287:['Array'],1288:['Sorting'],1291:['Enumeration'],1292:['Matrix','Prefix Sum'],1296:['Greedy','Sorting'],1299:['Array'],1300:['Binary Search'],1304:['Math'],1306:['Breadth-First Search'],1309:['String'],1310:['Prefix Sum','Bit Manipulation'],1313:['Array'],1314:['Matrix','Prefix Sum'],1317:['Math'],1318:['Bit Manipulation'],1323:['Greedy'],1328:['String','Greedy'],1331:['Sorting'],1332:['String'],1337:['Matrix','Sorting'],1342:['Math'],1343:['Sliding Window'],1344:['Math'],1346:['Hash Table'],1347:['Counting'],1351:['Matrix'],1356:['Sorting','Bit Manipulation'],1360:['Math'],1365:['Sorting'],1370:['String','Counting'],1374:['String'],1380:['Matrix'],1385:['Array'],1389:['Array','Simulation'],1394:['Counting'],1399:['Counting'],1400:['String','Counting'],
  1101:['Union Find','Sorting'],1105:['Dynamic Programming'],1124:['Prefix Sum'],1130:['Dynamic Programming'],1131:['Math'],1135:['Minimum Spanning Tree','Union Find'],1136:['Graph','Topological Sort'],1139:['Matrix','Dynamic Programming'],1155:['Dynamic Programming'],1162:['Matrix','Breadth-First Search'],1177:['Prefix Sum','Bit Manipulation'],1182:['Binary Search'],1186:['Dynamic Programming'],1190:['Stack','String'],1191:['Dynamic Programming'],1202:['Union Find','Sorting'],1219:['Matrix','Backtracking'],1220:['Dynamic Programming'],1239:['Backtracking'],1252:['Matrix','Math'],1254:['Matrix','Breadth-First Search'],1260:['Matrix','Simulation'],
  1100:['Sliding Window'],1108:['String'],1109:['Prefix Sum'],1111:['String','Greedy'],1118:['Math'],1119:['String'],1122:['Sorting','Counting'],1128:['Counting'],1133:['Counting'],1134:['Math'],1137:['Dynamic Programming'],1144:['Greedy'],1150:['Binary Search'],1151:['Sliding Window'],1154:['Math'],1160:['Counting','String'],1165:['String','Hash Table'],1167:['Greedy','Sorting'],1170:['String','Counting'],1175:['Math'],1176:['Sliding Window'],1180:['String','Counting'],1184:['Array'],1189:['String','Counting'],1196:['Greedy','Sorting'],1200:['Sorting'],1208:['Sliding Window'],1209:['Stack','String'],1213:['Array','Two Pointers'],1217:['Math','Greedy'],1218:['Dynamic Programming'],1221:['Greedy','String'],1222:['Matrix','Simulation'],1227:['Math','Probability and Statistics'],1232:['Geometry'],1247:['String','Greedy'],1248:['Prefix Sum'],1249:['Stack','String'],1250:['Math'],
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
 if(!process.argv.includes('--skip-example-validation'))for(const example of d.examples)d.build(d.parse(example.input));
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
