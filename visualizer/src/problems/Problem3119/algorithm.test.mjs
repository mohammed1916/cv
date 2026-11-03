import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = input => buildTrace(input).result
const pyLines = python.split('\n').length

function assertFrames(run) {
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
  }
}

test('3119 authored examples', () => {
  assert.equal(solve({ road: 'xx.xxxx.x', budget: 5 }), 4)
  assert.equal(solve({ road: 'xxxxx.xxx', budget: 7 }), 5)
  assert.equal(solve({ road: 'xxx', budget: 1 }), 0)
  assert.equal(solve({ road: 'xxx', budget: 3 }), 2)
})

test('3119 rejects roads with other characters', () => {
  assert.throws(() => parseInput('{"road":"x.y","budget":2}'))
  assert.throws(() => parseInput('{"road":"xx","budget":-1}'))
})

// Oracle: each run is repaired by at most one group (splitting a run only adds cost); try every amount per run.
function oracle(road, budget) {
  const runs = road.split('.').filter(Boolean).map(p => p.length)
  let best = 0
  const go = (idx, cost, fixed) => {
    if (cost > budget) return
    if (idx === runs.length) { best = Math.max(best, fixed); return }
    go(idx + 1, cost, fixed)
    for (let take = 1; take <= runs[idx]; take++) go(idx + 1, cost + take + 1, fixed + take)
  }
  go(0, 0, 0)
  return best
}

test('3119 random roads match an enumeration of repair amounts', () => {
  let seed = 3119
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const road = Array.from({ length: 1 + rnd(14) }, () => (rnd(3) === 0 ? '.' : 'x')).join('')
    const budget = rnd(16)
    assert.equal(solve({ road, budget }), oracle(road, budget), `${road} ${budget}`)
    assertFrames(buildTrace({ road, budget }))
  }
})
