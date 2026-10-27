import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = board => buildTrace(parseInput(JSON.stringify({ board }))).result

test('1301 official examples', () => {
  assert.deepEqual(solve(['E23', '2X2', '12S']), [7, 1])
  assert.deepEqual(solve(['E12', '1X1', '21S']), [4, 2])
  assert.deepEqual(solve(['E11', 'XXX', '11S']), [0, 0])
})

test('1301 equal routes add their path counts', () => {
  // Two routes both score 9, and the direct diagonal scores 0.
  assert.deepEqual(solve(['E9', '9S']), [9, 2])
})

test('1301 rejects a board without exactly one S', () => {
  assert.throws(() => parseInput(JSON.stringify({ board: ['ES', 'SS'] })))
})

// Independent oracle: enumerate every move sequence from S to E and score each one.
function oracle(board) {
  const n = board.length
  const value = ch => (ch >= '0' && ch <= '9' ? Number(ch) : 0)
  let best = -1
  let count = 0
  const walk = (r, c, sum) => {
    if (r === 0 && c === 0) {
      if (sum > best) { best = sum; count = 1 } else if (sum === best) count += 1
      return
    }
    for (const [dr, dc] of [[-1, 0], [0, -1], [-1, -1]]) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || board[nr][nc] === 'X') continue
      walk(nr, nc, sum + value(board[nr][nc]))
    }
  }
  walk(n - 1, n - 1, 0)
  return best < 0 ? [0, 0] : [best, count % 1000000007]
}

test('1301 random boards match an enumeration of every path', () => {
  let seed = 1301
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(3)
    const board = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => {
      if (r === 0 && c === 0) return 'E'
      if (r === n - 1 && c === n - 1) return 'S'
      return rnd(4) === 0 ? 'X' : String(rnd(10))
    }).join(''))
    assert.deepEqual(solve(board), oracle(board), JSON.stringify(board))
  }
})
