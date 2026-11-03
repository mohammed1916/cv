import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const solve = (a, b, c) => buildTrace({ a, b, c }).result

test('worked examples', () => {
  assert.deepEqual(solve([2, 5, 8, 12, 20], [1, 5, 8, 9, 20, 30], [5, 8, 20, 40]), [5, 8, 20])
  assert.deepEqual(solve([1, 3, 5], [2, 4, 6], [7, 8]), [])
  assert.deepEqual(solve([1, 2, 9], [3, 4, 9], [5, 9]), [9])
})

test('random arrays agree with a set-based oracle', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const subset = () => Array.from({ length: 30 }, (_, v) => v).filter(() => rand(3) === 0).slice(0, 10)
  for (let t = 0; t < 300; t++) {
    const [a, b, c] = [subset(), subset(), subset()]
    if (!a.length || !b.length || !c.length) continue
    const inB = new Set(b), inC = new Set(c)
    assert.deepEqual(solve(a, b, c), a.filter(x => inB.has(x) && inC.has(x)), JSON.stringify([a, b, c]))
  }
})

test('parser enforces strictly increasing arrays and bounds', () => {
  assert.throws(() => parseInput('{"a":[1,1],"b":[1],"c":[1]}'), /strictly increasing/)
  assert.throws(() => parseInput('{"a":[],"b":[1],"c":[1]}'), /1 to 10/)
  assert.throws(() => parseInput('{"a":[100],"b":[1],"c":[1]}'), /0 to 99/)
  assert.deepEqual(parseInput('{"a":[1],"b":[2],"c":[3]}'), { a: [1], b: [2], c: [3] })
})

test('every frame has a known phase, narration and a line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ a: [1, 2, 9], b: [3, 4, 9], c: [5, 9] })
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
