import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: test every triple of stored points with the query for an exact axis-aligned square.
function oracle(ops) {
  const stored = []
  const out = []
  for (const [kind, [x, y]] of ops) {
    if (kind === 'add') { stored.push([x, y]); continue }
    let total = 0
    for (let a = 0; a < stored.length; a++) for (let b = a + 1; b < stored.length; b++) for (let c = b + 1; c < stored.length; c++) {
      const pts = [[x, y], stored[a], stored[b], stored[c]]
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
      const side = Math.max(...xs) - Math.min(...xs)
      if (side <= 0 || side !== Math.max(...ys) - Math.min(...ys)) continue
      const corners = [[Math.min(...xs), Math.min(...ys)], [Math.min(...xs), Math.max(...ys)], [Math.max(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]]
      const same = corners.every(([cx, cy]) => pts.some(([px, py]) => px === cx && py === cy)) && new Set(pts.map(String)).size === 4
      if (same) total++
    }
    out.push(total)
  }
  return out
}

test('examples', () => {
  assert.deepEqual(solve('[["add",[3,10]],["add",[11,2]],["add",[3,2]],["count",[11,10]],["count",[14,8]],["add",[11,2]],["count",[11,10]]]'), [1, 0, 2])
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[["add",[1,1]],["count",[2,2]]]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('class '))
})

test('random operation streams match the triple oracle', () => {
  let state = 409
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 120; t++) {
    const ops = Array.from({ length: 2 + rand(12) }, () => [rand(3) === 0 ? 'count' : 'add', [rand(5), rand(5)]])
    assert.deepEqual(solve(JSON.stringify(ops)), oracle(ops), JSON.stringify(ops))
  }
})
