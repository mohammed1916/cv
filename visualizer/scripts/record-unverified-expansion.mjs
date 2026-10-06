// Inventory maintenance only: does not execute parsers, algorithms, tests, or builds.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { expansionSpecs } from '../src/problems/families/collectionStories/expansionSpecs.js';
import { dpSpecs } from '../src/problems/families/collectionStories/expansionDPSpecs.js';
import { moreSpecs } from '../src/problems/families/collectionStories/expansionMoreSpecs.js';
import { laterSpecs } from '../src/problems/families/collectionStories/expansionLaterSpecs.js';
import { continuingSpecs } from '../src/problems/families/collectionStories/expansionNextSpecs.js';
import { progressSpecs } from '../src/problems/families/collectionStories/expansionProgressSpecs.js';
import { advanceSpecs } from '../src/problems/families/collectionStories/expansionAdvanceSpecs.js';
import { forwardSpecs } from '../src/problems/families/collectionStories/expansionForwardSpecs.js';
import { continuedSpecs } from '../src/problems/families/collectionStories/expansionContinuedSpecs.js';
import { trieSpecs } from '../src/problems/families/collectionStories/trieSpecs.js';
import { rangeSpecs } from '../src/problems/families/collectionStories/expansionRangeSpecs.js';
import { broadSpecs } from '../src/problems/families/collectionStories/expansionBroadSpecs.js';
import { databaseSpecs } from '../src/problems/families/collectionStories/databaseSpecs.js';
import { graphGridSpecs } from '../src/problems/families/collectionStories/graphGridSpecs.js';
const ids=Object.keys({...expansionSpecs,...dpSpecs,...moreSpecs,...laterSpecs,...continuingSpecs,...progressSpecs,...advanceSpecs,...forwardSpecs,...continuedSpecs,...trieSpecs,...rangeSpecs,...broadSpecs,...databaseSpecs,...graphGridSpecs});
const inventoryFile='docs/catalog-story-inventory.json';
const inventory=JSON.parse(fs.readFileSync(inventoryFile,'utf8'));
for(const id of ids){
 const folder=`Problem${id}`,base=`src/problems/${folder}`;
 const {meta}=await import(pathToFileURL(path.resolve(base,'meta.js')));
 const guide=JSON.parse(fs.readFileSync(`${base}/storyGuide.json`,'utf8'));
 guide.verification={status:'not-run',reason:'User requested implementation without tests or builds.'};
 fs.writeFileSync(`${base}/storyGuide.json`,JSON.stringify(guide,null,2)+'\n');
 if(!inventory.entries.some(e=>e.folder===folder))inventory.entries.push({folder,number:String(meta.number),title:meta.title,kind:'catalog-story',checks:guide.checks.length,rules:guide.inputRules.length,edgeNotes:guide.edgeCases.length});
}
inventory.entries.sort((a,b)=>a.folder.localeCompare(b.folder));inventory.routes=inventory.entries.length;
fs.writeFileSync(inventoryFile,JSON.stringify(inventory,null,2)+'\n');
const contract='src/components/shared/catalogNarrative.test.mjs';
fs.writeFileSync(contract,fs.readFileSync(contract,'utf8').replace(/audit\.routes, \d+, 'Update the route contract/,`audit.routes, ${inventory.routes}, 'Update the route contract`));
const record={status:'implemented-unverified',instruction:'Continue implementing; skip tests and builds.',problemNumbers:ids.map(Number),problems:ids.length,originalExamples:ids.length*4,testsRun:false,buildRun:false,browserVerified:false};
fs.writeFileSync('docs/unverified-expansion.json',JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify(record,null,2));
