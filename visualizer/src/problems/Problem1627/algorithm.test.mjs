import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const gcd = (a, b) => (b ? gcd(b, a % b) : a)
// Oracle: cities are connected by a path of direct links, where each direct link needs gcd above the threshold.
function oracle({ n, threshold, queries }) {
  const group = Array.from({ length: n + 1 }, (_, c) => c)
  const find = x => (group[x] === x ? x : find(group[x]))
  for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) if (gcd(a, b) > threshold) group[find(a)] = find(b)
  return queries.map(([a, b]) => find(a) === find(b))
}

test('own sample: threshold 2 on 10 cities', () => {
  const run = buildTrace(parseInput('{"n":10,"threshold":2,"queries":[[3,9],[4,6],[5,7],[8,10],[2,5]]}'))
  assert.deepEqual(run.result, [true, false, false, false, false])
})

test('threshold equal to n links nothing', () => {
  assert.deepEqual(buildTrace({ n: 6, threshold: 6, queries: [[1, 1], [2, 4]] }).result, [true, false])
})

test('random cases agree with the gcd oracle', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(30)
    const threshold = rand(n + 1)
    const queries = Array.from({ length: 1 + rand(10) }, () => [1 + rand(n), 1 + rand(n)])
    const input = { n, threshold, queries }
    assert.deepEqual(buildTrace(input).result, oracle(input), JSON.stringify(input))
  }
})

test('frames use declared phases, valid code lines, and narration', () => {
  const run = buildTrace({ n: 8, threshold: 1, queries: [[4, 6]] })
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.message.length > 10)
    assert.equal(f.roots.length, 9)
  }
  assert.ok(python.includes('def are_connected'))
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"n":5,"threshold":9,"queries":[[1,2]]}'), /threshold/)
  assert.throws(() => parseInput('{"n":5,"threshold":1,"queries":[[1,7]]}'), /pair of cities/)
})
