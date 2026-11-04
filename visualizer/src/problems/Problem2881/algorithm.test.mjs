import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = employees => buildTrace({ employees }).result

test('2881 hand-computed rows', () => {
  assert.deepEqual(solve([{ name: 'Mira', salary: 1200 }, { name: 'Tomas', salary: 950 }]), [
    { name: 'Mira', salary: 1200, bonus: 2400 },
    { name: 'Tomas', salary: 950, bonus: 1900 },
  ])
  assert.deepEqual(solve([{ name: 'Intern', salary: 0 }]), [{ name: 'Intern', salary: 0, bonus: 0 }])
})

test('2881 duplicate names keep their own bonus and the row order', () => {
  const out = solve([{ name: 'Sam', salary: 815 }, { name: 'Sam', salary: 700 }])
  assert.deepEqual(out.map(row => row.bonus), [1630, 1400])
})

test('2881 oracle: bonus equals salary plus salary, input untouched', () => {
  for (let trial = 0; trial < 200; trial++) {
    const rows = Array.from({ length: 1 + trial % 12 }, (_, i) => ({ name: `n${i}`, salary: (trial * 37 + i * 1009) % 100000 }))
    const copy = rows.map(row => ({ ...row }))
    const out = solve(rows)
    assert.deepEqual(rows, copy)
    out.forEach((row, i) => {
      assert.equal(row.name, copy[i].name)
      assert.equal(row.salary, copy[i].salary)
      assert.equal(row.bonus, copy[i].salary + copy[i].salary)
    })
  }
})

test('2881 parser', () => {
  assert.doesNotThrow(() => parseInput('{"employees":[{"name":"A","salary":3}]}'))
  assert.throws(() => parseInput('{"employees":[]}'))
  assert.throws(() => parseInput('{"employees":[{"name":"A","salary":1.5}]}'))
  assert.throws(() => parseInput('{"employees":[{"salary":1}]}'))
  assert.throws(() => parseInput('[1]'))
})

test('2881 frames fill one row at a time and attach once', () => {
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  const { frames } = buildTrace({ employees: [{ name: 'A', salary: 4 }, { name: 'B', salary: 9 }] })
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines.length)
    assert.ok(pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
  assert.deepEqual(frames.filter(f => f.phase === 'double').map(f => f.doubled), [[8, null], [8, 18]])
  assert.equal(frames.filter(f => f.phase === 'attach').length, 1)
  assert.ok(frames.findIndex(f => f.attached) > frames.findLastIndex(f => f.phase === 'double'))
  assert.equal(frames.at(-1).phase, 'done')
})

test('2881 python lines match what each phase runs', () => {
  const pyLines = python.trim().split('\n')
  const { frames } = buildTrace({ employees: [{ name: 'A', salary: 4 }] })
  const text = phase => pyLines[frames.find(f => f.phase === phase).pythonLine - 1]
  assert.match(text('double'), /\* 2/)
  assert.match(text('attach'), /\['bonus'\]/)
  assert.match(text('done'), /return/)
})
