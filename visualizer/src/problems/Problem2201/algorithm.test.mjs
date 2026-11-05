import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, artifacts, dig) => buildTrace(parseInput(JSON.stringify({ n, artifacts, dig }))).result

test('2201 worked examples', () => {
  assert.equal(solve(3, [[0, 0, 0, 0], [0, 1, 1, 2]], [[0, 0], [0, 1], [1, 1], [1, 2]]), 1)
  assert.equal(solve(2, [[0, 0, 1, 1]], [[0, 0], [1, 1]]), 0)
  assert.equal(solve(2, [[0, 0, 1, 1]], [[0, 0], [0, 1], [1, 0], [1, 1]]), 1)
  assert.equal(solve(4, [[0, 0, 0, 3], [2, 2, 3, 2]], [[0, 0], [0, 1], [0, 2], [0, 3], [2, 2], [3, 2]]), 2)
})

test('2201 rejects invalid input', () => {
  assert.throws(() => parseInput('{"n":2,"artifacts":[[1,0,0,0]],"dig":[]}'))
  assert.throws(() => parseInput('{"n":2,"artifacts":[[0,0,2,0]],"dig":[]}'))
  assert.throws(() => parseInput('{"n":2,"artifacts":[[0,0,0,0]],"dig":[[2,0]]}'))
})

test('2201 random layouts match a direct cell check', () => {
  let seed = 2201
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(5)
    const artifacts = Array.from({ length: 1 + rnd(4) }, () => {
      const r1 = rnd(n); const c1 = rnd(n)
      return [r1, c1, r1 + rnd(n - r1), c1 + rnd(n - c1)]
    })
    const dig = []
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (rnd(3) > 0) dig.push([r, c])
    const set = new Set(dig.map(([r, c]) => `${r},${c}`))
    let expected = 0
    for (const [r1, c1, r2, c2] of artifacts) {
      let all = true
      for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) if (!set.has(`${r},${c}`)) all = false
      if (all) expected++
    }
    assert.equal(solve(n, artifacts, dig), expected, JSON.stringify({ n, artifacts, dig }))
  }
})

test('2201 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"n":2,"artifacts":[[0,0,0,0]],"dig":[[0,0]]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
