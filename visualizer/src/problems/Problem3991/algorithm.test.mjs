import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, pre) => buildTrace(parseInput(JSON.stringify({ nums, pre }))).result
const pyLineCount = python.trim().split('\n').length

// Independent oracle for n <= 4: enumerate every permutation and run Floyd-Warshall on the move graph.
function oracle(nums, pre) {
  const n = nums.length
  const perms = []
  const build = (prefix, rest) => {
    if (!rest.length) { perms.push(prefix); return }
    rest.forEach((v, i) => build([...prefix, v], rest.filter((_, j) => j !== i)))
  }
  build([], [...Array(n).keys()])
  const id = p => perms.findIndex(q => q.join() === p.join())
  const m = perms.length
  const d = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => (i === j ? 0 : Infinity)))
  perms.forEach((p, i) => pre.forEach(len => {
    const q = [...p.slice(0, len).reverse(), ...p.slice(len)]
    d[i][id(q)] = Math.min(d[i][id(q)], 1)
  }))
  for (let k = 0; k < m; k++) for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  const best = d[id(nums)][id([...Array(n).keys()])]
  return best === Infinity ? -1 : best
}

test('3991 hand-checked values', () => {
  assert.equal(solve([0, 1, 2], [2]), 0)
  assert.equal(solve([1, 0], [2]), 1)
  assert.equal(solve([2, 0, 1], [3]), -1)
  assert.equal(solve([2, 0, 1], [2, 3]), 2)
  assert.equal(solve([1, 0, 2], [2]), 1)
  assert.equal(solve([1, 2, 0], [2]), -1)
})

test('3991 rejects bad inputs', () => {
  assert.throws(() => parseInput('{"nums":[0,0],"pre":[2]}'))
  assert.throws(() => parseInput('{"nums":[0,1],"pre":[3]}'))
  assert.throws(() => parseInput('{"nums":[0,1],"pre":[2,2]}'))
  assert.throws(() => parseInput('[0,1]'))
})

test('3991 BFS agrees with the Floyd-Warshall oracle for n up to 4', () => {
  const perms = [[0], [0, 1], [1, 0], [0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [2, 1, 0], [1, 0, 2]]
  for (const nums of perms) {
    for (const pre of [[2], [3], [2, 3], [4], [1, 3], [2, 4], [3, 4, 2]]) {
      const usable = pre.filter(len => len <= nums.length)
      if (!usable.length) continue
      assert.equal(solve(nums, usable), oracle(nums, usable), JSON.stringify({ nums, usable }))
    }
  }
})

test('3991 frame invariants hold', () => {
  const run = buildTrace(parseInput('{"nums":[2,0,3,1],"pre":[2,4,3]}'))
  assert.equal(run.frames[run.frames.length - 1].phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLineCount)
    assert.ok(frame.seen >= 1)
  }
})
