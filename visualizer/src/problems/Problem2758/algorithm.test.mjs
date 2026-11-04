import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, examples, javascript, isLeapYear } from './algorithm.js'

const solve = date => buildTrace({ date }).result

test('2758 hand-computed dates', () => {
  assert.equal(solve('2023-09-14'), '2023-09-15')
  assert.equal(solve('2023-04-30'), '2023-05-01')
  assert.equal(solve('2023-12-31'), '2024-01-01')
  assert.equal(solve('2028-02-28'), '2028-02-29')
  assert.equal(solve('2028-02-29'), '2028-03-01')
  assert.equal(solve('2100-02-28'), '2100-03-01')
  assert.equal(solve('2000-02-28'), '2000-02-29')
  assert.equal(solve('0999-12-31'), '1000-01-01')
})

test('2758 leap years', () => {
  assert.deepEqual([2024, 2023, 2000, 1900, 2100, 2400].map(isLeapYear), [true, false, true, false, false, true])
})

test('2758 rejects anything that is not a real date', () => {
  for (const bad of ['{"date":"2023-02-29"}', '{"date":"2023-13-01"}', '{"date":"2023-00-10"}', '{"date":"2023-04-31"}', '{"date":"20230401"}', '{"date":5}', '[]', '{"date":"9999-12-31"}']) {
    assert.throws(() => parseInput(bad), undefined, bad)
  }
  assert.doesNotThrow(() => parseInput('{"date":"2024-02-29"}'))
})

// Oracle: the JavaScript method shown on the page, on the real Date object, on every day of the span.
test('2758 matches the page\'s JavaScript method for every day from 1899 to 2300', () => {
  const had = Object.prototype.hasOwnProperty.call(Date.prototype, 'nextDay')
  assert.equal(had, false)
  new Function(javascript)()
  try {
    const current = new Date('1899-01-01')
    let checked = 0
    while (current.getUTCFullYear() <= 2300) {
      const text = current.toISOString().slice(0, 10)
      const before = current.getTime()
      assert.equal(solve(text), current.nextDay(), text)
      assert.equal(current.getTime(), before, 'the original date must not change')
      current.setUTCDate(current.getUTCDate() + 1)
      checked++
    }
    assert.ok(checked > 146000)
  } finally {
    delete Date.prototype.nextDay
  }
})

test('2758 frames are well formed', () => {
  const pythonLines = python.trim().split('\n')
  const ids = new Set(phases.map(phase => phase.id))
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.ok(run.frames.length >= 6)
    for (const frame of run.frames) {
      assert.ok(ids.has(frame.phase), frame.phase)
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonLines.length)
      assert.ok(pythonLines[frame.pythonLine - 1].trim().length > 0)
      assert.ok(frame.message.length > 0)
    }
    assert.equal(run.frames.at(-1).phase, 'done')
    assert.equal(run.frames.at(-1).result, run.result)
  }
})

test('2758 year carry is shown as separate steps', () => {
  const run = buildTrace({ date: '2023-12-31' })
  assert.ok(run.frames.some(frame => frame.phase === 'year' && frame.year === 2024 && frame.month === 1))
  assert.ok(run.frames.some(frame => frame.overflow === true && frame.day === 32))
  const plain = buildTrace({ date: '2023-09-14' })
  assert.ok(!plain.frames.some(frame => frame.phase === 'month' || frame.phase === 'year'))
})
