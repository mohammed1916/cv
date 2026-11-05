import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

// Brute force: for each target, the climbs before it are covered by ladders on the largest ones.
function brute(heights, bricks, ladders) {
  let best = 0
  for (let target = 1; target < heights.length; target++) {
    const climbs = []
    for (let i = 0; i < target; i++) if (heights[i + 1] > heights[i]) climbs.push(heights[i + 1] - heights[i])
    climbs.sort((a, b) => b - a)
    const rest = climbs.slice(ladders).reduce((s, x) => s + x, 0)
    if (rest <= bricks) best = target
    else break
  }
  return best
}

test('1642 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('def furthestBuilding'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1642 matches a brute force search', () => {
  let seed = 17
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const heights = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(9))
    const bricks = rnd(12), ladders = rnd(4)
    assert.equal(buildTrace({ heights, bricks, ladders }).result, brute(heights, bricks, ladders), JSON.stringify({ heights, bricks, ladders }))
  }
})

test('1642 rejects invalid input', () => {
  assert.throws(() => parseInput('{"heights":[0],"bricks":1,"ladders":1}'))
  assert.throws(() => parseInput('{"heights":[1],"bricks":-1,"ladders":1}'))
})
