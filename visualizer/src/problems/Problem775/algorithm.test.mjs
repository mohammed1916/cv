import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = a => buildTrace(parseInput(JSON.stringify(a)))
function oracle(a) {
  let g = 0, l = 0
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) g++
  for (let i = 0; i + 1 < a.length; i++) if (a[i] > a[i + 1]) l++
  return g === l
}
function perms(a) { return a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])) }
test('official examples', () => {
  assert.equal(run([1, 0, 2]).result, true)
  assert.equal(run([1, 2, 0]).result, false)
})
test('all permutations up to n=7 match inversion counting', () => {
  for (let n = 1; n <= 7; n++) for (const p of perms(Array.from({ length: n }, (_, i) => i))) {
    const r = run(p)
    assert.equal(r.result, oracle(p), JSON.stringify(p))
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[0,0]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{}'))
})
