import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const fits = (low, high) => low[0] <= high[0] && low[1] <= high[1] && low[2] <= high[2]

// Independent oracle: try every subset, every order and the sum of tallest sides; keep chains where each box fits the next.
function oracle(boxes) {
  const sorted = boxes.map(b => [...b].sort((a, b2) => a - b2))
  const n = sorted.length
  let best = 0
  for (let mask = 1; mask < (1 << n); mask++) {
    const picked = sorted.filter((_, i) => mask & (1 << i))
    const perms = permutations(picked)
    for (const order of perms) {
      let ok = true
      for (let k = 1; k < order.length && ok; k++) ok = fits(order[k - 1], order[k])
      if (ok) best = Math.max(best, order.reduce((s, b) => s + b[2], 0))
    }
  }
  return best
}
function permutations(list) {
  if (list.length <= 1) return [list]
  return list.flatMap((item, i) => permutations([...list.slice(0, i), ...list.slice(i + 1)]).map(rest => [item, ...rest]))
}

test('1691 sample stacks match the exhaustive oracle', () => {
  const boxes = [[3, 2, 1], [2, 4, 5], [4, 1, 2], [6, 3, 3]]
  assert.equal(buildTrace(boxes).result, oracle(boxes))
  assert.equal(buildTrace([[2, 2, 2], [2, 2, 2]]).result, 4)
  assert.equal(buildTrace([[7, 3, 9]]).result, 9)
})

test('1691 random small inputs match the exhaustive oracle', () => {
  let seed = 9
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(5)
    const boxes = Array.from({ length: n }, () => [1 + rnd(6), 1 + rnd(6), 1 + rnd(6)])
    assert.equal(buildTrace(boxes).result, oracle(boxes), JSON.stringify(boxes))
  }
})

test('1691 rejects malformed input', () => {
  assert.throws(() => parseInput('[[1,2]]'), /1 to 20/)
  assert.throws(() => parseInput('[[0,2,3]]'), /1 to 20/)
  assert.throws(() => parseInput('[]'), /1 to 20/)
})

test('1691 frames use declared phases and carry line numbers', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const frame of buildTrace([[3, 2, 1], [2, 4, 5]]).frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.pythonLine >= 1)
  }
})
