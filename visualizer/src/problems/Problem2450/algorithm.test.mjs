import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = input => buildTrace(input).result

// Independent oracle: breadth-first search over every string reachable by window flips.
function oracle({ s, k }) {
  const seen = new Set([s])
  const queue = [s]
  while (queue.length) {
    const cur = queue.shift()
    for (let i = 0; i + k <= cur.length; i++) {
      const flipped = [...cur].map((ch, j) => (j >= i && j < i + k ? (ch === '0' ? '1' : '0') : ch)).join('')
      if (!seen.has(flipped)) {
        seen.add(flipped)
        queue.push(flipped)
      }
    }
  }
  return seen.size
}

test('2450 teaching examples', () => {
  assert.equal(solve({ s: '101101', k: 3 }), 16)
  assert.equal(solve({ s: '0000', k: 4 }), 2)
  assert.equal(solve({ s: '1100110', k: 2 }), 64)
})

test('2450 zero operations always count the original string', () => {
  assert.equal(solve({ s: '1', k: 1 }), 2)
  assert.equal(solve({ s: '10', k: 2 }), 2)
})

test('2450 parseInput validates the object', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"s":"102","k":1}'))
  assert.throws(() => parseInput('{"s":"10","k":3}'))
  assert.throws(() => parseInput('{"s":"10","k":0}'))
})

test('2450 small strings match a breadth-first search oracle', () => {
  for (let n = 1; n <= 8; n++) {
    for (let v = 0; v < 1 << n; v++) {
      const s = v.toString(2).padStart(n, '0')
      for (let k = 1; k <= n; k++) {
        assert.equal(solve({ s, k }), oracle({ s, k }), `${s} ${k}`)
      }
    }
  }
})

test('2450 frame invariants hold on every trace', () => {
  const run = buildTrace({ s: '101101', k: 3 })
  const phases = new Set(['start', 'window', 'done'])
  for (const f of run.frames) {
    assert.ok(phases.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.trim().split('\n').length)
  }
  assert.equal(run.frames.at(-1).value, run.result)
})
