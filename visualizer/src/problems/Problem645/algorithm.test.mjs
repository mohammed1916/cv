import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('645 official examples', () => {
  assert.deepEqual(buildTrace([1, 2, 2, 4]).result, [2, 3])
  assert.deepEqual(buildTrace([1, 1]).result, [1, 2])
})

test('645 every damaged permutation up to n=6 matches a sorted-scan oracle', () => {
  for (let n = 2; n <= 6; n++) {
    // Every array of length n over 1..n that is a permutation with one value copied over another.
    function visit(a) {
      if (a.length === n) {
        const counts = Array.from({ length: n + 1 }, (_, v) => a.filter(x => x === v).length).slice(1)
        // A damaged permutation has exactly one value twice, one value zero times, and all others once.
        if (counts.filter(c => c === 2).length === 1 && counts.filter(c => c === 0).length === 1 && counts.every(c => c <= 2)) {
          const dup = counts.indexOf(2) + 1, missing = counts.indexOf(0) + 1
          assert.deepEqual(buildTrace(a).result, [dup, missing], JSON.stringify(a))
        }
        return
      }
      for (let v = 1; v <= n; v++) visit([...a, v])
    }
    visit([])
  }
})

test('645 rejects an intact permutation', () => {
  assert.throws(() => parseInput('[1,2,3]'))
})
