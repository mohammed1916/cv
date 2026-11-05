import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (text, pattern) => buildTrace(parseInput(JSON.stringify({ text, pattern }))).result

test('2207 worked examples', () => {
  assert.equal(solve('abdcdbc', 'ac'), 4)
  assert.equal(solve('aabb', 'ab'), 6)
  assert.equal(solve('xyz', 'aa'), 0)
  assert.equal(solve('aaa', 'aa'), 6)
})

test('2207 rejects invalid input', () => {
  assert.throws(() => parseInput('{"text":"ab","pattern":"a"}'))
  assert.throws(() => parseInput('{"text":"AB","pattern":"ab"}'))
  assert.throws(() => parseInput('{"text":"ab","pattern":"abc"}'))
})

// Oracle: insert each of the 26 letters at the start or end, count the subsequences directly, keep the best.
function countSub(text, pattern) {
  let count = 0
  const go = (i, j) => {
    if (j === pattern.length) { count++; return }
    for (let k = i; k < text.length; k++) if (text[k] === pattern[j]) go(k + 1, j + 1)
  }
  go(0, 0)
  return count
}

test('2207 random strings match an insertion oracle', () => {
  let seed = 2207
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const text = Array.from({ length: 1 + rnd(7) }, () => 'abc'[rnd(3)]).join('')
    const pattern = 'abc'[rnd(3)] + 'abc'[rnd(3)]
    let best = countSub(text, pattern)
    for (const ch of 'abc') {
      best = Math.max(best, countSub(ch + text, pattern), countSub(text + ch, pattern))
    }
    assert.equal(solve(text, pattern), best, `${text} ${pattern}`)
  }
})

test('2207 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"text":"abdcdbc","pattern":"ac"}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
