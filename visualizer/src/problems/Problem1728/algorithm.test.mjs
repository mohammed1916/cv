import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, catJump, mouseJump) => buildTrace(parseInput(JSON.stringify({ grid, catJump, mouseJump }))).result

test('1728 official examples', () => {
  assert.equal(solve(['####F', '#C...', 'M....'], 1, 2), true)
  assert.equal(solve(['M.C...F'], 1, 4), true)
  assert.equal(solve(['M.C...F'], 1, 3), false)
})

test('1728 the mouse already on food wins at once', () => {
  assert.equal(solve(['F.C', 'M..'], 1, 1), true)
})

test('1728 rejects a grid without exactly one of each piece', () => {
  assert.throws(() => parseInput('{"grid":["MC."],"catJump":1,"mouseJump":1}'))
  assert.throws(() => parseInput('{"grid":["MCF","F.."],"catJump":1,"mouseJump":1}'))
  assert.throws(() => parseInput('{"grid":["MCF"],"catJump":0,"mouseJump":1}'))
})

// Independent oracle: value iteration on "the mouse can force food within k moves", stopping at a fixed
// point. A draw is not a mouse win, which matches the 1000-turn rule in the statement.
function oracle(grid, catJump, mouseJump) {
  const rows = grid.length
  const cols = grid[0].length
  const n = rows * cols
  const flat = grid.join('')
  const food = flat.indexOf('F')
  const reach = (cell, jump) => {
    const r0 = Math.floor(cell / cols)
    const c0 = cell % cols
    const out = [cell]
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      for (let s = 1; s <= jump; s++) {
        const r = r0 + dr * s
        const c = c0 + dc * s
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '#') break
        out.push(r * cols + c)
      }
    }
    return out
  }
  const mm = Array.from({ length: n }, (_, x) => reach(x, mouseJump))
  const mc = Array.from({ length: n }, (_, x) => reach(x, catJump))
  // win[m][c][t] is true when the mouse wins within the current number of moves.
  let win = Array.from({ length: n }, (_, m) => Array.from({ length: n }, () => [m === food, m === food]))
  for (let k = 0; k < 1000; k++) {
    let changed = false
    const next = win.map((row, m) => row.map((cell, c) => {
      const mouseTurn = m === food ? true : (c === food || c === m) ? false
        : mm[m].some(x => win[x][c][1])
      const catTurn = m === food ? true : (c === food || c === m) ? false
        : mc[c].every(y => win[m][y][0])
      return [mouseTurn, catTurn]
    }))
    for (let m = 0; m < n; m++) for (let c = 0; c < n; c++) for (let t = 0; t < 2; t++) if (next[m][c][t] !== win[m][c][t]) changed = true
    win = next
    if (!changed) break
  }
  const mouse = flat.indexOf('M')
  const cat = flat.indexOf('C')
  return win[mouse][cat][0]
}

test('1728 random boards match a value-iteration oracle', () => {
  let seed = 1728
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const rows = 1 + rnd(4)
    const cols = 1 + rnd(4)
    if (rows * cols < 3) continue
    const cells = Array.from({ length: rows * cols }, () => (rnd(10) < 3 ? '#' : '.'))
    const pick = []
    for (let i = 0; i < 3; i++) {
      let p
      do { p = rnd(rows * cols) } while (pick.includes(p))
      pick.push(p)
    }
    cells[pick[0]] = 'C'
    cells[pick[1]] = 'M'
    cells[pick[2]] = 'F'
    const grid = Array.from({ length: rows }, (_, r) => cells.slice(r * cols, r * cols + cols).join(''))
    const catJump = 1 + rnd(3)
    const mouseJump = 1 + rnd(3)
    assert.equal(solve(grid, catJump, mouseJump), oracle(grid, catJump, mouseJump), JSON.stringify({ grid, catJump, mouseJump }))
  }
})
