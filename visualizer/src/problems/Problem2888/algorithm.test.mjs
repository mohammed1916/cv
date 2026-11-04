import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python, code, phases } from './algorithm.js'

const row = (student_id, name, age) => ({ student_id, name, age })

test('2888 hand-computed stack keeps order', () => {
  const df1 = [row(11, 'Priya', 9), row(12, 'Tomas', 14)]
  const df2 = [row(21, 'Nadia', 10)]
  assert.deepEqual(buildTrace({ df1, df2 }).result, [row(11, 'Priya', 9), row(12, 'Tomas', 14), row(21, 'Nadia', 10)])
})

test('2888 empty sides and duplicates', () => {
  assert.deepEqual(buildTrace({ df1: [], df2: [] }).result, [])
  assert.deepEqual(buildTrace({ df1: [row(1, 'A', 2)], df2: [] }).result, [row(1, 'A', 2)])
  assert.deepEqual(buildTrace({ df1: [], df2: [row(1, 'A', 2)] }).result, [row(1, 'A', 2)])
  assert.equal(buildTrace({ df1: [row(1, 'A', 2)], df2: [row(1, 'A', 2)] }).result.length, 2)
})

test('2888 parseInput rejects a bad schema', () => {
  assert.throws(() => parseInput('{"df1":[]}'))
  assert.throws(() => parseInput('{"df1":[{"student_id":1,"name":"A"}],"df2":[]}'))
  assert.throws(() => parseInput('{"df1":[{"student_id":"1","name":"A","age":2}],"df2":[]}'))
  assert.doesNotThrow(() => parseInput('{"df1":[],"df2":[]}'))
})

test('2888 random frames match array spread, labels run 0 to n-1', () => {
  let seed = 2888
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const make = () => Array.from({ length: rnd(6) }, () => row(rnd(9), `s${rnd(9)}`, rnd(30)))
    const df1 = make(), df2 = make()
    const run = buildTrace({ df1, df2 })
    assert.deepEqual(run.result, [...df1, ...df2])
    const last = run.frames.at(-1)
    assert.deepEqual(last.out.map(r => r.index), run.result.map((_, i) => i))
  }
})

test('2888 frames are well formed', () => {
  const pyCount = python.trim().split('\n').length
  const ids = new Set(phases.map(p => p.id))
  for (const input of [{ df1: [row(1, 'A', 2)], df2: [row(3, 'B', 4)] }, { df1: [], df2: [] }]) {
    const { frames } = buildTrace(input)
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyCount)
      assert.ok(python.trim().split('\n')[f.pythonLine - 1].trim().length > 0)
      assert.ok(f.message.length > 0)
    }
    assert.equal(frames.at(-1).phase, 'done')
  }
})

test('2888 df2 rows use the df2 pseudocode line', () => {
  const { frames } = buildTrace({ df1: [row(1, 'A', 2)], df2: [row(3, 'B', 4)] })
  const a = frames.find(f => f.source === 'df1' && f.sourceIndex === 0)
  const b = frames.find(f => f.source === 'df2' && f.sourceIndex === 0)
  assert.equal(code[a.activeLine - 1].text.trim(), 'append it to the result with the next row label')
  assert.equal(code[b.activeLine - 1].text.trim(), 'append it to the result with the next row label')
  assert.notEqual(a.activeLine, b.activeLine)
})
