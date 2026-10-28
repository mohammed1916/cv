import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (words, target) => buildTrace(parseInput(JSON.stringify({ words, target }))).result

test('1639 worked examples', () => {
  assert.equal(solve(['acca', 'bbbb', 'caca'], 'aba'), 6)
  // "baab" needs four columns in order, but column 0 of "abba" is a, so no way exists.
  assert.equal(solve(['abba'], 'baab'), 0)
  // The two b columns of "abba" are columns 1 and 2, the only way to build "bb".
  assert.equal(solve(['abba'], 'bb'), 1)
  // Two words that both supply a in column 0 give two ways to pick the first letter.
  assert.equal(solve(['ab', 'ac'], 'a'), 2)
  assert.equal(solve(['a'], 'aa'), 0)
})

test('1639 rejects words of unequal length', () => {
  assert.throws(() => parseInput('{"words":["ab","abc"],"target":"a"}'))
})

// Independent oracle: choose which columns the target letters come from (in increasing order),
// and multiply the number of words that supply each letter in its chosen column.
function oracle(words, target) {
  const L = words[0].length
  let total = 0
  const pick = (start, j, product) => {
    if (j === target.length) { total += product; return }
    for (let c = start; c < L; c++) {
      const supply = words.filter(w => w[c] === target[j]).length
      if (supply > 0) pick(c + 1, j + 1, product * supply)
    }
  }
  pick(0, 0, 1)
  return total % 1000000007
}

test('1639 random dictionaries match a column-choice oracle', () => {
  let seed = 1639
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(5)
    const words = Array.from({ length: 1 + rnd(5) }, () => Array.from({ length: len }, () => 'abc'[rnd(3)]).join(''))
    const target = Array.from({ length: 1 + rnd(5) }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(words, target), oracle(words, target), JSON.stringify({ words, target }))
  }
})
