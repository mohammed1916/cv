import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, examples, phases, stages, code, python, LIMIT } from './algorithm.js'

const a = (name, weight) => ({ name, species: 'x', age: 1, weight })
const solve = animals => buildTrace({ animals }).result

test('2891 hand-computed tables', () => {
  assert.deepEqual(solve(JSON.parse(examples[0].input).animals), ['Sunny', 'Juniper', 'Bruno'])
  assert.deepEqual(solve(JSON.parse(examples[1].input).animals), [])
  assert.deepEqual(solve(JSON.parse(examples[2].input).animals), ['Lark', 'Ivo'])
  assert.deepEqual(solve([]), [])
})

test('2891 the limit is strict', () => {
  assert.deepEqual(solve([a('edge', 100)]), [])
  assert.deepEqual(solve([a('over', 101)]), ['over'])
  assert.deepEqual(solve([a('under', 99), a('edge', 100), a('over', 101)]), ['over'])
})

test('2891 equal weights keep their table order', () => {
  assert.deepEqual(solve([a('first', 200), a('second', 200), a('third', 300)]), ['third', 'first', 'second'])
})

test('2891 random tables match filter-then-stable-sort', () => {
  let seed = 2891
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % n }
  for (let t = 0; t < 400; t++) {
    const rows = Array.from({ length: rnd(13) }, (_, i) => a(`n${i}`, rnd(300)))
    const expected = rows.filter(r => r.weight > LIMIT).sort((x, y) => y.weight - x.weight).map(r => r.name)
    assert.deepEqual(solve(rows), expected, JSON.stringify(rows))
  }
})

test('2891 parseInput rejects bad tables', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"animals":[{"name":"a","species":"b","age":1}]}'))
  assert.throws(() => parseInput(JSON.stringify({ animals: Array.from({ length: 13 }, (_, i) => a(`n${i}`, 1)) })))
})

test('2891 mask frames evaluate every row and the sort reaches the result', () => {
  const { frames, result } = buildTrace(parseInput(examples[0].input))
  const maskFrames = frames.filter(f => f.phase === 'mask')
  assert.equal(maskFrames.length, 6)
  assert.deepEqual(maskFrames.at(-1).mask, [true, false, true, false, true, false])
  assert.equal(frames.find(f => f.phase === 'filter').rows.length, 3)
  assert.deepEqual(frames.filter(f => f.phase === 'sort').at(-1).rows.map(r => r.name), result)
  assert.deepEqual(frames.at(-1).columns, ['name'])
})

test('2891 frames are well formed on every example', () => {
  const ids = new Set(phases.map(p => p.id))
  const stageIds = new Set(stages.map(s => s.id))
  const pyLines = python.trim().split('\n')
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    for (const f of buildTrace(parseInput(example.input)).frames) {
      assert.ok(ids.has(f.phase) && stageIds.has(f.stage))
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines.length)
      assert.notEqual(pyLines[f.pythonLine - 1].trim(), '')
      assert.ok(f.message.length > 0)
    }
  }
})
