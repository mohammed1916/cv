import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, similar } from './algorithm.js'

function brute(strs) {
  // Components by breadth-first search over the similarity relation.
  const n = strs.length, seen = new Array(n).fill(false)
  let groups = 0
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue
    groups++
    const queue = [s]; seen[s] = true
    while (queue.length) {
      const i = queue.shift()
      for (let j = 0; j < n; j++) if (!seen[j] && similar(strs[i], strs[j])) { seen[j] = true; queue.push(j) }
    }
  }
  return groups
}

test('839 worked examples', () => {
  assert.equal(buildTrace(['tars', 'rats', 'arts', 'star']).result, 2)
  assert.equal(buildTrace(['omv', 'ovm']).result, 1)
})

test('839 random small sets match a breadth-first component count', () => {
  let state = 839
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const base = ['abc', 'acb', 'bac', 'bca', 'cab', 'cba']
  for (let t = 0; t < 300; t++) {
    const strs = Array.from({ length: 1 + rand(8) }, () => base[rand(base.length)])
    assert.equal(buildTrace(strs).result, brute(strs), JSON.stringify(strs))
  }
})

test('839 rejects strings of different lengths', () => {
  assert.throws(() => parseInput('["ab","abc"]'))
})
