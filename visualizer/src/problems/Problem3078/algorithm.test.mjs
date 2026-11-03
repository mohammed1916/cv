import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = input => buildTrace(input).result
const pyLines = python.split('\n').length

function assertFrames(run) {
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
  }
}

test('3078 authored examples', () => {
  assert.deepEqual(solve({ board: [[1, 2, 3], [4, 4, 5]], pattern: ['aa'] }), [1, 0])
  assert.deepEqual(solve({ board: [[7, 1, 7, 2], [3, 1, 4, 1]], pattern: ['a1a'] }), [0, 0])
  assert.deepEqual(solve({ board: [[1, 2], [3, 4]], pattern: ['aa'] }), [-1, -1])
})

test('3078 rejects malformed boards and patterns', () => {
  assert.throws(() => parseInput('{"board":[[1,2],[3]],"pattern":["a"]}'))
  assert.throws(() => parseInput('{"board":[[1]],"pattern":["A"]}'))
})

// Oracle: try every injective letter-to-digit map for the pattern letters on every window.
function oracle({ board, pattern }) {
  const letters = [...new Set(pattern.join('').replace(/[0-9]/g, ''))]
  const literal = new Set(pattern.join('').replace(/[a-z]/g, '').split('').map(Number))
  const pr = pattern.length, pc = pattern[0].length
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const assignments = []
  const build = (idx, chosen, used) => {
    if (idx === letters.length) { assignments.push(chosen); return }
    for (const d of digits) {
      if (used.has(d) || literal.has(d)) continue
      used.add(d)
      build(idx + 1, { ...chosen, [letters[idx]]: d }, used)
      used.delete(d)
    }
  }
  build(0, {}, new Set())
  for (let r = 0; r + pr <= board.length; r++) {
    for (let c = 0; c + pc <= board[0].length; c++) {
      for (const map of assignments) {
        let ok = true
        for (let p = 0; p < pr && ok; p++)
          for (let q = 0; q < pc && ok; q++) {
            const ch = pattern[p][q]
            const v = board[r + p][c + q]
            ok = /[0-9]/.test(ch) ? v === Number(ch) : map[ch] === v
          }
        if (ok) return [r, c]
      }
    }
  }
  return [-1, -1]
}

test('3078 random boards match an assignment enumeration', () => {
  let seed = 3078
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const rows = 1 + rnd(4), cols = 1 + rnd(4)
    const board = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(4)))
    const pr = 1 + rnd(Math.min(rows, 2)), pc = 1 + rnd(Math.min(cols, 2))
    const alphabet = 'ab1'
    const pattern = Array.from({ length: pr }, () => Array.from({ length: pc }, () => alphabet[rnd(3)]).join(''))
    const input = { board, pattern }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
    assertFrames(buildTrace(input))
  }
})
