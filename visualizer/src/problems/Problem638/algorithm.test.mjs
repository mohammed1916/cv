import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('638 official examples', () => {
  assert.equal(buildTrace({ price: [2, 5], special: [[3, 0, 5], [1, 2, 10]], needs: [3, 2] }).result, 14)
  assert.equal(buildTrace({ price: [2, 3, 4], special: [[1, 1, 0, 4], [2, 2, 1, 9]], needs: [1, 2, 1] }).result, 11)
})

// Oracle: shortest path over need-vectors. Actions: buy one item at list price, or apply an offer.
function oracle({ price, special, needs }) {
  const actions = [
    ...price.map((p, i) => ({ cost: p, take: price.map((_, j) => (j === i ? 1 : 0)) })),
    ...special.map(o => ({ cost: o.at(-1), take: o.slice(0, -1) })),
  ]
  const start = needs.join(',')
  const dist = new Map([[start, 0]])
  const queue = [needs]
  for (let q = 0; q < queue.length; q++) {
    const cur = queue[q]
    const d = dist.get(cur.join(','))
    for (const { cost, take } of actions) {
      if (!take.every((c, i) => c <= cur[i]) || take.every(c => c === 0)) continue
      const nxt = cur.map((v, i) => v - take[i])
      const key = nxt.join(',')
      if (!dist.has(key) || dist.get(key) > d + cost) { dist.set(key, d + cost); queue.push(nxt) }
    }
  }
  return Math.min(...[...dist].filter(([k]) => k.split(',').every(v => v === '0')).map(([, d]) => d))
}

test('638 random small problems match a shortest-path oracle', () => {
  let state = 15
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 200; t++) {
    const m = 1 + rand(3)
    const price = Array.from({ length: m }, () => 1 + rand(9))
    const special = Array.from({ length: rand(4) }, () => [...Array.from({ length: m }, () => rand(3)), 1 + rand(12)])
    const needs = Array.from({ length: m }, () => rand(4))
    assert.equal(buildTrace({ price, special, needs }).result, oracle({ price, special, needs }), JSON.stringify({ price, special, needs }))
  }
})

test('638 rejects mismatched offer lengths', () => {
  assert.throws(() => parseInput('{"price":[1,2],"special":[[1,2]],"needs":[1,1]}'))
})
