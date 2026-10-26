import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = o => buildTrace(parseInput(JSON.stringify(o))).result
// Oracle: recount votes from scratch for each query; tie -> most recent vote.
function oracle({ persons, times, queries }) {
  return queries.map(t => {
    const cnt = new Map(), last = new Map()
    persons.forEach((p, i) => { if (times[i] <= t) { cnt.set(p, (cnt.get(p) ?? 0) + 1); last.set(p, i) } })
    let best = -1
    for (const p of cnt.keys()) if (best === -1 || cnt.get(p) > cnt.get(best) || (cnt.get(p) === cnt.get(best) && last.get(p) > last.get(best))) best = p
    return best
  })
}
test('official example', () => {
  assert.deepEqual(solve({ persons: [0, 1, 1, 0, 0, 1, 0], times: [0, 5, 10, 15, 20, 25, 30], queries: [3, 12, 25, 15, 24, 8] }), [0, 1, 1, 0, 0, 1])
})
test('matches recount oracle', () => {
  let seed = 9
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(15)
    const times = []; let c = rnd(3)
    for (let i = 0; i < n; i++) { times.push(c); c += 1 + rnd(4) }
    const persons = Array.from({ length: n }, () => rnd(4))
    const queries = Array.from({ length: 10 }, () => times[0] + rnd(c + 3))
    const o = { persons, times, queries }
    assert.deepEqual(solve(o), oracle(o), JSON.stringify(o))
  }
})
test('ends done, rejects bad input', () => {
  assert.equal(buildTrace(parseInput('{"persons":[0],"times":[1],"queries":[1]}')).frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('{"persons":[0,1],"times":[2,2],"queries":[]}'))
  assert.throws(() => parseInput('{"persons":[0],"times":[5],"queries":[1]}'))
  assert.throws(() => parseInput('{"persons":[0],"times":[1,2],"queries":[]}'))
})
