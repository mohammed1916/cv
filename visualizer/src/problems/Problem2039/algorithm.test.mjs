import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: simulate the messages second by second. A server sends a request at each multiple of its
// patience while no reply has arrived; a request is in transit for d seconds, then its reply for d more.
function oracle(edges, patience) {
  const n = patience.length
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const dist = Array(n).fill(Infinity)
  dist[0] = 0
  const queue = [0]
  for (let h = 0; h < queue.length; h++) for (const v of adj[queue[h]]) if (dist[v] === Infinity) { dist[v] = dist[queue[h]] + 1; queue.push(v) }
  const busy = new Set()
  let last = 0
  for (let i = 1; i < n; i++) {
    const d = dist[i]
    let replied = Infinity
    for (let t = 0; t < replied; t += patience[i]) {
      for (let x = t; x < t + d; x++) busy.add(x)           // request outward
      const back = t + 2 * d
      for (let x = t + d; x <= back; x++) busy.add(x)        // reply inward
      replied = Math.min(replied, back)
      last = Math.max(last, back)
    }
  }
  let t = 0
  while (busy.has(t)) t++
  return t
}

test('examples', () => {
  assert.equal(solve('{"edges":[[0,1],[1,2]],"patience":[0,2,1]}'), 8)
  assert.equal(solve('{"edges":[[0,1],[0,2],[1,2]],"patience":[0,10,10]}'), 3)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"edges":[[0,1]],"patience":[0,1]}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random networks match the message simulation', () => {
  let state = 503
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 120; t++) {
    const n = 2 + rand(6)
    const edges = []
    for (let i = 1; i < n; i++) edges.push([rand(i), i])
    const patience = [0, ...Array.from({ length: n - 1 }, () => 1 + rand(5))]
    assert.equal(solve(JSON.stringify({ edges, patience })), oracle(edges, patience), JSON.stringify({ edges, patience }))
  }
})
