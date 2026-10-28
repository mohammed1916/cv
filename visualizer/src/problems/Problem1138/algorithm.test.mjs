import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = target => buildTrace(parseInput(JSON.stringify({ target }))).result

test('1138 official examples', () => {
  assert.equal(solve('leet'), 'DDR!UURRR!!DDD!')
  assert.equal(solve('code'), 'RR!DDRR!UUL!R!')
})

test('1138 z is reached from its own column, so it needs down moves only at the end', () => {
  assert.equal(solve('z'), 'DDDDD!')
  assert.equal(solve('a'), '!')
})

test('1138 rejects uppercase letters and empty targets', () => {
  assert.throws(() => parseInput('{"target":"Leet"}'))
  assert.throws(() => parseInput('{"target":""}'))
})

// Independent oracle: replay the moves on the board and check every segment against a BFS distance.
const cell = i => ({ row: Math.floor(i / 5), col: i % 5 })
const valid = (r, c) => r >= 0 && c >= 0 && c < 5 && r * 5 + c < 26
function bfsDistance(from, to) {
  const key = (r, c) => `${r}:${c}`
  const queue = [[from.row, from.col, 0]]
  const seen = new Set([key(from.row, from.col)])
  for (let head = 0; head < queue.length; head++) {
    const [r, c, d] = queue[head]
    if (r === to.row && c === to.col) return d
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr
      const nc = c + dc
      if (valid(nr, nc) && !seen.has(key(nr, nc))) {
        seen.add(key(nr, nc))
        queue.push([nr, nc, d + 1])
      }
    }
  }
  throw new Error('unreachable')
}

// Replays the moves from a, returning the letters selected by each !.
function replay(moves) {
  let r = 0
  let c = 0
  let typed = ''
  for (const ch of moves) {
    if (ch === '!') typed += String.fromCharCode(97 + r * 5 + c)
    else {
      const [dr, dc] = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] }[ch]
      r += dr
      c += dc
      if (!valid(r, c)) throw new Error('left the board')
    }
  }
  return { typed }
}

test('1138 seeded targets match a BFS and replay oracle', () => {
  let seed = 1138
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 300; t++) {
    const target = Array.from({ length: 1 + rnd(8) }, () => letters[rnd(26)]).join('')
    const moves = solve(target)
    const { typed } = replay(moves)
    assert.equal(typed, target, target)
    // Each segment between selections must be a shortest walk: its length equals the BFS distance.
    let from = { row: 0, col: 0 }
    let segment = ''
    let total = 0
    let ci = 0
    for (const ch of moves) {
      if (ch === '!') {
        const goal = cell(target.charCodeAt(ci) - 97)
        assert.equal(segment.length, bfsDistance(from, goal), `${target} segment ${ci}`)
        total += segment.length
        from = goal
        segment = ''
        ci++
      } else segment += ch
    }
    assert.equal(total + target.length, moves.length)
  }
})
