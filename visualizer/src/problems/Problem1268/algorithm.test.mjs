import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (products, searchWord) => buildTrace({ products, searchWord }).result

test('1268 sample inputs give sorted prefix suggestions', () => {
  // Sorted order is beach, bead, bear, bell, so the first three starting with "be" are the same for each prefix.
  assert.deepEqual(solve(['bear', 'bell', 'beach', 'bead'], 'be'), [
    ['beach', 'bead', 'bear'],
    ['beach', 'bead', 'bear'],
  ])
})

test('1268 at most three suggestions and empty lists for absent prefixes', () => {
  assert.deepEqual(solve(['a', 'ab', 'abc', 'abd', 'abe'], 'ab'), [['a', 'ab', 'abc'], ['ab', 'abc', 'abd']])
  assert.deepEqual(solve(['cat'], 'dog'), [[], [], []])
})

test('1268 rejects malformed input', () => {
  assert.throws(() => parseInput('{"products":["Bad"],"searchWord":"b"}'), /products/)
  assert.throws(() => parseInput('{"products":["ok"],"searchWord":""}'), /searchWord/)
  assert.throws(() => parseInput('["ok"]'), /object/)
})

// Independent oracle: filter, sort, and cut to three for each prefix.
test('1268 random inputs match a filter-and-sort oracle', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 200; t++) {
    const products = Array.from({ length: 1 + rnd(10) }, () => word(1 + rnd(4)))
    const searchWord = word(1 + rnd(5))
    const input = JSON.stringify({ products, searchWord })
    parseInput(input)
    const expected = Array.from({ length: searchWord.length }, (_, k) => {
      const prefix = searchWord.slice(0, k + 1)
      return [...products].sort().filter(p => p.startsWith(prefix)).slice(0, 3)
    })
    assert.deepEqual(solve(products, searchWord), expected, input)
  }
})
