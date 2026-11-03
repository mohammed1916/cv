import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3540 a single hop and a full lap', () => {
  assert.equal(solve('{"forward":[2,2,2],"backward":[1,1,1],"queries":[1]}'), 2)
  assert.equal(solve('{"forward":[5,5,5],"backward":[1,1,1],"queries":[2,1]}'), 2)
})

test('3540 queries already at house zero cost nothing', () => {
  assert.equal(solve('{"forward":[4,4,4,4],"backward":[3,3,3,3],"queries":[0,0]}'), 0)
})

test('3540 rejects bad sizes and costs', () => {
  assert.throws(() => parseInput('{"forward":[1],"backward":[1],"queries":[0]}'))
  assert.throws(() => parseInput('{"forward":[1,2],"backward":[1],"queries":[0]}'))
  assert.throws(() => parseInput('{"forward":[1,0],"backward":[1,1],"queries":[0]}'))
  assert.throws(() => parseInput('{"forward":[1,2],"backward":[1,1],"queries":[2]}'))
})

// Independent oracle: all-pairs shortest paths on the directed ring, then the sum of hops between consecutive targets.
function oracle(forward, backward, queries) {
  const n = forward.length
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  for (let i = 0; i < n; i++) {
    d[i][(i + 1) % n] = Math.min(d[i][(i + 1) % n], forward[i])
    d[i][(i - 1 + n) % n] = Math.min(d[i][(i - 1 + n) % n], backward[i])
  }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  let total = 0
  let at = 0
  for (const target of queries) { total += d[at][target]; at = target }
  return total
}

test('3540 random rings match the shortest-hop oracle', () => {
  let seed = 3540
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(7)
    const forward = Array.from({ length: n }, () => 1 + rnd(9))
    const backward = Array.from({ length: n }, () => 1 + rnd(9))
    const queries = Array.from({ length: 1 + rnd(6) }, () => rnd(n))
    const text = JSON.stringify({ forward, backward, queries })
    assert.equal(solve(text), oracle(forward, backward, queries), text)
  }
})

test('3540 frames keep their pseudocode and python lines in range', () => {
  const run = buildTrace(parseInput('{"forward":[2,3,1],"backward":[4,1,2],"queries":[1,2]}'))
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= 11)
    assert.ok(f.pythonLine >= 1)
    assert.equal(f.best.length, 3)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
