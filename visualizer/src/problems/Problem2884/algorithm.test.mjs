import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm.js'

const rows = list => list.map(([name, salary]) => ({ name, salary }))
const solve = list => buildTrace({ employees: rows(list) }).result

test('2884 hand-computed cases', () => {
  assert.deepEqual(solve([['Ana', 100], ['Bo', 2500]]), rows([['Ana', 200], ['Bo', 5000]]))
  assert.deepEqual(solve([['Zed', 0]]), rows([['Zed', 0]]))
  assert.deepEqual(solve([['Sam', 7], ['Sam', 9]]), rows([['Sam', 14], ['Sam', 18]]))
  assert.deepEqual(solve([]), [])
})

test('2884 does not change the caller rows, and matches a column oracle', () => {
  let seed = 2884
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const employees = Array.from({ length: rnd(13) }, (_, i) => ({ name: `p${rnd(4)}`, salary: rnd(100000) + i }))
    const copy = JSON.parse(JSON.stringify(employees))
    const { result } = buildTrace({ employees })
    assert.deepEqual(employees, copy)
    assert.deepEqual(result.map(r => r.name), copy.map(r => r.name))
    assert.deepEqual(result.map(r => r.salary - r.salary / 2), copy.map(r => r.salary))
  }
})

test('2884 parseInput rejects malformed rows', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"employees":[{"name":"","salary":1}]}'))
  assert.throws(() => parseInput('{"employees":[{"name":"a","salary":1.5}]}'))
  assert.throws(() => parseInput('{"employees":[{"name":"a"}]}'))
  assert.throws(() => parseInput(JSON.stringify({ employees: Array.from({ length: 13 }, () => ({ name: 'a', salary: 1 })) })))
})

test('2884 every example runs and frames map to real lines', () => {
  const ids = new Set(phases.map(p => p.id))
  const lines = python.trim().split('\n')
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const { frames, input } = buildTrace(parseInput(example.input))
    assert.equal(frames[0].phase, 'load')
    assert.equal(frames.at(-1).phase, 'done')
    assert.equal(frames.filter(f => f.phase === 'write').length, input.employees.length)
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.message.length > 0)
      assert.ok(code.some(c => c.line === f.activeLine))
      assert.ok(lines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
    }
  }
})

test('2884 only the active row changes at each write', () => {
  const { frames } = buildTrace({ employees: rows([['a', 1], ['b', 2], ['c', 3]]) })
  for (let i = 1; i < frames.length; i++) {
    const changed = frames[i].salaries.flatMap((v, j) => (v !== frames[i - 1].salaries[j] ? [j] : []))
    assert.deepEqual(changed, frames[i].phase === 'write' ? [frames[i].at] : [])
  }
})
