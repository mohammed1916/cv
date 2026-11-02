import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('1739 official examples', () => {
  assert.equal(solve(3), 3)
  assert.equal(solve(4), 3)
  assert.equal(solve(10), 6)
})

test('1739 edge cases', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(2), 2)
  assert.equal(solve(1000000000) > 0, true)
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('1000000001'))
  assert.throws(() => parseInput('2.5'))
})

test('1739 the trace ends with the result and every frame names a python line', () => {
  const run = buildTrace({ n: 10 })
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).result, 6)
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(frame.activeLine >= 1)
    assert.equal(typeof frame.message, 'string')
  }
})

// Independent oracle: enumerate every stack of n unit boxes in a corner as a plane partition
// (heights never increase along either wall direction) and count the boxes on the floor.
// A box resting on another needs the four vertical sides of the box below covered by a
// neighbouring box or a wall; that is checked on the top box of each column.
function validStack(rows) {
  const H = (x, y) => (rows[x] && rows[x][y]) || 0
  for (let x = 0; x < rows.length; x++) {
    for (let y = 0; y < rows[x].length; y++) {
      const h = H(x, y)
      if (h < 2) continue
      const L = h - 2
      const covered = H(x + 1, y) > L && H(x, y + 1) > L
        && (x === 0 || H(x - 1, y) > L) && (y === 0 || H(x, y - 1) > L)
      if (!covered) return false
    }
  }
  return true
}

function bruteMinFloor(n) {
  let best = Infinity
  const nextRows = (prev, remaining) => {
    const out = []
    const dfs = (row, sum) => {
      if (row.length > 0) out.push(row.slice())
      const j = row.length
      if (prev && j >= prev.length) return
      const cap = Math.min(prev ? prev[j] : Infinity, row.length ? row[row.length - 1] : Infinity, remaining - sum)
      for (let h = 1; h <= cap; h++) {
        row.push(h)
        dfs(row, sum + h)
        row.pop()
      }
    }
    dfs([], 0)
    return out
  }
  const fill = (rows, prev, remaining, floor) => {
    if (remaining === 0) {
      if (validStack(rows)) best = Math.min(best, floor)
      return
    }
    for (const row of nextRows(prev, remaining)) {
      fill([...rows, row], row, remaining - row.reduce((a, b) => a + b, 0), floor + row.length)
    }
  }
  fill([], null, n, 0)
  return best
}

test('1739 matches a plane-partition oracle for small n', () => {
  for (let n = 1; n <= 13; n++) {
    assert.equal(solve(n), bruteMinFloor(n), `n = ${n}`)
  }
})
