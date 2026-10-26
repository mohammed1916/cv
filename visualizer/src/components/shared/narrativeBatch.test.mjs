import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolveNarrative } from './resolveNarrative.js';
import { buildNextPointerStory } from './nextPointerStory.js';
import { buildPascalStory } from './pascalTrace.js';
import { perfectPointerNarrative, sparsePointerNarrative } from './nextPointerNarrative.js';
import { pascalTriangleNarrative, pascalRowNarrative } from './pascalNarrative.js';

// Inputs exercise different branches, including empty/minimum inputs where accepted.
const cases = [
  [12, 'romanNarrative', 'generateSteps', [[1], [4], [9], [1994], [3999]]],
  [13, 'romanToIntNarrative', 'generateSteps', [['I'], ['IV'], ['III'], ['MCMXCIV']]],
  [29, 'divideNarrative', 'buildDivision', [[{ dividend: '0', divisor: '3' }], [{ dividend: '-7', divisor: '3' }], [{ dividend: '-2147483648', divisor: '-1' }]]],
  [47, 'permuteUniqueNarrative', 'buildPermutations', [[{ nums: '[1]' }], [{ nums: '[1,1,2]' }], [{ nums: '[2,2,2]' }]]],
  [120, 'triangleNarrative', 'buildTriangleStory', [['[[2]]'], ['[[2],[3,4],[6,5,7],[4,1,8,3]]'], ['[[-1],[-2,-3]]']]],
  [122, 'stock2Narrative', 'buildStock2Story', [['[]'], ['[5]'], ['[5,4,3]'], ['[1,3,2,5]']]],
  [123, 'stock3Narrative', 'buildStock3Story', [['[]'], ['[5]'], ['[5,4,3]'], ['[3,3,5,0,0,3,1,4]']]],
  [124, 'maxPathNarrative', 'buildMaxPathStory', [['[-3]'], ['[-10,9,20,null,null,15,7]'], ['[-3,-2,-1]']]],
  [125, 'palindromeNarrative', 'buildPalindromeStory', [[''], ['!!!'], ['A man, a plan, a canal: Panama'], ['race a car']]],
  [128, 'consecutiveNarrative', 'buildConsecutiveStory', [['[]'], ['[1,1,2]'], ['[-1,0,1,8]'], ['[100,4,200,1,3,2]']]],
  [129, 'sumRootLeafNarrative', 'buildSumNumbersStory', [['[0]'], ['[1,0,2]'], ['[4,9,0,5,1]']]],
  [130, 'surroundedNarrative', 'buildSurroundedStory', [['[]'], ['[["O"]]'], ['[["O","O","O"]]'], ['[["X","X","X"],["X","O","X"],["X","X","O"]]']]],
  [131, 'partitionNarrative', 'buildPartitionStory', [['a'], ['abc'], ['aab'], ['abba']]],
  [132, 'minCutNarrative', 'buildMinCutStory', [['a'], ['aab'], ['abba'], ['abc']]],
  [133, 'cloneGraphNarrative', 'buildCloneGraphStory', [['[]'], ['[[]]'], ['[[2],[1]]'], ['[[2,4],[1,3],[2,4],[1,3]]']]],
  [134, 'gasStationNarrative', 'buildGasStationStory', [[{ gas: [1], cost: [1] }], [{ gas: [1], cost: [2] }], [{ gas: [1,2,3,4,5], cost: [3,4,5,1,2] }]]],
  [135, 'candyNarrative', 'buildCandyStory', [['[1]'], ['[1,2,2]'], ['[1,3,2,1]'], ['[3,2,1]']]],
  [136, 'singleNumberNarrative', 'buildSingleNumberStory', [['[0]'], ['[-2,1,1]'], ['[4,1,2,1,2]']]],
  [137, 'singleNumber2Narrative', 'buildSingleNumber2Story', [['[0]'], ['[-2,1,1,1]'], ['[2,2,3,2]']]],
  [138, 'copyRandomNarrative', 'buildCopyRandomListStory', [['[]'], ['[[7,null]]'], ['[[1,0]]'], ['[[7,null],[13,0],[11,1]]']]],
  [139, 'wordBreakNarrative', 'buildWordBreakStory', [['leetcode', ['leet','code']], ['catsandog', ['cats','dog','sand','and','cat']], ['aaaa', ['a','aa']]]],
  [140, 'wordBreak2Narrative', 'buildWordBreak2Story', [['catsanddog', ['cat','cats','and','sand','dog']], ['catsandog', ['cats','dog','sand','and','cat']], ['aaaa', ['a','aa']]]],
  [141, 'hasCycleNarrative', 'buildCycleStory', [[[], -1], [[1], -1], [[1], 0], [[3,2,0,-4], 1]]],
  [142, 'detectCycle2Narrative', 'buildCycle2Story', [[[], -1], [[1], -1], [[1], 0], [[3,2,0,-4], 1]]],
];

function checkFrames(definition, story, input, label) {
  const frames = Array.isArray(story) ? story : story.frames;
  assert.ok(frames.length, `${label}: no frames`);
  const ready = resolveNarrative(definition, { step: null, story, input });
  assert.ok(ready.edgeCases?.length >= 2, `${label}: missing edge cases`);
  for (const [stepIndex, step] of frames.entries()) {
    const narrative = resolveNarrative(definition, { step, stepIndex, story, input });
    for (const key of ['goal','why','achieved','next']) {
      assert.equal(typeof narrative[key], 'string', `${label} ${step.phase}/${step.activeLine}: ${key}`);
      assert.ok(narrative[key].length > 10, `${label} ${step.phase}/${step.activeLine}: too little ${key}: ${narrative[key]}`);
      assert.doesNotMatch(narrative[key], /undefined|NaN|\[object Object\]/);
    }
    assert.ok(Number.isInteger(narrative.chapter), `${label}: unmapped ${step.phase}/${step.activeLine}`);
    assert.ok(narrative.chapter >= 0 && narrative.chapter < narrative.chapters.length);
  }
}

for (const [id, name, build, inputs] of cases) {
  test(`Problem ${id}: connected narrative covers real traces and edge inputs`, async () => {
    const folder = new URL(`../../problems/Problem${id}/`, import.meta.url);
    const definition = (await import(new URL(`${name}.js`, folder)))[name];
    const algorithm = await import(new URL('algorithm.js', folder));
    const consumers = readdirSync(folder).filter(f => f.endsWith('.jsx')).map(f => readFileSync(new URL(f, folder), 'utf8')).join('\n');
    assert.ok(consumers.includes(`narrative: ${name}`), 'Narrative must be connected to the workspace');
    for (const args of inputs) checkFrames(definition, algorithm[build](...args), args, `Problem ${id} ${JSON.stringify(args)}`);
  });
}

for (const [mode, narrative, inputs] of [
  ['perfect', perfectPointerNarrative, ['[]','[1]','[1,2,3,4,5,6,7]']],
  ['sparse', sparsePointerNarrative, ['[]','[1]','[1,2,3,null,5,null,7]']],
]) test(`${mode} next-pointer narrative`, () => {
  for (const input of inputs) checkFrames(narrative, buildNextPointerStory(input, mode), input, mode);
});
for (const [mode, narrative, inputs] of [
  ['triangle', pascalTriangleNarrative, ['1','2','5']],
  ['row', pascalRowNarrative, ['0','1','4']],
]) test(`${mode} Pascal narrative`, () => {
  for (const input of inputs) checkFrames(narrative, buildPascalStory(input, mode), input, mode);
});

test('Partitioning describes returning on line 10 without claiming a new recursion', async () => {
  const { partitionNarrative } = await import('../../problems/Problem131/partitionNarrative.js');
  const { buildPartitionStory } = await import('../../problems/Problem131/algorithm.js');
  const story = buildPartitionStory('aab');
  for (const step of story.frames.filter(f => f.phase === 'backtrack' && f.activeLine === 10)) {
    const n = resolveNarrative(partitionNarrative, { step, story });
    assert.match(n.why, /returned/);
    assert.equal(n.achieved, step.message);
  }
});
