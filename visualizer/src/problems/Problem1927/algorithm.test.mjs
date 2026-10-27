import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace(parseInput(JSON.stringify({ num }))).result

test('1927 official examples', () => {
  assert.equal(solve('5023'), false)
  assert.equal(solve('25??'), true)
  assert.equal(solve('?3295???'), false)
})

test('1927 rejects an odd length and a letter', () => {
  assert.throws(() => parseInput('{"num":"123"}'))
  assert.throws(() => parseInput('{"num":"12a4"}'))
})

// Independent oracle: full minimax over every way to fill the question marks.
// Alice moves first and fills one ?; the final sums decide the game: Alice wins when the halves differ.
function oracle(num) {
  const memo = new Map()
  const sumOf = s => [...s].reduce((t, c) => t + Number(c), 0)
  const win = (s, aliceTurn) => {
    const key = s + (aliceTurn ? 'A' : 'B')
    if (memo.has(key)) return memo.get(key)
    const spots = [...s].map((c, i) => (c === '?' ? i : -1)).filter(i => i >= 0)
    let result
    if (spots.length === 0) {
      const h = s.length / 2
      result = sumOf(s.slice(0, h)) !== sumOf(s.slice(h))
    } else {
      const outcomes = []
      for (const i of spots) {
        for (let d = 0; d <= 9; d++) outcomes.push(win(s.slice(0, i) + d + s.slice(i + 1), !aliceTurn))
      }
      result = aliceTurn ? outcomes.some(Boolean) : outcomes.every(Boolean)
    }
    memo.set(key, result)
    return result
  }
  return win(num, true)
}

test('1927 random strings match a minimax oracle', () => {
  let seed = 1927
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const length = 2 * (1 + rnd(3))
    let num = ''
    let questions = 0
    for (let i = 0; i < length; i++) {
      if (questions < 4 && rnd(3) === 0) { num += '?'; questions++ } else num += String(rnd(10))
    }
    assert.equal(solve(num), oracle(num), num)
  }
})
