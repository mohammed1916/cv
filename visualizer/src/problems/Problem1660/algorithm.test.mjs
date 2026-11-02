import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (root, bad) => buildTrace({ root, bad }).result
const codeLines = code.length
const pyLines = python.split('\n').length

test('1660 example: the defective right pointer drops the node and its subtree', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5, 6, 7], [2, 3]), [1, null, 3, null, null, 6, 7])
})

test('1660 another example at depth two keeps the target', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5, 6, 7], [4, 5]), [1, 2, 3, null, 5, 6, 7])
})

test('1660 rejects a pointer that is not sideways at the same depth', () => {
  assert.throws(() => parseInput('{"root":[1,2,3,4,5],"bad":[2,4]}'))
  assert.throws(() => parseInput('{"root":[1,2,3],"bad":[3,2]}'))
})

test('1660 frames point at real pseudocode and python lines', () => {
  const run = buildTrace({ root: [1, 2, 3, 4, 5, 6, 7], bad: [2, 3] })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

// Oracle: clear the defective node and its array subtree; heap indices keep every other node in place.
function oracle(values, from) {
  const out = values.slice()
  const kill = j => {
    if (j >= out.length || out[j] === null) return
    out[j] = null
    kill(2 * j + 1)
    kill(2 * j + 2)
  }
  kill(values.indexOf(from))
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

test('1660 random trees match a clear-subtree oracle', () => {
  let seed = 1660
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 400 && checked < 120; t++) {
    const size = 3 + rnd(10)
    const arrLen = 2 ** Math.ceil(Math.log2(size + 1)) - 1
    const pool = Array.from({ length: 30 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const values = []
    let filled = 0
    for (let i = 0; i < arrLen; i++) {
      const parentOk = i === 0 || values[Math.floor((i - 1) / 2)] !== null
      if (filled < size && parentOk && rnd(4) > 0) { values.push(pool[filled]); filled++ } else values.push(null)
    }
    while (values.length && values[values.length - 1] === null) values.pop()
    const pairs = []
    for (let i = 1; i < values.length; i++) {
      if (values[i] === null) continue
      for (let j = i + 1; j < values.length; j++) {
        if (values[j] !== null && Math.floor(Math.log2(i + 1)) === Math.floor(Math.log2(j + 1))) pairs.push([values[i], values[j]])
      }
    }
    if (!pairs.length) continue
    const bad = pairs[rnd(pairs.length)]
    checked++
    assert.deepEqual(solve(values, bad), oracle(values, bad[0]), JSON.stringify({ values, bad }))
  }
  assert.ok(checked > 20)
})
