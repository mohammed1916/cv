import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function arithmeticByPermutation(values) {
  const perm = (list) => list.length <= 1 ? [list] : list.flatMap((x, i) => perm([...list.slice(0, i), ...list.slice(i + 1)]).map(rest => [x, ...rest]))
  return perm(values).some(order => {
    const d = order[1] - order[0]
    return order.every((v, i) => i < 2 || v - order[i - 1] === d)
  })
}

test('1630 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 8)
  assert.ok(python.includes('def checkArithmeticSubarrays'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1630 agrees with a permutation search on small slices', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let trial = 0; trial < 200; trial++) {
    const nums = Array.from({ length: 2 + rnd(4) }, () => rnd(12))
    const l = [], r = []
    for (let a = 0; a < nums.length; a++) for (let b = a + 1; b < nums.length; b++) { l.push(a); r.push(b) }
    const run = buildTrace({ nums, l, r })
    l.forEach((a, i) => assert.equal(run.result[i], arithmeticByPermutation(nums.slice(a, r[i] + 1)), JSON.stringify({ nums, a, b: r[i] })))
  }
})

test('1630 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"l":[1],"r":[0]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"l":[0],"r":[5]}'))
})
