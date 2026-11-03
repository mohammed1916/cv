import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (source, target) => buildTrace({ source, target }).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length, 'pseudocode line')
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines, 'python line')
    assert.ok(frame.message.length > 0)
  }
}

// Independent oracle: breadth-first search over the 64 squares using queen moves.
function bfs(source, target) {
  const key = ([r, c]) => (r - 1) * 8 + (c - 1)
  const dist = new Map([[key(source), 0]])
  const queue = [source]
  while (queue.length) {
    const cur = queue.shift()
    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= 8; c++) {
        const dr = r - cur[0]
        const dc = c - cur[1]
        if (dr === 0 && dc === 0) continue
        if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) continue
        if (!dist.has(key([r, c]))) {
          dist.set(key([r, c]), dist.get(key(cur)) + 1)
          queue.push([r, c])
        }
      }
    }
  }
  return dist.get(key(target))
}

test('4061 same square needs no move and a shared line needs one', () => {
  assert.equal(solve([3, 3], [3, 3]), 0)
  assert.equal(solve([1, 1], [1, 8]), 1)
  assert.equal(solve([2, 2], [7, 7]), 1)
  assert.equal(solve([4, 1], [8, 5]), 1)
})

test('4061 squares off every line need two moves through a pivot', () => {
  assert.equal(solve([1, 1], [2, 3]), 2)
  assert.equal(solve([5, 2], [8, 3]), 2)
})

test('4061 every pair of squares matches a breadth-first search', () => {
  for (let a = 1; a <= 8; a++) for (let b = 1; b <= 8; b++) for (let c = 1; c <= 8; c++) for (let d = 1; d <= 8; d++) {
    const source = [a, b]
    const target = [c, d]
    assert.equal(solve(source, target), bfs(source, target), JSON.stringify({ source, target }))
  }
})

test('4061 frames stay valid across the board', () => {
  checkFrames(buildTrace({ source: [1, 1], target: [2, 3] }))
  checkFrames(buildTrace({ source: [4, 4], target: [4, 4] }))
})

test('4061 rejects squares outside the board', () => {
  assert.throws(() => parseInput('{"source":[0,1],"target":[1,1]}'))
  assert.throws(() => parseInput('{"source":[1,9],"target":[1,1]}'))
  assert.throws(() => parseInput('[1,1]'))
})
