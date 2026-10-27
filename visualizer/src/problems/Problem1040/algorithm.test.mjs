import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = stones => buildTrace(parseInput(JSON.stringify({ stones }))).result

test('1040 official examples', () => {
  assert.deepEqual(solve([7, 4, 9]), [1, 2])
  assert.deepEqual(solve([6, 5, 4, 3, 10]), [2, 3])
})

test('1040 already consecutive needs no moves', () => {
  assert.deepEqual(solve([4, 5, 6]), [0, 0])
})

test('1040 rejects duplicate positions', () => {
  assert.throws(() => parseInput('{"stones":[1,1,3]}'))
})

// Independent oracle: explore every state. A move takes an endpoint stone to an empty cell that is no longer an endpoint.
// Fewest moves is a breadth-first search; most moves is the longest path in the (shrinking) state graph.
function oracle(stones) {
  const norm = a => [...a].sort((p, q) => p - q)
  const done = a => a[a.length - 1] - a[0] === a.length - 1
  const next = a => {
    if (done(a)) return []
    const lo = a[0], hi = a[a.length - 1]
    const out = []
    // The moved stone must end up strictly inside: not below the new leftmost or above the new rightmost stone.
    for (let x = a[1] + 1; x < hi; x++) if (!a.includes(x)) out.push(norm([...a.slice(1), x]))
    for (let x = lo + 1; x < a[a.length - 2]; x++) if (!a.includes(x)) out.push(norm([x, ...a.slice(0, a.length - 1)]))
    return out
  }
  const start = norm(stones)
  const dist = new Map([[start.join(','), 0]])
  let queue = [start]
  let least = null
  while (queue.length) {
    const cur = queue.shift()
    const d = dist.get(cur.join(','))
    if (done(cur)) { least = d; break }
    for (const nb of next(cur)) {
      const key = nb.join(',')
      if (!dist.has(key)) { dist.set(key, d + 1); queue.push(nb) }
    }
  }
  const memo = new Map()
  const longest = a => {
    const key = a.join(',')
    if (memo.has(key)) return memo.get(key)
    let best = 0
    for (const nb of next(a)) best = Math.max(best, 1 + longest(nb))
    memo.set(key, best)
    return best
  }
  return [least, longest(start)]
}

test('1040 random positions match a state-graph oracle', () => {
  let seed = 1040
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const pool = Array.from({ length: 12 }, (_, k) => k + 1)
    const size = 3 + rnd(4)
    const stones = []
    while (stones.length < size) {
      const pick = pool.splice(rnd(pool.length), 1)[0]
      stones.push(pick)
    }
    assert.deepEqual(solve(stones), oracle(stones), JSON.stringify(stones))
  }
})
