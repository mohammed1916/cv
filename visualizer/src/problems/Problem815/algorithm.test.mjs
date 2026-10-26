import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Oracle: relax bus-to-bus distances to a fixed point (routes that share a stop are adjacent).
function oracle(routes, source, target) {
  if (source === target) return 0
  const dist = routes.map(r => (r.includes(source) ? 1 : Infinity))
  for (let changed = true; changed;) {
    changed = false
    for (let a = 0; a < routes.length; a++) for (let b = 0; b < routes.length; b++) {
      if (a !== b && routes[a].some(s => routes[b].includes(s)) && dist[a] + 1 < dist[b]) { dist[b] = dist[a] + 1; changed = true }
    }
  }
  const best = Math.min(...routes.map((r, i) => (r.includes(target) ? dist[i] : Infinity)))
  return best === Infinity ? -1 : best
}
test('official examples', () => {
  assert.equal(buildTrace(parseInput('{"routes":[[1,2,7],[3,6,7]],"source":1,"target":6}')).result, 2)
  assert.equal(buildTrace(parseInput('{"routes":[[7,12],[4,5,15],[6],[15,19],[9,12,13]],"source":15,"target":12}')).result, -1)
})
test('random vs route-distance fixed point', () => {
  let seed = 17
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 400; t++) {
    const routes = Array.from({ length: 1 + rnd(5) }, () => [...new Set(Array.from({ length: 1 + rnd(4) }, () => rnd(10)))])
    const source = rnd(10), target = rnd(10)
    const r = buildTrace(parseInput(JSON.stringify({ routes, source, target })))
    assert.equal(r.result, oracle(routes, source, target), JSON.stringify({ routes, source, target }))
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('{"routes":[[1,1]],"source":1,"target":2}'))
  assert.throws(() => parseInput('{"routes":[],"source":1,"target":2}'))
  assert.throws(() => parseInput('[]'))
})
