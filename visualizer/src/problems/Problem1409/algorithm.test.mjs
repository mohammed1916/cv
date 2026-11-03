import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: the same rule written with a plain array rebuild, not indexOf/filter.
function reference(m, queries) {
  const list = []
  for (let v = 1; v <= m; v++) list.push(v)
  return queries.map(q => {
    let p = 0
    while (list[p] !== q) p++
    list.splice(p, 1)
    list.unshift(q)
    return p
  })
}

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 0)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('sample of the move-to-front rule gives positions 2, 1, 2, 1', () => {
  assert.deepEqual(buildTrace({ m: 5, queries: [3, 1, 2, 1] }).result, [2, 1, 2, 1])
})

test('repeated front value is always at position 0 after the first query', () => {
  assert.deepEqual(buildTrace({ m: 4, queries: [4, 4, 4] }).result, [3, 0, 0])
})

test('single-item list', () => {
  assert.deepEqual(buildTrace({ m: 1, queries: [1] }).result, [0])
})

test('random inputs agree with the independent oracle', () => {
  let state = 17
  const rand = n => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rand(10)
    const queries = Array.from({ length: 1 + rand(10) }, () => 1 + rand(m))
    assert.deepEqual(buildTrace({ m, queries }).result, reference(m, queries), JSON.stringify({ m, queries }))
  }
})

test('every frame is well formed and the final frame is done', () => {
  checkFrames(buildTrace({ m: 5, queries: [3, 1, 2, 1] }))
})

test('parser rejects out-of-range queries and bad shapes', () => {
  assert.throws(() => parseInput('{"m":3,"queries":[4]}'), /from 1 to 3/)
  assert.throws(() => parseInput('{"m":0,"queries":[1]}'))
  assert.throws(() => parseInput('{"m":3,"queries":[]}'))
  assert.deepEqual(parseInput('{"m":2,"queries":[2,1]}'), { m: 2, queries: [2, 1] })
})
