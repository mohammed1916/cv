import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = perm => buildTrace({ perm }).result

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `python ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
    assert.equal(f.arr.length, run.input.perm.length)
  }
  assert.ok(['found', 'done'].includes(run.frames.at(-1).phase))
}

test('3942 hand-checked cases', () => {
  assert.equal(solve([0]), 0)
  assert.equal(solve([2, 3, 0, 1]), 2)
  assert.equal(solve([3, 2, 1, 0]), 1)
  assert.equal(solve([0, 2, 1, 3]), -1)
})

test('3942 frames are complete for the presets', () => {
  assertFrames(buildTrace({ perm: [2, 3, 0, 1] }))
  assertFrames(buildTrace({ perm: [0, 2, 1, 3] }))
})

test('3942 rejects non-permutations', () => {
  assert.throws(() => parseInput('[0,0,1]'))
  assert.throws(() => parseInput('[1,2,3]'))
  assert.throws(() => parseInput('[]'))
})

// Oracle: iterative enumeration of every operation sequence up to a length bound.
function oracle(perm) {
  const n = perm.length
  const sortedText = Array.from({ length: n }, (_, i) => i).join(',')
  const reverse = a => a.slice().reverse()
  const rotate = a => a.slice(1).concat(a.slice(0, 1))
  let frontier = [perm]
  for (let depth = 0; depth <= 2 * n + 2; depth++) {
    if (frontier.some(a => a.join(',') === sortedText)) return depth
    const nextFrontier = []
    for (const a of frontier) {
      nextFrontier.push(reverse(a), rotate(a))
    }
    frontier = nextFrontier
  }
  return -1
}

test('3942 random permutations match sequence enumeration', () => {
  let seed = 3942
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(6)
    const perm = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [perm[i], perm[j]] = [perm[j], perm[i]] }
    assert.equal(solve(perm), oracle(perm), JSON.stringify(perm))
  }
})
