import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = a => buildTrace(parseInput(JSON.stringify(a)))
// Oracle: assign each rabbit to a colour group exhaustively; a group of equal answers a holds at most a+1 reported rabbits and costs a+1.
function brute(answers) {
  let best = Infinity
  const groups = []
  const go = (i, cost) => {
    if (cost >= best) return
    if (i === answers.length) { best = cost; return }
    const a = answers[i]
    for (const g of groups) if (g.a === a && g.n < a + 1) { g.n++; go(i + 1, cost); g.n-- }
    groups.push({ a, n: 1 })
    go(i + 1, cost + a + 1)
    groups.pop()
  }
  go(0, 0)
  return best
}
test('official examples', () => {
  assert.equal(run([1, 1, 2]).result, 5)
  assert.equal(run([10, 10, 10]).result, 11)
})
test('matches exhaustive group assignment', () => {
  let seed = 5
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 300; t++) {
    const a = Array.from({ length: 1 + rnd(8) }, () => rnd(4))
    assert.equal(run(a).result, brute(a), JSON.stringify(a))
    assert.equal(run(a).frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[-1]'))
  assert.throws(() => parseInput('[1000]'))
})
