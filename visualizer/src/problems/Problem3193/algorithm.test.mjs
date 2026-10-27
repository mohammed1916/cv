import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3193 official examples', () => {
  assert.equal(solve({ n: 3, requirements: [[2, 2], [0, 0]] }), 2)
  assert.equal(solve({ n: 3, requirements: [[2, 2], [1, 1], [0, 0]] }), 1)
  assert.equal(solve({ n: 2, requirements: [[0, 0], [1, 0]] }), 1)
})

test('3193 contradictory requirements give zero', () => {
  assert.equal(solve({ n: 3, requirements: [[1, 0], [1, 1]] }), 0)
})

test('3193 rejects an end outside the permutation', () => {
  assert.throws(() => parseInput('{"n":3,"requirements":[[3,0]]}'))
})

// Independent oracle: enumerate every permutation and count inversions in each requested prefix.
function permutations(items) {
  if (items.length <= 1) return [items]
  const out = []
  items.forEach((x, i) => {
    for (const rest of permutations([...items.slice(0, i), ...items.slice(i + 1)])) out.push([x, ...rest])
  })
  return out
}

function oracle({ n, requirements }) {
  let count = 0
  for (const p of permutations(Array.from({ length: n }, (_, i) => i))) {
    const ok = requirements.every(([end, cnt]) => {
      let inv = 0
      for (let a = 0; a <= end; a++) for (let b = a + 1; b <= end; b++) if (p[a] > p[b]) inv++
      return inv === cnt
    })
    if (ok) count++
  }
  return count
}

test('3193 random requirements match a permutation enumeration', () => {
  let seed = 3193
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(5)
    const requirements = []
    for (let k = 1 + rnd(3); k > 0; k--) {
      const end = rnd(n)
      requirements.push([end, rnd(end * (end + 1) / 2 + 1)])
    }
    const input = { n, requirements }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
