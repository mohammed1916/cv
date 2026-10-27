import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2861 official examples', () => {
  assert.equal(solve({ n: 3, k: 2, budget: 15, composition: [[1, 1, 1], [1, 1, 10]], stock: [0, 0, 0], cost: [1, 2, 3] }), 2)
  assert.equal(solve({ n: 3, k: 2, budget: 15, composition: [[1, 1, 10], [1, 1, 1]], stock: [0, 0, 100], cost: [1, 2, 3] }), 5)
})

test('2861 rejects a composition with the wrong shape', () => {
  assert.throws(() => parseInput('{"n":2,"k":2,"budget":5,"composition":[[1,1]],"stock":[0,0],"cost":[1,1]}'))
})

// Independent oracle: raise the alloy count one at a time until no machine can afford it.
function oracle({ n, k, budget, composition, stock, cost }) {
  const affordable = (machine, alloys) => {
    let spent = 0
    for (let metal = 0; metal < n; metal++) {
      const need = composition[machine][metal] * alloys - stock[metal]
      if (need > 0) spent += need * cost[metal]
    }
    return spent <= budget
  }
  let alloys = 0
  while (true) {
    const next = alloys + 1
    let any = false
    for (let machine = 0; machine < k; machine++) if (affordable(machine, next)) any = true
    if (!any) return alloys
    alloys = next
  }
}

test('2861 seeded random cases match a one-at-a-time search', () => {
  let seed = 2861
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(3), k = 1 + rnd(3)
    const input = {
      n, k, budget: rnd(31),
      composition: Array.from({ length: k }, () => Array.from({ length: n }, () => 1 + rnd(3))),
      stock: Array.from({ length: n }, () => rnd(6)),
      cost: Array.from({ length: n }, () => 1 + rnd(3)),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
