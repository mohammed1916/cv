import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, phases, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 0)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('boomerang examples: a triangle, a straight line and a repeated point', () => {
  assert.equal(solve('[[0,0],[1,2],[2,5]]'), true)
  assert.equal(solve('[[0,1],[3,1],[7,1]]'), false)
  assert.equal(solve('[[4,4],[4,4],[9,0]]'), false)
})

test('vertical and diagonal lines are collinear without any division', () => {
  assert.equal(solve('[[5,-3],[5,0],[5,100]]'), false)
  assert.equal(solve('[[-7,-7],[0,0],[7,7]]'), false)
})

test('every frame carries a phase, a code line and a snapshot', () => {
  checkFrames(buildTrace(parseInput('[[0,0],[1,2],[2,5]]')))
})

test('invalid inputs are rejected by the parser', () => {
  assert.throws(() => parseInput('[[0,0],[1,2]]'))
  assert.throws(() => parseInput('[[0,0],[1,2],[2,5,9]]'))
  assert.throws(() => parseInput('[[0,0],[1,2],[101,5]]'))
  assert.throws(() => parseInput('[[0,0],[1.5,2],[2,5]]'))
})

// Independent oracle: the points form a boomerang exactly when they are distinct and no line contains all three.
function oracle(points) {
  const [a, b, c] = points
  const same = (p, q) => p[0] === q[0] && p[1] === q[1]
  if (same(a, b) || same(b, c) || same(a, c)) return false
  const pairs = [[a, b], [b, c], [a, c]]
  for (const [p, q] of pairs) {
    const nx = -(q[1] - p[1])
    const ny = q[0] - p[0]
    const k = nx * p[0] + ny * p[1]
    if ([a, b, c].every(r => nx * r[0] + ny * r[1] === k)) return false
  }
  return true
}

test('seeded random triples agree with the line-membership oracle', () => {
  let seed = 1037
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const points = [0, 1, 2].map(() => [rnd(7) - 3, rnd(7) - 3])
    assert.equal(buildTrace(parseInput(JSON.stringify(points))).result, oracle(points), JSON.stringify(points))
  }
})
