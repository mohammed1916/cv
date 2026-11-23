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
import * as p1352 from '../src/problems/Problem1352/algorithm.js';
import { productTutorial } from '../src/problems/Problem1352/tutorial.js';
import { examples as examples1352 } from '../src/problems/Problem1352/presets.js';
import * as p353 from '../src/problems/Problem353/algorithm.js';
import { snakeTutorial } from '../src/problems/Problem353/tutorial.js';
import { examples as examples353 } from '../src/problems/Problem353/presets.js';

import * as p487 from '../src/problems/Problem487/algorithm.js';
import { onesTutorial } from '../src/problems/Problem487/tutorial.js';
import { examples as examples487 } from '../src/problems/Problem487/presets.js';
import * as p505 from '../src/problems/Problem505/algorithm.js';
import { mazeTutorial } from '../src/problems/Problem505/tutorial.js';
import { examples as examples505 } from '../src/problems/Problem505/presets.js';
const routes = [
  { id: '487', build: p487.buildTrace, parse: p487.parseInput, tutorial: onesTutorial, examples: examples487 },
  { id: '505', build: p505.buildTrace, parse: p505.parseInput, tutorial: mazeTutorial, examples: examples505 },
  { id: '353', build: p353.buildTrace, parse: p353.parseInput, tutorial: snakeTutorial, examples: examples353 },
  { id: '1352', build: p1352.buildTrace, parse: p1352.parseInput, tutorial: productTutorial, examples: examples1352 },
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
