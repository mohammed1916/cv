import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (classroom, energy) => buildTrace({ classroom, energy }).result

// Oracle: plain BFS over every (cell, energy, litter set) with no energy pruning.
function oracle(classroom, energy) {
  const m = classroom.length, n = classroom[0].length
  const ids = new Map()
  let start
  classroom.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === 'S') start = [r, c]
    if (ch === 'L') ids.set(r * n + c, ids.size)
  }))
  const goal = (1 << ids.size) - 1
  if (goal === 0) return 0
  const seen = new Set([`${start},${energy},0`])
  let level = [[...start, energy, 0]]
  for (let moves = 1; level.length; moves++) {
    const next = []
    for (const [r, c, e, got] of level) {
      if (e === 0) continue
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const a = r + dr, b = c + dc
        if (a < 0 || b < 0 || a >= m || b >= n || classroom[a][b] === 'X') continue
        const ne = classroom[a][b] === 'R' ? energy : e - 1
        const ng = ids.has(a * n + b) ? got | 1 << ids.get(a * n + b) : got
        if (ng === goal) return moves
        const key = `${a},${b},${ne},${ng}`
        if (!seen.has(key)) { seen.add(key); next.push([a, b, ne, ng]) }
      }
    }
    level = next
  }
  return -1
}

test('3568 hand-computed cases', () => {
  assert.equal(solve(['S'], 1), 0)
  assert.equal(solve(['SL'], 1), 1)
  assert.equal(solve(['S.L'], 1), -1) // energy 0 on the empty middle cell
  assert.equal(solve(['S.L'], 2), 2)
  assert.equal(solve(['L.S.L'], 2), -1) // 2 energy reaches one end only
  assert.equal(solve(['L.S.L'], 6), 6) // left 2, then right 4
  assert.equal(solve(['SRL'], 1), 2) // the reset refills on arrival
  assert.equal(solve(['SX', 'XL'], 9), -1)
})

test('3568 stepping onto litter with the last energy is enough when it is the last piece', () => {
  assert.equal(solve(['S.L'], 2), 2)
  assert.equal(solve(['S.L.L'], 2), -1)
})

test('3568 a reset detour beats a straight walk that runs out', () => {
  // The straight route needs 3 energy from S; the reset at (1,0) is one step away.
  assert.equal(solve(['S.X', 'R.L'], 2), 3)
  assert.equal(oracle(['S.X', 'R.L'], 2), 3)
  assert.equal(solve(['S.X', 'R.L'], 1), -1)
})

test('3568 example grids match the oracle', () => {
  const examples = [
    [['L..X.', 'XX.XL', 'R.S..', '..X.R'], 4],
    [['S.X', '..X', 'XXL'], 9],
    [['S...L'], 3],
    [['S.', 'R.'], 1],
  ]
  for (const [classroom, energy] of examples) {
    const parsed = parseInput(JSON.stringify({ classroom, energy }))
    assert.equal(buildTrace(parsed).result, oracle(classroom, energy))
  }
  assert.equal(solve(['S.X', '..X', 'XXL'], 9), -1)
  assert.equal(solve(['S...L'], 3), -1)
  assert.equal(solve(['S.', 'R.'], 1), 0)
})

test('3568 random grids match the unpruned oracle', () => {
  let seed = 3568
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 500; t++) {
    const m = 1 + rnd(5), n = 1 + rnd(5)
    const cells = Array.from({ length: m * n }, () => '....RXX'[rnd(7)])
    cells[rnd(m * n)] = 'S'
    let placed = rnd(4)
    for (let i = 0; i < cells.length && placed > 0; i++) {
      const k = rnd(m * n)
      if (cells[k] !== 'S') { cells[k] = 'L'; placed-- }
    }
    const classroom = Array.from({ length: m }, (_, r) => cells.slice(r * n, (r + 1) * n).join(''))
    const energy = 1 + rnd(7)
    assert.equal(solve(classroom, energy), oracle(classroom, energy), JSON.stringify({ classroom, energy }))
  }
})

test('3568 the replayed route is legal and has the reported length', () => {
  const classroom = ['S.X', 'R.L'], energy = 2
  const { route, result, litter } = buildTrace({ classroom, energy })
  assert.equal(route.length - 1, result)
  let left = energy
  const remaining = new Set(litter.map(String))
  for (let i = 1; i < route.length; i++) {
    const [a, b] = route[i - 1], [r, c] = route[i]
    assert.equal(Math.abs(a - r) + Math.abs(b - c), 1)
    assert.notEqual(classroom[r][c], 'X')
    assert.ok(left > 0)
    left = classroom[r][c] === 'R' ? energy : left - 1
    remaining.delete(String([r, c]))
  }
  assert.equal(remaining.size, 0)
  assert.equal(result, 3)
})

test('3568 large open rooms stay bounded and still answer correctly', () => {
  const classroom = ['S.......', '........', '..L...L.', '........', '...R....', '.L......', '......L.', 'L......L']
  const run = buildTrace({ classroom, energy: 50 })
  assert.equal(run.result, oracle(classroom, 50))
  assert.ok(run.frames.length < 3000, String(run.frames.length))
})

test('3568 parse enforces the rules', () => {
  assert.throws(() => parseInput('{"classroom":["..."],"energy":3}'))
  assert.throws(() => parseInput('{"classroom":["SS"],"energy":3}'))
  assert.throws(() => parseInput('{"classroom":["S","LL"],"energy":3}'))
  assert.throws(() => parseInput('{"classroom":["S?"],"energy":3}'))
  assert.throws(() => parseInput('{"classroom":["S."],"energy":0}'))
  assert.throws(() => parseInput('{"classroom":["S."],"energy":51}'))
})

test('3568 frames are well formed', () => {
  const lines = python.split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const [classroom, energy] of [[['L..X.', 'XX.XL', 'R.S..', '..X.R'], 4], [['S...L'], 3], [['S.'], 1]]) {
    const { frames } = buildTrace({ classroom, energy })
    for (const frame of frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(code.some(c => c.line === frame.activeLine))
      assert.ok(lines[frame.pythonLine - 1].trim())
      assert.ok(frame.message.length > 0)
    }
    assert.equal(frames.at(-1).phase, 'done')
  }
})
