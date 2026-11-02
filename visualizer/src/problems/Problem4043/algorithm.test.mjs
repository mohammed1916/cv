import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python, code } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).answer

test('4043 worked example', () => {
  // Rotations of aabb: aabb (2 pairs), abba (1), bbaa (2), baab (1). Two have exactly 2.
  assert.equal(solve('aabb', 2), 2)
})

test('4043 more examples and edge cases', () => {
  // All four rotations of abab have no equal neighbours.
  assert.equal(solve('abab', 0), 4)
  // Every rotation of aaaa has three equal neighbours.
  assert.equal(solve('aaaa', 3), 4)
  assert.equal(solve('aaaa', 2), 0)
  // Length 2: 'ab' rotates to 'ba' with no pair; 'aa' has one pair in both positions.
  assert.equal(solve('ab', 0), 2)
  assert.equal(solve('aa', 1), 2)
})

test('4043 parse rules', () => {
  assert.throws(() => parseInput('{"s":"a","k":0}'))
  assert.throws(() => parseInput('{"s":"ab","k":2}'))
  assert.throws(() => parseInput('{"s":"aB","k":0}'))
  assert.throws(() => buildTrace({ s: 'a'.repeat(13), k: 0 }))
})

// Independent oracle: build each rotation by a different method (sorted slices joined) and count pairs with zip.
function oracle(s, k) {
  let count = 0
  for (let p = 0; p < s.length; p++) {
    const rotated = [...s.slice(p), ...s.slice(0, p)]
    const pairs = rotated.slice(0, -1).filter((c, i) => c === rotated[i + 1]).length
    if (pairs === k) count++
  }
  return count
}

test('4043 random strings match a zip-based oracle', () => {
  let seed = 4043
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 400; t++) {
    const n = 2 + rnd(9)
    const s = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    const k = rnd(n)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})

test('4043 frame invariants', () => {
  const codeLines = new Set(code.map(c => c.line))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ s: 'aabb', k: 2 }).frames) {
    assert.ok(codeLines.has(frame.activeLine), `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, `pythonLine ${frame.pythonLine}`)
    assert.equal(typeof frame.message, 'string')
  }
})

test('4043 python export runs on the first example', () => {
  const out = execFileSync('python3', ['-I', '-c', python], { input: '{"s":"aabb","k":2}' }).toString().trim()
  assert.equal(out, '2')
})
