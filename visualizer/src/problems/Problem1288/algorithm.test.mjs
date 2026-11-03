import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = iv => buildTrace(parseInput(JSON.stringify(iv))).result

test('1288 sample inputs count the uncovered intervals', () => {
  assert.equal(solve([[1, 4], [2, 3], [5, 7]]), 2)
  assert.equal(solve([[0, 10], [2, 4], [3, 9], [9, 12]]), 2)
  assert.equal(solve([[4, 6]]), 1)
})

test('1288 an interval sharing one endpoint with a larger one is still covered', () => {
  assert.equal(solve([[1, 5], [1, 3]]), 1)
  assert.equal(solve([[1, 3], [1, 5]]), 1)
})

test('1288 frames use declared phases, valid line numbers and end on done', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([[1, 2], [0, 5]])
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1, f.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('1288 rejects malformed or duplicate intervals', () => {
  assert.throws(() => parseInput('[[3,1]]'), /0 <= start <= end/)
  assert.throws(() => parseInput('[[1,2],[1,2]]'), /distinct/)
  assert.throws(() => parseInput('{}'), /JSON array/)
})

test('1288 random distinct intervals match a pairwise coverage oracle', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const set = new Set()
    const count = 1 + rnd(10)
    while (set.size < count) { const a = rnd(20); const b = a + rnd(10); set.add(`${a},${b}`) }
    const iv = [...set].map(s => s.split(',').map(Number))
    let expected = 0
    for (let i = 0; i < iv.length; i++) {
      const covered = iv.some((o, j) => j !== i && o[0] <= iv[i][0] && iv[i][1] <= o[1])
      if (!covered) expected++
    }
    assert.equal(solve(iv), expected, JSON.stringify(iv))
  }
})
