import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(grid).result
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

test('1263 worked examples', () => {
  // The box must be pushed left once, then up once.
  assert.equal(solve(['#######', '#T....#', '#.B...#', '#...S.#', '#######']), 2)
  // One push left: the player walks round to the right of the box.
  assert.equal(solve(['#####', '#TB.#', '#S..#', '#####']), 1)
  // The box is boxed in by walls on every side, so it can never move.
  assert.equal(solve(['#####', '#T#B#', '#S###', '#####']), -1)
})

test('1263 rejects a missing target and ragged rows', () => {
  assert.throws(() => parseInput(JSON.stringify(['#####', '#.B.#', '#S..#'])), /T/)
  assert.throws(() => parseInput(JSON.stringify(['####', '#TB.#', '#S..#'])))
})

// Independent oracle: relax every (box, player) state until no distance changes (Bellman-Ford style).
function oracle(grid) {
  const rows = grid.length, cols = grid[0].length
  const find = ch => { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === ch) return [r, c]; return null }
  const player = find('S'), box = find('B'), target = find('T')
  const open = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== '#'
  const dist = new Map([[`${box},${player}`, 0]])
  let changed = true
  while (changed) {
    changed = false
    for (const [k, cost] of [...dist]) {
      const [br, bc, pr, pc] = k.split(',').map(Number)
      for (const [dr, dc] of DIRS) {
        const nr = pr + dr, nc = pc + dc
        if (!open(nr, nc)) continue
        if (nr === br && nc === bc) {
          const qr = br + dr, qc = bc + dc
          if (!open(qr, qc)) continue
          const nk = `${qr},${qc},${br},${bc}`
          if (!dist.has(nk) || dist.get(nk) > cost + 1) { dist.set(nk, cost + 1); changed = true }
        } else {
          const nk = `${br},${bc},${nr},${nc}`
          if (!dist.has(nk) || dist.get(nk) > cost) { dist.set(nk, cost); changed = true }
        }
      }
    }
  }
  let best = -1
  for (const [k, cost] of dist) {
    const [br, bc] = k.split(',').map(Number)
    if (br === target[0] && bc === target[1] && (best === -1 || cost < best)) best = cost
  }
  return best
}

test('1263 random boards match a relaxation oracle', () => {
  let seed = 1263
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 300; t++) {
    const R = 2 + rnd(4), C = 2 + rnd(4)
    const g = Array.from({ length: R }, () => Array.from({ length: C }, () => (rnd(4) === 0 ? '#' : '.')))
    const floor = []
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (g[r][c] === '.') floor.push([r, c])
    if (floor.length < 3) continue
    const pick = () => floor.splice(rnd(floor.length), 1)[0]
    const [sr, sc] = pick(), [br, bc] = pick(), [tr, tc] = pick()
    g[sr][sc] = 'S'; g[br][bc] = 'B'; g[tr][tc] = 'T'
    const grid = g.map(row => row.join(''))
    let input
    try { input = parseInput(JSON.stringify(grid)) } catch { continue }
    checked++
    assert.equal(solve(input), oracle(grid), JSON.stringify(grid))
  }
  assert.ok(checked > 100)
})
