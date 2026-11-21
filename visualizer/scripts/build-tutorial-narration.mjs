// Writes the narration scripts for directed tutorials to public/tutorial-audio/scripts/<route>.json.
// Each preset lists scenes as {key, kind, text}. Record one MP3 per key and save it as
//   public/tutorial-audio/<route>/<presetIndex>/<key>.mp3
// Missing clips are fine: the player falls back to the normal scene timing.
import { mkdirSync, writeFileSync } from 'node:fs';
import { buildNarrationScript } from '../src/components/shared/tutorialNarration.js';
import * as p1606 from '../src/problems/Problem1606/algorithm.js';
import { serverTutorial } from '../src/problems/Problem1606/tutorial.js';
import { examples as examples1606 } from '../src/problems/Problem1606/presets.js';
import * as p100 from '../src/problems/Problem100/algorithm.js';
import { sameTreeTutorial } from '../src/problems/Problem100/tutorial.js';
import { getExamples } from '../src/config/examplesRegistry.js';
import * as p3331 from '../src/problems/Problem3331/algorithm.js';
import { sizeTutorial } from '../src/problems/Problem3331/tutorial.js';
import { examples as examples3331 } from '../src/problems/Problem3331/presets.js';

const routes = [
  { id: '3331', build: p3331.buildTrace, parse: p3331.parseInput, tutorial: sizeTutorial, examples: examples3331 },
  { id: '1606-bisect', build: p1606.buildTrace, parse: p1606.parseInput, tutorial: serverTutorial, examples: examples1606 },
  { id: '1606-virtual', build: p1606.buildAlternativeTrace, parse: p1606.parseInput, tutorial: serverTutorial, examples: examples1606 },
  {
    id: '100', build: p100.buildTrace, parse: p100.parseInput, tutorial: sameTreeTutorial,
    examples: getExamples('same-tree').map(e => ({ label: e.label, input: JSON.stringify({ p: e.p, q: e.q }) })),
  },
];

const outDir = new URL('../public/tutorial-audio/scripts/', import.meta.url);
mkdirSync(outDir, { recursive: true });
for (const route of routes) {
  const presets = route.examples.map((example, presetIndex) => ({
    presetIndex,
    label: example.label,
    input: example.input,
    scenes: buildNarrationScript(route.build(route.parse(example.input)), route.tutorial),
  }));
  writeFileSync(new URL(`${route.id}.json`, outDir), JSON.stringify({ route: route.id, presets }, null, 2) + '\n');
  console.log(`${route.id}: ${presets.length} presets, ${presets.reduce((n, p) => n + p.scenes.length, 0)} scenes`);
}
