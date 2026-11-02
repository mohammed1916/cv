import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = words => buildTrace({ words }).result

test('2899 worked examples', () => {
  assert.deepEqual(solve(['1', '2', 'prev', 'prev', 'prev']), [2, 1, -1])
  assert.deepEqual(solve(['1', 'prev', '2', 'prev', 'prev']), [1, 2, 1])
})

test('2899 edge cases', () => {
  assert.deepEqual(solve(['prev']), [-1])
  assert.deepEqual(solve(['100']), [])
  assert.deepEqual(solve(['5', 'prev', 'prev']), [5, -1])
  assert.throws(() => parseInput('["0"]'))
  assert.throws(() => parseInput('["101"]'))
})

test('2899 every frame names the python line it executes', () => {
  const lines = python.split('\n')
  for (const frame of buildTrace({ words: ['1', 'prev', '2', 'prev', 'prev'] }).frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
  }
})

// Independent oracle: for each prev, count the run of prevs ending there and index the integers before it.
function oracle(words) {
  const out = []
  for (let i = 0; i < words.length; i++) {
    if (words[i] !== 'prev') continue
    let k = 0
    for (let j = i; j >= 0 && words[j] === 'prev'; j--) k++
    const before = words.slice(0, i - k + 1).filter(w => w !== 'prev').map(Number)
    out.push(k <= before.length ? before[before.length - k] : -1)
  }
  return out
}

test('2899 random inputs match a direct oracle', () => {
  let seed = 2899
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(12) }, () => (rnd(3) === 0 ? 'prev' : String(1 + rnd(9))))
    assert.deepEqual(solve(words), oracle(words), JSON.stringify(words))
  }
})
