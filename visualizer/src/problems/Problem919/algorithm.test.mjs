import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const run = o => buildTrace(parseInput(JSON.stringify(o)))
test('official example', () => {
  const r = run({ tree: [1, 2], ops: [['insert', 3], ['insert', 4], ['get_root']] })
  assert.deepEqual(r.result, [1, 2, 1])
  assert.deepEqual(r.finalValues, [1, 2, 3, 4])
})
test('parent of each insert matches heap index arithmetic', () => {
  let seed = 41
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  for (let t = 0; t < 200; t++) {
    const tree = Array.from({ length: 1 + rnd(12) }, () => rnd(5000))
    const ops = Array.from({ length: rnd(30) + 1 }, () => rnd(4) ? ['insert', rnd(5000)] : ['get_root'])
    const values = [...tree], expected = []
    for (const op of ops) {
      if (op[0] === 'get_root') expected.push(values[0])
      else { expected.push(values[(values.length - 1) >> 1]); values.push(op[1]) }
    }
    const r = run({ tree, ops })
    assert.deepEqual(r.result, expected)
    assert.deepEqual(r.finalValues, values)
  }
})
test('ends done, rejects bad input', () => {
  assert.equal(run({ tree: [1], ops: [] }).frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('{"tree":[1,null,2],"ops":[]}'))
  assert.throws(() => parseInput('{"tree":[1],"ops":[["pop"]]}'))
  assert.throws(() => parseInput('{"tree":[],"ops":[]}'))
})
