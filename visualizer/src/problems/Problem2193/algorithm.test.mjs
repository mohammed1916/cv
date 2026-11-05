import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2193 worked examples', () => {
  assert.equal(solve('aabb'), 2)
  assert.equal(solve('abca'), 1)
  assert.equal(solve('racecar'), 0)
  assert.equal(solve('zyxzy'), 1)
})

test('2193 rejects invalid input', () => {
  assert.throws(() => parseInput('AB'))
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('a'.repeat(13)))
})

// Oracle: breadth-first search over adjacent swaps until the string reads the same both ways.
function oracle(s) {
  const isPal = t => t === [...t].reverse().join('')
  let frontier = [s]
  const seen = new Set([s])
  for (let depth = 0; ; depth++) {
    if (frontier.some(isPal)) return depth
    const next = []
    for (const t of frontier) {
      for (let k = 0; k + 1 < t.length; k++) {
        const u = t.slice(0, k) + t[k + 1] + t[k] + t.slice(k + 2)
        if (!seen.has(u)) { seen.add(u); next.push(u) }
      }
    }
    frontier = next
    if (!frontier.length) return Infinity
  }
}

test('2193 small strings match a breadth-first oracle', () => {
  let seed = 2193
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const s = Array.from({ length: 1 + rnd(7) }, () => 'abc'[rnd(3)]).join('')
    const odd = [...'abc'].filter(ch => s.split(ch).length % 2 === 0).length
    if (odd > 1) continue
    assert.equal(solve(s), oracle(s), s)
  }
})

test('2193 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('aabb')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
