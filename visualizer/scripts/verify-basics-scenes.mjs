import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createBasicsDefinition, lessons } from '../src/problems/families/basics/definitions.js';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
let count = 0;
try {
  const { BasicsScene } = await server.ssrLoadModule('/src/problems/families/basics/BasicsStory.jsx');
  for (const kind of Object.keys(lessons)) {
    const definition = createBasicsDefinition(kind);
    for (const example of definition.examples) {
      const run = definition.build(definition.parse(example.input));
      for (const step of run.frames) {
        const html = renderToStaticMarkup(createElement(BasicsScene, { kind, run, step }));
        assert.ok(!/NaN|Infinity|undefined/.test(html), `${kind}: ${example.label}`);
        if (step.phase === 'done') assert.match(html, /Algorithm result/);
        count++;
      }
    }
  }
  console.log(`Rendered ${count} Basics frames across nine lessons. Server rendering only; browser interactions are separate.`);
} finally { await server.close(); }
