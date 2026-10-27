import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (words_container, words_query) => buildTrace({ words_container, words_query }).result

test('3093 official example', () => {
  assert.deepEqual(solve(['abcd', 'bcd', 'xbcd'], ['cd', 'bcd', 'xyz']), [1, 1, 1])
})

test('3093 a tie on suffix length goes to the shorter word, then the earlier index', () => {
  assert.deepEqual(solve(['ab', 'xb', 'cb'], ['b']), [0])
  assert.deepEqual(solve(['zzab', 'ab'], ['qab']), [1])
})

test('3093 rejects an empty query list', () => {
  assert.throws(() => parseInput('{"words_container":["a"],"words_query":[]}'))
})

// Independent oracle: score each container word against each query by its common suffix length.
function oracle(container, queries) {
  return queries.map(q => {
    let best = 0
    for (let j = 1; j < container.length; j++) {
      const common = (w) => {
        let k = 0
        while (k < w.length && k < q.length && w[w.length - 1 - k] === q[q.length - 1 - k]) k++
        return k
      }
      const a = common(container[j])
      const b = common(container[best])
      if (a > b || (a === b && container[j].length < container[best].length)) best = j
    }
    return best
  })
}

test('3093 random inputs match a per-word scoring oracle', () => {
  let seed = 3093
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = () => Array.from({ length: 1 + rnd(4) }, () => 'ab'[rnd(2)]).join('')
  for (let t = 0; t < 300; t++) {
    const container = Array.from({ length: 1 + rnd(6) }, word)
    const queries = Array.from({ length: 1 + rnd(4) }, word)
    assert.deepEqual(solve(container, queries), oracle(container, queries), JSON.stringify({ container, queries }))
  }
})
