import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2152 worked examples', () => {
  assert.equal(solve('[[0,0],[1,1],[2,2],[0,3]]'), 2)
  assert.equal(solve('[[0,0],[1,0],[0,1],[1,1]]'), 2)
  assert.equal(solve('[[0,0],[1,1]]'), 1)
  assert.equal(solve('[[0,0],[1,1],[2,2],[3,3]]'), 1)
  assert.equal(solve('[[5,5]]'), 1)
})

test('2152 rejects malformed points', () => {
  assert.throws(() => parseInput('[[0,0],[0,0]]'))
  assert.throws(() => parseInput('[[0.5,1]]'))
  assert.throws(() => parseInput('[[0,0],[1]]'))
})

// Oracle: enumerate subsets of candidate lines (all pair lines and single points) in size order.
function oracle(points) {
  const n = points.length
  const cross = (i, j, k) => (points[j][0] - points[i][0]) * (points[k][1] - points[i][1]) - (points[j][1] - points[i][1]) * (points[k][0] - points[i][0]) === 0
  const masks = new Set()
  for (let i = 0; i < n; i++) {
    masks.add(1 << i)
    for (let j = i + 1; j < n; j++) {
      let m = 0
      for (let k = 0; k < n; k++) if (cross(i, j, k)) m |= 1 << k
      masks.add(m)
    }
  }
  const list = [...masks]
  const full = (1 << n) - 1
  for (let size = 1; size <= n; size++) {
    const pick = (start, count, acc) => {
      if (count === 0) return acc === full
      for (let s = start; s < list.length; s++) if (pick(s + 1, count - 1, acc | list[s])) return true
      return false
    }
    if (pick(0, size, 0)) return size
  }
  return n
}

test('2152 random point sets match a line-subset oracle', () => {
  let seed = 2152
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(5)
    const set = new Set()
    while (set.size < n) set.add(`${rnd(5)},${rnd(5)}`)
    const points = [...set].map(s => s.split(',').map(Number))
    assert.equal(solve(JSON.stringify(points)), oracle(points), JSON.stringify(points))
  }
})

test('2152 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[[0,0],[1,1],[2,2],[0,3]]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
