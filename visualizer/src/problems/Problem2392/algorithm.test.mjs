import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// A valid answer holds each value once and places every condition pair in the right order.
function valid(grid, input) {
  const k = input.k
  if (grid.length !== k || grid.some(r => r.length !== k)) return false
  const at = {}
  for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) {
    const v = grid[i][j]
    if (v) { if (at[v]) return false; at[v] = [i, j] }
  }
  for (let v = 1; v <= k; v++) if (!at[v]) return false
  for (const [a, b] of input.row_conditions) if (at[a][0] >= at[b][0]) return false
  for (const [a, b] of input.col_conditions) if (at[a][1] >= at[b][1]) return false
  return true
}

// Independent oracle: try every order of rows and every order of columns.
function* permutations(items) {
  if (items.length <= 1) { yield items; return }
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const tail of permutations(rest)) yield [items[i], ...tail]
  }
}
function feasible(input) {
  const values = [...Array(input.k).keys()].map(v => v + 1)
  const orders = [...permutations(values)]
  const ok = (order, pairs) => {
    const place = {}
    order.forEach((v, i) => { place[v] = i })
    return pairs.every(([a, b]) => place[a] < place[b])
  }
  return orders.some(r => ok(r, input.row_conditions) && orders.some(c => ok(c, input.col_conditions)))
}

test('2392 official examples', () => {
  const example1 = { k: 3, row_conditions: [[1, 2], [3, 2]], col_conditions: [[2, 1], [3, 2]] }
  const example2 = { k: 3, row_conditions: [[1, 2], [2, 3], [3, 1], [2, 3]], col_conditions: [[2, 1]] }
  assert.ok(valid(solve(example1), example1))
  assert.deepEqual(solve(example2), [])
})

test('2392 a single value and no conditions give a one-cell grid', () => {
  assert.deepEqual(solve({ k: 1, row_conditions: [], col_conditions: [] }), [[1]])
})

test('2392 rejects a pair that repeats a value', () => {
  assert.throws(() => parseInput('{"k":3,"row_conditions":[[2,2]],"col_conditions":[]}'))
})

test('2392 seeded random inputs match a brute-force oracle', () => {
  let seed = 2392
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const k = 1 + rnd(4)
    const conditions = () => {
      const list = []
      for (let c = rnd(5); c > 0; c--) {
        const a = 1 + rnd(k)
        const b = 1 + rnd(k)
        if (a !== b) list.push([a, b])
      }
      return list
    }
    const input = { k, row_conditions: conditions(), col_conditions: conditions() }
    const grid = solve(input)
    if (feasible(input)) assert.ok(valid(grid, input), JSON.stringify(input))
    else assert.deepEqual(grid, [], JSON.stringify(input))
  }
})
