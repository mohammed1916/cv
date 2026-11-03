import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = degrees => buildTrace(degrees).result

test('3656 hand-checked values', () => {
  assert.equal(solve([3, 3, 3, 3]), true)
  assert.equal(solve([3, 1]), false)
  assert.equal(solve([2, 2, 2, 2, 2]), true)
  assert.equal(solve([1, 1, 1]), false)
  assert.equal(solve([0, 0]), true)
})

test('3656 disconnected graphs are allowed', () => {
  assert.equal(solve([1, 1, 0, 0]), true)
  assert.equal(solve([2, 2, 2, 0, 0]), true)
})

test('3656 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[13]'))
  assert.throws(() => parseInput('[1.5]'))
})

test('3656 frames carry valid lines and phases', () => {
  const trace = buildTrace([3, 3, 2, 2])
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of trace.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(phaseIds.has(frame.phase))
  }
})

// Oracle: enumerate every simple graph on up to 5 vertices and collect the degree sequences it realizes.
function realizableSet(n) {
  const pairs = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j])
  const seen = new Set()
  for (let mask = 0; mask < 1 << pairs.length; mask++) {
    const deg = Array(n).fill(0)
    pairs.forEach(([i, j], e) => { if (mask & (1 << e)) { deg[i]++; deg[j]++ } })
    seen.add([...deg].sort((a, b) => b - a).join(','))
  }
  return seen
}

test('3656 matches exhaustive enumeration for up to 5 vertices', () => {
  for (let n = 1; n <= 5; n++) {
    const realizable = realizableSet(n)
    // Every degree list with entries 0..n-1 is checked, so both realizable and non-realizable cases appear.
    const lists = [[]]
    for (let v = 0; v < n; v++) {
      const next = []
      for (const list of lists) if (list.length < n) for (let d = 0; d < n; d++) next.push([...list, d])
      lists.splice(0, lists.length, ...next)
    }
    for (const list of lists) {
      if (list.length !== n) continue
      const key = [...list].sort((a, b) => b - a).join(',')
      assert.equal(solve(list), realizable.has(key), JSON.stringify(list))
    }
  }
})
