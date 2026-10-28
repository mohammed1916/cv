import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2257 official examples', () => {
  assert.equal(solve({ m: 4, n: 6, guards: [[0, 0], [1, 1], [2, 3]], walls: [[0, 1], [2, 2], [1, 4]] }), 7)
  assert.equal(solve({ m: 3, n: 3, guards: [[1, 1]], walls: [[0, 1], [1, 0], [2, 1], [1, 2]] }), 4)
})

test('2257 a wall shields the cells behind it', () => {
  // The guard sees row 0 to the left and right of its column; the wall at (0, 2) hides column 3 on the right.
  assert.equal(solve({ m: 1, n: 4, guards: [[0, 0]], walls: [[0, 2]] }), 1)
})

test('2257 rejects a guard on a wall', () => {
  assert.throws(() => parseInput('{"m":2,"n":2,"guards":[[0,0]],"walls":[[0,0]]}'))
})

// Independent oracle: for each empty cell, look outward in four directions for a guard with no wall in between.
function oracle({ m, n, guards, walls }) {
  const guardSet = new Set(guards.map(g => g.join(',')))
  const wallSet = new Set(walls.map(w => w.join(',')))
  let count = 0
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (guardSet.has(`${r},${c}`) || wallSet.has(`${r},${c}`)) continue
      let seen = false
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        for (let k = 1; ; k++) {
          const rr = r + dr * k
          const cc = c + dc * k
          if (rr < 0 || rr >= m || cc < 0 || cc >= n || wallSet.has(`${rr},${cc}`)) break
          if (guardSet.has(`${rr},${cc}`)) {
            seen = true
            break
          }
        }
        if (seen) break
      }
      if (!seen) count++
    }
  }
  return count
}

test('2257 random grids match a per-cell oracle', () => {
  let seed = 2257
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(6)
    const all = []
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) all.push([r, c])
    for (let i = all.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[all[i], all[j]] = [all[j], all[i]]
    }
    const guardCount = rnd(Math.min(6, all.length) + 1)
    const wallCount = rnd(Math.min(6, all.length - guardCount) + 1)
    const input = { m, n, guards: all.slice(0, guardCount), walls: all.slice(guardCount, guardCount + wallCount) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
