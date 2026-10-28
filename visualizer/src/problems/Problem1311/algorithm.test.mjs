import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

const example = { watchedVideos: [['a', 'b'], ['c'], ['b', 'c'], ['d']], friends: [[1, 2], [0, 3], [0, 3], [1, 2]], id: 0, level: 1 }

test('1311 official-style examples', () => {
  assert.deepEqual(solve(example), ['b', 'c'])
  assert.deepEqual(solve({ ...example, level: 2 }), ['d'])
})

test('1311 rejects asymmetric friendships and bad video names', () => {
  assert.throws(() => parseInput(JSON.stringify({ ...example, friends: [[1], [0, 3], [0, 3], [1, 2]] })))
  assert.throws(() => parseInput(JSON.stringify({ ...example, watchedVideos: [['A'], ['c'], ['b', 'c'], ['d']] })))
})

// Independent oracle: all-pairs shortest paths (Floyd-Warshall), then count videos of people at exactly that distance.
function oracle({ watchedVideos, friends, id, level }) {
  const n = friends.length, INF = 1e9
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : friends[i].includes(j) ? 1 : INF)))
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  const counts = new Map()
  for (let p = 0; p < n; p++) if (d[id][p] === level) for (const v of watchedVideos[p]) counts.set(v, (counts.get(v) || 0) + 1)
  return [...counts.keys()].sort((a, b) => counts.get(a) - counts.get(b) || (a < b ? -1 : 1))
}

test('1311 random friend networks match a Floyd-Warshall oracle', () => {
  let seed = 1311
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const names = ['a', 'b', 'c', 'd', 'e']
  let checked = 0
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(6)
    const friends = Array.from({ length: n }, () => [])
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rnd(3) === 0) { friends[i].push(j); friends[j].push(i) }
    const watchedVideos = Array.from({ length: n }, () => names.filter(() => rnd(3) === 0))
    const input = { watchedVideos, friends, id: rnd(n), level: 1 + rnd(n) }
    let parsed
    try { parsed = parseInput(JSON.stringify(input)) } catch { continue }
    checked++
    assert.deepEqual(buildTrace(parsed).result, oracle(input), JSON.stringify(input))
  }
  assert.ok(checked > 100)
})
