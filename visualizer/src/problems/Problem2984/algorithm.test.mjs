import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm.js'

const call = (caller_id, recipient_id, call_time, city) => ({ caller_id, recipient_id, call_time, city })
const summary = result => result.map(row => [row.city, row.peak_calling_hour, row.number_of_calls])

test('2984 hand-computed examples', () => {
  assert.deepEqual(summary(buildTrace(parseInput(examples[0].input)).result), [['Lima', 21, 2], ['Oslo', 17, 3], ['Lima', 8, 2]])
  assert.deepEqual(summary(buildTrace(parseInput(examples[1].input)).result), [['Cairo', 6, 1], ['Accra', 6, 2]])
  assert.deepEqual(buildTrace(parseInput(examples[2].input)).result, [])
})

test('2984 dates are ignored and midnight is hour 0', () => {
  const { result } = buildTrace({ Calls: [call(1, 2, '2020-01-01 00:00:00', 'Rome'), call(1, 2, '2021-06-30 00:59:59', 'Rome'), call(1, 2, '2021-06-30 23:00:00', 'Rome')] })
  assert.deepEqual(summary(result), [['Rome', 0, 2]])
})

test('2984 a city where every hour ties keeps all of them', () => {
  const { result } = buildTrace({ Calls: [call(1, 2, '2020-01-01 03:00:00', 'Rome'), call(1, 2, '2020-01-01 04:00:00', 'Rome'), call(1, 2, '2020-01-01 05:00:00', 'Rome')] })
  assert.deepEqual(result.map(row => row.peak_calling_hour), [5, 4, 3])
})

// Oracle: for every city and all 24 hours, count by filtering the table, with no shared grouping code.
function oracle(Calls) {
  const out = []
  for (const city of new Set(Calls.map(row => row.city))) {
    const tally = Array.from({ length: 24 }, (_, hour) => Calls.filter(row => row.city === city && Number(row.call_time.split(' ')[1].split(':')[0]) === hour).length)
    const most = Math.max(...tally)
    tally.forEach((count, hour) => { if (count === most) out.push([city, hour, count]) })
  }
  return out.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))
}

test('2984 matches the oracle on random tables', () => {
  let seed = 29
  const next = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  const names = ['Accra', 'Baku', 'Cairo', 'Doha']
  for (let round = 0; round < 500; round++) {
    const Calls = []
    const size = 1 + next(16)
    for (let i = 0; i < size; i++) {
      Calls.push(call(i, next(5), `2023-0${1 + next(9)}-1${next(9)} ${String(next(24)).padStart(2, '0')}:00:00`, names[next(names.length)]))
    }
    assert.deepEqual(summary(buildTrace({ Calls }).result), oracle(Calls))
  }
})

test('2984 parseInput rejects bad tables', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"Calls":[{"caller_id":1}]}'))
  assert.throws(() => parseInput(JSON.stringify({ Calls: [call(1, 2, '2023-02-30 10:00:00', 'A')] })))
  assert.throws(() => parseInput(JSON.stringify({ Calls: [call(1, 2, '2023-02-03 24:00:00', 'A')] })))
  assert.throws(() => parseInput(JSON.stringify({ Calls: [call(1, 2, '2023-02-03 10:00:00', 'A'), call(1, 2, '2023-02-03 10:00:00', 'A')] })))
  assert.throws(() => parseInput(JSON.stringify({ Calls: [call(1, 2, '2023-02-03 10:00:00', 'Oslo'), call(2, 2, '2023-02-03 10:00:00', 'OSLO')] })))
})

test('2984 frames are complete and groups only grow while counting', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const pyCount = python.trim().split('\n').length
  for (const { input } of examples) {
    const parsed = parseInput(input)
    const { frames, result } = buildTrace(parsed)
    for (const frame of frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
      assert.ok(frame.message.length > 0)
    }
    assert.deepEqual(frames.at(-1).output, result)
    const total = frames.at(-1).groups.reduce((sum, group) => sum + group.count, 0)
    assert.equal(total, parsed.Calls.length)
    assert.equal(frames.filter(frame => frame.phase === 'count').length, parsed.Calls.length)
  }
})
