import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: test each candidate against the rules with a set of trust pairs.
function bruteJudge(n, trust) {
  const pairs = new Set(trust.map(([a, b]) => `${a}>${b}`))
  const candidates = []
  for (let c = 1; c <= n; c++) {
    let ok = true
    for (let p = 1; p <= n && ok; p++) {
      if (p === c) continue
      if (pairs.has(`${c}>${p}`)) ok = false
      if (!pairs.has(`${p}>${c}`)) ok = false
    }
    if (ok) candidates.push(c)
  }
  return candidates.length === 1 ? candidates[0] : -1
}

test('997 town judge matches the brute-force oracle', () => {
  const cases = [
    { n: 2, trust: [[1, 2]] },
    { n: 3, trust: [[1, 3], [2, 3]] },
    { n: 3, trust: [[1, 3], [2, 3], [3, 1]] },
    { n: 1, trust: [] },
    { n: 4, trust: [[1, 2], [3, 2], [4, 2]] },
    { n: 4, trust: [[1, 2], [2, 1], [3, 4]] },
    { n: 5, trust: [[1, 5], [2, 5], [3, 5], [4, 5], [5, 2]] },
    { n: 3, trust: [] },
  ]
  for (const input of cases) {
    const run = buildTrace(parseInput(JSON.stringify(input)))
    assert.equal(run.result, bruteJudge(input.n, input.trust), JSON.stringify(input))
  }
})

test('997 rejects a self-trust pair', () => {
  assert.throws(() => parseInput('{"n":3,"trust":[[2,2]]}'))
})
