import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = books => buildTrace({ books }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = b => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(max_books(${JSON.stringify(b)}))`]).toString().trim())

function brute(books) {
  let best = 0
  const n = books.length
  for (let l = 0; l < n; l++) for (let r = l; r < n; r++) {
    // Enumerate every strictly increasing choice of counts for l..r.
    const rec = (k, prev, sum) => {
      if (k > r) { best = Math.max(best, sum); return }
      for (let c = 0; c <= books[k]; c++) {
        if (k > l && c <= prev) continue
        rec(k + 1, c, sum + c)
      }
    }
    rec(l, -1, 0)
  }
  return best
}

test('2355 worked examples', () => {
  assert.equal(solve([8, 5, 2, 7, 9]), 19)
  assert.equal(solve([1, 2, 3]), 6)
  assert.equal(solve([0, 0]), 0)
})

test('2355 frames point at real python lines', () => {
  for (const f of buildTrace({ books: [3, 2, 1] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2355 rejects bad input', () => {
  assert.throws(() => parseInput('{"books":[13]}'))
})

test('2355 random shelves match an exhaustive search and the python mirror', () => {
  let seed = 2355
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 100; t++) {
    const books = Array.from({ length: 1 + rnd(5) }, () => rnd(6))
    assert.equal(solve(books), brute(books), JSON.stringify(books))
    if (t < 8) assert.equal(runPy(books), brute(books))
  }
})
