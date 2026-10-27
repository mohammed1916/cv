import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// A valid answer lists every item once, puts each item after its dependencies, and keeps each group in one run.
function valid(order, input) {
  const { n, m, group, before_items: before } = input
  const groups = group.map((g, i) => (g === -1 ? m + i : g))
  if (order.length !== n || new Set(order).size !== n || order.some(v => !Number.isInteger(v) || v < 0 || v >= n)) return false
  const pos = []
  order.forEach((item, p) => { pos[item] = p })
  for (let i = 0; i < n; i++) for (const j of before[i]) if (pos[j] > pos[i]) return false
  const seen = new Set()
  let last = -1
  for (const item of order) {
    if (groups[item] !== last) {
      if (seen.has(groups[item])) return false
      seen.add(groups[item])
      last = groups[item]
    }
  }
  return true
}

// Independent oracle: try every permutation of the items and keep any that is valid.
function* permutations(items) {
  if (items.length <= 1) { yield items; return }
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const tail of permutations(rest)) yield [items[i], ...tail]
  }
}
function someValidOrder(input) {
  for (const p of permutations([...Array(input.n).keys()])) if (valid(p, input)) return true
  return false
}

test('1203 official examples', () => {
  const example1 = { n: 8, m: 2, group: [-1, -1, 1, 0, 0, 1, 0, -1], before_items: [[], [6], [5], [6], [3, 6], [], [], []] }
  const example2 = { n: 8, m: 2, group: [-1, -1, 1, 0, 0, 1, 0, -1], before_items: [[], [6], [5], [6], [3], [], [4], []] }
  assert.ok(valid(solve(example1), example1))
  assert.deepEqual(solve(example2), [])
})

test('1203 one group keeps its items in dependency order', () => {
  const input = { n: 3, m: 1, group: [0, 0, 0], before_items: [[], [0], [1]] }
  assert.deepEqual(solve(input), [0, 1, 2])
})

test('1203 rejects a group id outside the range', () => {
  assert.throws(() => parseInput('{"n":2,"m":1,"group":[0,1],"before_items":[[],[]]}'))
})

test('1203 seeded random inputs match a brute-force oracle', () => {
  let seed = 1203
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const m = 1 + rnd(n)
    const group = Array.from({ length: n }, () => rnd(m + 1) - 1)
    const before_items = Array.from({ length: n }, (_, i) => [...Array(n).keys()].filter(j => j !== i && rnd(5) === 0))
    const input = { n, m, group, before_items }
    const result = solve(input)
    if (someValidOrder(input)) assert.ok(valid(result, input), JSON.stringify(input))
    else assert.deepEqual(result, [], JSON.stringify(input))
  }
})
