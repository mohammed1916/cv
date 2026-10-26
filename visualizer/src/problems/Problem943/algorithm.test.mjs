import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = w => buildTrace(parseInput(JSON.stringify(w))).result
// Oracle: try every permutation, merging with maximal overlap.
function bruteLen(words) {
  let best = Infinity
  const perm = (rest, cur) => {
    if (!rest.length) { best = Math.min(best, cur.length); return }
    rest.forEach((w, i) => {
      let k = Math.min(cur.length, w.length)
      for (; k > 0; k--) if (cur.endsWith(w.slice(0, k))) break
      perm([...rest.slice(0, i), ...rest.slice(i + 1)], cur + w.slice(k))
    })
  }
  words.forEach((w, i) => perm([...words.slice(0, i), ...words.slice(i + 1)], w))
  return best
}
test('official examples', () => {
  assert.equal(solve(['alex', 'loves', 'leetcode']).length, 'alexlovesleetcode'.length)
  assert.equal(solve(['catg', 'ctaagt', 'gcta', 'ttca', 'atgcatc']).length, 16)
})
test('random word sets: valid and length-optimal', () => {
  let seed = 9; const rnd = n => Math.floor(((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * n)
  let tested = 0
  for (let t = 0; t < 3000 && tested < 200; t++) {
    const words = [...new Set(Array.from({ length: 1 + rnd(5) }, () => Array.from({ length: 1 + rnd(4) }, () => 'abc'[rnd(3)]).join('')))]
    let res
    try { res = solve(words) } catch { continue }
    tested++
    assert.ok(words.every(w => res.includes(w)), JSON.stringify(words))
    assert.equal(res.length, bruteLen(words), JSON.stringify(words))
  }
  assert.ok(tested > 50)
})
test('rejects bad input', () => {
  for (const bad of ['[]', '["a","a"]', '["ab","b"]', '["A"]', '"x"', '["a","b","c","d","e","f","g","h","i"]']) assert.throws(() => parseInput(bad))
})
