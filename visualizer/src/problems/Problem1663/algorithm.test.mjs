import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (n, k) => buildTrace({ n, k }).result
const valueOf = word => [...word].reduce((sum, ch) => sum + ch.charCodeAt(0) - 96, 0)

test('1663 teaching cases return the expected strings', () => {
  assert.equal(solve(1, 26), 'z')
  assert.equal(solve(2, 2), 'aa')
  assert.equal(solve(3, 27), 'aay')
  assert.equal(solve(5, 73), 'aaszz')
})

test('1663 rejects malformed input', () => {
  assert.throws(() => parseInput('{"n":0,"k":5}'), /n/)
  assert.throws(() => parseInput('{"n":3,"k":2}'), /k/)
  assert.throws(() => parseInput('{"n":2,"k":53}'), /k/)
  assert.throws(() => parseInput('[3,27]'), /object/)
})

// Independent oracle: enumerate strings in lexicographic order and keep the first one whose letter values sum to k.
function enumerateMinimum(n, k) {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const indices = Array(n).fill(0)
  for (;;) {
    const word = indices.map(i => letters[i]).join('')
    if (valueOf(word) === k) return word
    let pos = n - 1
    while (pos >= 0 && indices[pos] === 25) { indices[pos] = 0; pos -= 1 }
    if (pos < 0) return null
    indices[pos] += 1
  }
}

test('1663 matches an exhaustive lexicographic oracle for small lengths', () => {
  for (let n = 1; n <= 3; n++) {
    for (let k = n; k <= 26 * n; k++) assert.equal(solve(n, k), enumerateMinimum(n, k), `n=${n} k=${k}`)
  }
})

test('1663 larger lengths are valid and never place a value above 26', () => {
  for (let n = 4; n <= 12; n++) {
    for (const k of [n, 26 * n, Math.floor((n * 26 + n) / 2)]) {
      const word = solve(n, k)
      assert.equal(word.length, n)
      assert.equal(valueOf(word), k)
      assert.ok([...word].every(ch => ch >= 'a' && ch <= 'z'))
    }
  }
})

test('1663 frames point to valid code and Python lines', () => {
  const { frames } = buildTrace({ n: 4, k: 40 })
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(phaseIds.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
  }
})
