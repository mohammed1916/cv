import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, red_edges, blue_edges) => buildTrace(parseInput(JSON.stringify({ n, red_edges, blue_edges }))).result

test('1129 worked examples', () => {
  // Two red edges in a row are not alternating, so node 2 is unreachable.
  assert.deepEqual(solve(3, [[0, 1], [1, 2]], []), [0, 1, -1])
  // Red 0 -> 1 then blue 1 -> 2 alternates, so node 2 is two steps away.
  assert.deepEqual(solve(3, [[0, 1]], [[1, 2]]), [0, 1, 2])
})

test('1129 a single node', () => {
  assert.deepEqual(solve(1, [], []), [0])
})

test('1129 rejects an edge endpoint outside the graph', () => {
  assert.throws(() => parseInput('{"n":2,"red_edges":[[0,2]],"blue_edges":[]}'))
})

// Independent oracle: relax distances over (node, last colour) states until nothing improves.
function oracle(n, red, blue) {
  const edges = [...red.map(([u, v]) => [u, v, 'red']), ...blue.map(([u, v]) => [u, v, 'blue'])]
  const dist = new Map([['0:none', 0]])
  let changed = true
  while (changed) {
    changed = false
    for (const [u, v, colour] of edges) {
      for (const last of ['none', 'red', 'blue']) {
        if (last === colour) continue
        const du = dist.get(`${u}:${last}`)
        if (du === undefined) continue
        const k = `${v}:${colour}`
        if (dist.get(k) === undefined || du + 1 < dist.get(k)) {
          dist.set(k, du + 1)
          changed = true
        }
      }
    }
  }
  return Array.from({ length: n }, (_, v) => {
    if (v === 0) return 0
    const options = ['red', 'blue'].map(c => dist.get(`${v}:${c}`)).filter(d => d !== undefined)
    return options.length ? Math.min(...options) : -1
  })
}

test('1129 random graphs match a relaxation oracle', () => {
  let seed = 1129
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const pair = () => [rnd(n), rnd(n)]
    const red = Array.from({ length: rnd(7) }, pair)
    const blue = Array.from({ length: rnd(7) }, pair)
    assert.deepEqual(solve(n, red, blue), oracle(n, red, blue), JSON.stringify({ n, red, blue }))
  }
})
