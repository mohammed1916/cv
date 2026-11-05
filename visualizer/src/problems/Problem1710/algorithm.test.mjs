import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute({ boxTypes, truckSize }) {
  let best = 0
  const go = (i, room, units) => {
    if (i === boxTypes.length) { best = Math.max(best, units); return }
    const [count, per] = boxTypes[i]
    for (let take = 0; take <= Math.min(count, room); take++) go(i + 1, room - take, units + take * per)
  }
  go(0, truckSize, 0)
  return best
}

test('1710 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('def maximumUnits'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1710 matches an exhaustive split of the truck', () => {
  let seed = 111
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 200; t++) {
    const boxTypes = Array.from({ length: 1 + rnd(4) }, () => [1 + rnd(4), 1 + rnd(9)])
    const truckSize = 1 + rnd(8)
    assert.equal(buildTrace({ boxTypes, truckSize }).result, brute({ boxTypes, truckSize }), JSON.stringify({ boxTypes, truckSize }))
  }
})

test('1710 rejects invalid input', () => {
  assert.throws(() => parseInput('{"boxTypes":[[0,1]],"truckSize":1}'))
})
