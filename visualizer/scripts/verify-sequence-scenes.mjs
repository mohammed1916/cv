import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import { definitions as sequenceDefinitions } from '../src/problems/families/sequenceStories/definitions.js';
import { definitions as scanDefinitions } from '../src/problems/families/scanStories/definitions.js';
import { definitions as treeDefinitions } from '../src/problems/families/treeStories/definitions.js';
const definitions={...sequenceDefinitions,...scanDefinitions,...treeDefinitions};
const server=await createServer({server:{middlewareMode:true},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}});
let frames=0;
try {
 const {default:SequenceStory}=await server.ssrLoadModule('/src/problems/families/sequenceStories/SequenceStory.jsx');
 const {default:TreeStory}=await server.ssrLoadModule('/src/problems/families/treeStories/TreeStory.jsx');
 for(const [id,definition] of Object.entries(definitions)) {
  const workspace=(id in treeDefinitions?TreeStory:SequenceStory)({definition});
  for(const example of definition.examples) {
   const run=definition.build(definition.parse(example.input));
   for(const step of run.frames) {
    const html=renderToStaticMarkup(workspace.props.renderVisual({run,step}));
    assert.ok(html.length>0);
    if(step.phase==='done')assert.match(html,/Algorithm result/);
    frames++;
   }
  }
 }
 console.log(`Rendered ${frames} real visual frames for ${Object.keys(definitions).length} algorithms. This is server rendering, not browser interaction verification.`);
} finally {await server.close();}
