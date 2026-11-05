import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: try every start cell and direction, and check the boundaries explicitly.
function oracle({ board, word }) {
  const rows = board.length, cols = board[0].length
  const dirs = [[0, 1], [1, 0]]
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) for (const [dr, dc] of dirs) for (const w of [word, [...word].reverse().join('')]) {
    const cells = []
    for (let k = 0; k < w.length; k++) {
      const rr = r + dr * k, cc = c + dc * k
      if (rr >= rows || cc >= cols) break
      cells.push([rr, cc])
    }
    if (cells.length !== w.length) continue
    const before = [r - dr, c - dc], after = [r + dr * w.length, c + dc * w.length]
    const blocked = ([y, x]) => y < 0 || x < 0 || y >= rows || x >= cols || board[y][x] === '#'
    if (!blocked(before) && before[0] >= 0 && before[1] >= 0) continue
    if (after[0] < rows && after[1] < cols && board[after[0]][after[1]] !== '#') continue
    if (cells.every(([y, x], k) => board[y][x] === ' ' || board[y][x] === w[k])) return true
  }
  return false
}

test('examples', () => {
  assert.equal(solve('{"board":["# #","   ","# #"],"word":"ab"}'), false)
  assert.equal(solve('{"board":[" # ","ba#"],"word":"ba"}'), true)
  assert.equal(solve('{"board":["c#","ab"],"word":"cb"}'), false)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"board":["  "],"word":"ab"}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random boards match the explicit placement oracle', () => {
  let state = 293
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  const alphabet = 'ab#  '
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rand(4), cols = 1 + rand(4)
    const board = Array.from({ length: rows }, () => Array.from({ length: cols }, () => alphabet[rand(alphabet.length)]).join(''))
    const word = Array.from({ length: 1 + rand(3) }, () => 'ab'[rand(2)]).join('')
    assert.equal(solve(JSON.stringify({ board, word })), oracle({ board, word }), JSON.stringify({ board, word }))
  }
})
