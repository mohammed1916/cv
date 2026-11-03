import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n))).result

// Independent oracle: enumerate every permutation and test gcd at each position.
function oracle(n) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
  let total = 0
  const perm = []
  const used = Array(n + 1).fill(false)
  const rec = pos => {
    if (pos > n) {
      total += 1
      return
    }
    for (let v = 1; v <= n; v++) {
      if (used[v] || gcd(pos, v) !== 1) continue
      used[v] = true
      perm[pos] = v
      rec(pos + 1)
      used[v] = false
    }
  }
  rec(1)
  return total
}

test('2992 n equals 1 and 2 by hand', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(2), 1)
})

test('2992 matches the enumeration oracle for every allowed n', () => {
  for (let n = 1; n <= 6; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})

test('2992 rejects inputs outside the visualization range', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('7'))
  assert.throws(() => parseInput('2.5'))
  assert.throws(() => parseInput('abc'))
})

test('2992 frames stay inside the pseudocode and python ranges', () => {
  const pyLines = python.trim().split('\n').length
  for (const n of [1, 3, 5]) {
    const run = buildTrace(n)
    assert.ok(run.frames.length > 0)
    for (const frame of run.frames) {
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
      assert.equal(frame.perm.length, n)
      assert.equal(frame.used.length, n)
      assert.equal(typeof frame.message, 'string')
    }
    assert.equal(run.frames.at(-1).phase, 'done')
    assert.equal(run.frames.at(-1).count, run.result)
  }
})

test('2992 every placed value has gcd 1 with its position in the final frame', () => {
  const run = buildTrace(5)
  const counted = run.frames.filter(f => f.phase === 'count')
  assert.equal(counted.length, run.result)
  for (const frame of counted) {
    frame.perm.forEach((v, i) => assert.equal(gcdOf(i + 1, v), 1))
  }
})

function gcdOf(a, b) {
  return b === 0 ? a : gcdOf(b, a % b)
}
