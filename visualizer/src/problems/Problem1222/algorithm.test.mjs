import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: a queen attacks when it shares a row, column or diagonal with the king and no other queen lies strictly between them.
function oracle(queens, king) {
  const key = ([r, c]) => `${r},${c}`
  const occupied = new Set(queens.map(key))
  return queens.filter(([r, c]) => {
    const dr = r - king[0], dc = c - king[1]
    const aligned = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)
    if (!aligned) return false
    const steps = Math.max(Math.abs(dr), Math.abs(dc))
    const sr = Math.sign(dr), sc = Math.sign(dc)
    for (let t = 1; t < steps; t++) if (occupied.has(`${king[0] + sr * t},${king[1] + sc * t}`)) return false
    return true
  })
}
const sorted = list => list.map(p => p.join(',')).sort()

test('nearest queens block farther ones on the same ray', () => {
  const queens = [[0, 3], [2, 3], [6, 3], [3, 0], [3, 6], [1, 1], [0, 0], [5, 5], [2, 6]]
  const king = [3, 3]
  assert.deepEqual(sorted(buildTrace({ queens, king }).result), sorted(oracle(queens, king)))
})

test('king in the corner is attacked along its row, column and diagonal', () => {
  assert.deepEqual(buildTrace({ queens: [[0, 5], [6, 0], [4, 4]], king: [0, 0] }).result, [[0, 5], [6, 0], [4, 4]])
})

test('no queen on any ray gives an empty result', () => {
  assert.deepEqual(buildTrace({ queens: [[1, 2], [2, 5], [5, 6]], king: [3, 3] }).result, [])
})

test('random boards agree with the independent oracle', () => {
  let state = 41
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return (state >>> 16) % m }
  for (let t = 0; t < 300; t++) {
    const king = [rand(8), rand(8)]
    const cells = new Set([king.join(',')])
    const queens = []
    const want = 1 + rand(12)
    while (queens.length < want) {
      const q = [rand(8), rand(8)]
      if (!cells.has(q.join(','))) { cells.add(q.join(',')); queens.push(q) }
    }
    assert.deepEqual(sorted(buildTrace({ queens, king }).result), sorted(oracle(queens, king)), JSON.stringify({ queens, king }))
  }
})

test('parseInput rejects a queen on the king square', () => {
  assert.throws(() => parseInput('{"queens":[[2,2]],"king":[2,2]}'))
  assert.throws(() => parseInput('{"queens":[[8,0]],"king":[0,0]}'))
})
