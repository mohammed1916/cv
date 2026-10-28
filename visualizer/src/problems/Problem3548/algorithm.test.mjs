import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('3548 official examples', () => {
  assert.equal(solve([[1, 4], [2, 3]]), true)
  assert.equal(solve([[1, 2], [3, 4]]), true)
  assert.equal(solve([[1, 2, 4], [2, 3, 5]]), false)
  assert.equal(solve([[4, 1, 8], [3, 2, 6]]), false)
})

test('3548 a one-by-two grid splits into two single cells', () => {
  assert.equal(solve([[1, 1]]), true)
})

test('3548 rejects ragged rows', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]]}'))
})

// Independent oracle: rebuild each cut from explicit cell lists and flood-fill the leftover cells with a queue.
function oracle(grid) {
  const m = grid.length
  const n = grid[0].length
  const cells = []
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) cells.push({ r, c, v: grid[r][c] })
  const total = cells.reduce((s, x) => s + x.v, 0)
  const floodOk = list => {
    if (list.length <= 1) return true
    const seen = new Set([0])
    const queue = [0]
    while (queue.length) {
      const i = queue.shift()
      list.forEach((b, j) => {
        if (!seen.has(j) && Math.abs(list[i].r - b.r) + Math.abs(list[i].c - b.c) === 1) { seen.add(j); queue.push(j) }
      })
    }
    return seen.size === list.length
  }
  const works = (side, other) => {
    const sideSum = side.reduce((s, x) => s + x.v, 0)
    const otherSum = total - sideSum
    if (sideSum === otherSum) return true
    const discount = (list, sum, target) => list.some((x, i) => sum - x.v === target && floodOk(list.filter((_, j) => j !== i)))
    return discount(side, sideSum, otherSum) || discount(other, otherSum, sideSum)
  }
  const splits = []
  for (let r = 0; r < m - 1; r++) splits.push(cells.filter(x => x.r <= r))
  for (let c = 0; c < n - 1; c++) splits.push(cells.filter(x => x.c <= c))
  return splits.some(top => works(top, cells.filter(x => !top.includes(x))))
}

test('3548 random grids match a flood-fill oracle', () => {
  let seed = 3548
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 200; trial++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(4)
    if (m * n < 2 || m * n > 12) continue
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(6)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
