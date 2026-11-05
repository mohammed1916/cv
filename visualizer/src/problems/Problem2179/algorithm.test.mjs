import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (a, b) => buildTrace(parseInput(JSON.stringify({ nums1: a, nums2: b }))).result

test('2179 worked examples', () => {
  assert.equal(solve([2, 0, 1, 3], [0, 1, 2, 3]), 1)
  assert.equal(solve([4, 0, 1, 3, 2], [4, 1, 0, 2, 3]), 4)
  assert.equal(solve([0, 1, 2], [0, 1, 2]), 1)
  assert.equal(solve([0, 1, 2], [2, 1, 0]), 0)
})

test('2179 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums1":[0,1],"nums2":[0,1]}'))
  assert.throws(() => parseInput('{"nums1":[0,1,1],"nums2":[0,1,2]}'))
  assert.throws(() => parseInput('{"nums1":[0,1,2],"nums2":[0,1]}'))
})

function oracle(a, b) {
  const n = a.length
  const p1 = []; const p2 = []
  a.forEach((v, i) => { p1[v] = i }); b.forEach((v, i) => { p2[v] = i })
  let c = 0
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) {
    if (new Set([x, y, z]).size < 3) continue
    if (p1[x] < p1[y] && p1[y] < p1[z] && p2[x] < p2[y] && p2[y] < p2[z]) c++
  }
  return c
}

test('2179 random permutations match a triple enumeration', () => {
  let seed = 2179
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const shuffle = n => { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]] } return a }
  for (let t = 0; t < 150; t++) {
    const n = 3 + rnd(5)
    const a = shuffle(n); const b = shuffle(n)
    assert.equal(solve(a, b), oracle(a, b), JSON.stringify([a, b]))
  }
})

test('2179 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"nums1":[0,1,2],"nums2":[0,1,2]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
