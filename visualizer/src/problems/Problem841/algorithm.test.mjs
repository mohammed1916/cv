import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function closure(rooms) {
  const n = rooms.length
  const reach = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j))
  rooms.forEach((ks, i) => ks.forEach(k => { reach[i][k] = true }))
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (reach[i][k] && reach[k][j]) reach[i][j] = true
  return reach[0].every(Boolean)
}
test('official examples', () => {
  assert.equal(buildTrace([[1], [2], [3], []]).result, true)
  assert.equal(buildTrace([[1, 3], [3, 0, 1], [2], [0]]).result, false)
})
test('random graphs match Floyd-Warshall closure', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 500; t++) {
    const n = 2 + rnd(8)
    const rooms = Array.from({ length: n }, () => Array.from({ length: rnd(3) }, () => rnd(n)))
    const tr = buildTrace(rooms)
    assert.equal(tr.result, closure(rooms), JSON.stringify(rooms))
    assert.equal(tr.frames[0].phase, 'start'); assert.equal(tr.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[[5],[]]')); assert.throws(() => parseInput('[[]]')); assert.throws(() => parseInput('{}'))
})
