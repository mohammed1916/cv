import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { snakeTutorial } from './tutorial.js'
import { examples } from './presets.js'

const run = text => buildTrace(parseInput(text)).result

test('353 worked examples from the presets', () => {
  assert.deepEqual(run(examples[0].input), [0, 0, 1, 2, 2, 2])
  assert.deepEqual(run(examples[1].input), [0, -1])
  assert.deepEqual(run(examples[2].input), [1, 1, 1, 1])
  assert.deepEqual(run(examples[3].input), [1, 2, 3, 3])
  assert.deepEqual(run(examples[4].input), [1, 2, 3, -1])
})

test('353 every frame has a reason and the game ends on the first loss', () => {
  const traced = buildTrace(parseInput(examples[4].input))
  for (const frame of traced.frames) assert.ok(snakeTutorial({ run: traced, step: frame }).reason.length > 20)
  assert.equal(traced.frames.filter(frame => frame.phase === 'lose').length, 1)
})
