import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3305 official examples', () => {
  assert.equal(solve({ word: 'aeioqq', k: 1 }), 0)
  assert.equal(solve({ word: 'aeiou', k: 0 }), 1)
  assert.equal(solve({ word: 'ieaouqqieaouqq', k: 1 }), 3)
})

test('3305 rejects an uppercase letter', () => {
  assert.throws(() => parseInput('{"word":"Aeiou","k":0}'))
})

// Independent oracle: examine every substring and count its distinct vowels and consonants.
function oracle({ word, k }) {
  let count = 0
  for (let i = 0; i < word.length; i++) {
    for (let j = i; j < word.length; j++) {
      const part = word.slice(i, j + 1)
      const vowels = new Set([...part].filter(c => 'aeiou'.includes(c)))
      const consonants = [...part].filter(c => !'aeiou'.includes(c)).length
      if (vowels.size === 5 && consonants === k) count++
    }
  }
  return count
}

test('3305 seeded random words match substring enumeration', () => {
  let seed = 3305
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'aeioubcdfg'
  for (let t = 0; t < 300; t++) {
    let word = ''
    const length = 1 + rnd(14)
    for (let i = 0; i < length; i++) word += alphabet[rnd(alphabet.length)]
    const input = { word, k: rnd(5) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
