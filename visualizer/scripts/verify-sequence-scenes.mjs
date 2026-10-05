import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import { definitions } from '../src/problems/families/sequenceStories/definitions.js';
const server=await createServer({server:{middlewareMode:true},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}});
let frames=0;
try {
 const {default:SequenceStory}=await server.ssrLoadModule('/src/problems/families/sequenceStories/SequenceStory.jsx');
 for(const definition of Object.values(definitions)) {
  const workspace=SequenceStory({definition});
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
