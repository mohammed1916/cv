import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, clock, code, python, phases } from './algorithm.js'

const solve = access_times => [...buildTrace({ access_times }).result].sort()

test('2933 hand-computed: 40 minutes qualifies, exactly 60 does not', () => {
  assert.deepEqual(solve([['mia', '0910'], ['leo', '1305'], ['mia', '0950'], ['leo', '1405'], ['mia', '0935'], ['leo', '1335']]), ['mia'])
})

test('2933 hand-computed: 59 minutes qualifies', () => {
  assert.deepEqual(solve([['kai', '1000'], ['kai', '1030'], ['kai', '1059']]), ['kai'])
  assert.deepEqual(solve([['kai', '1000'], ['kai', '1030'], ['kai', '1100']]), [])
})

test('2933 midnight does not wrap', () => {
  assert.deepEqual(solve([['zed', '2340'], ['zed', '0010'], ['zed', '2355']]), [])
})

test('2933 repeated times each count', () => {
  assert.deepEqual(solve([['ana', '0700'], ['bob', '1200'], ['ana', '0700'], ['ana', '0700']]), ['ana'])
})

test('2933 a late trio is found after an early gap', () => {
  assert.deepEqual(solve([['eve', '0100'], ['eve', '0500'], ['eve', '0900'], ['eve', '0905'], ['eve', '0910']]), ['eve'])
})

test('2933 single record', () => {
  assert.deepEqual(solve([['solo', '1234']]), [])
})

test('2933 clock formats minutes', () => {
  assert.equal(clock(0), '00:00')
  assert.equal(clock(1439), '23:59')
})

test('2933 parseInput rejects bad input', () => {
  assert.doesNotThrow(() => parseInput('{"access_times":[["a","0000"],["b","2359"]]}'))
  assert.throws(() => parseInput('{"access_times":[]}'))
  assert.throws(() => parseInput('{"access_times":[["a","2400"]]}'))
  assert.throws(() => parseInput('{"access_times":[["a","1260"]]}'))
  assert.throws(() => parseInput('{"access_times":[["A","1200"]]}'))
  assert.throws(() => parseInput('{"access_times":[["a","120"]]}'))
  assert.throws(() => parseInput('{"access_times":[["abcdefghijk","1200"]]}'))
  assert.throws(() => parseInput('[]'))
})

// Oracle: tries every triple of records for every employee, with no sorting.
function oracle(records) {
  const out = new Set()
  const minutes = stamp => Number(stamp.slice(0, 2)) * 60 + Number(stamp.slice(2))
  for (let i = 0; i < records.length; i++) for (let j = i + 1; j < records.length; j++) for (let k = j + 1; k < records.length; k++) {
    if (records[i][0] !== records[j][0] || records[j][0] !== records[k][0]) continue
    const times = [records[i], records[j], records[k]].map(record => minutes(record[1]))
    if (Math.max(...times) - Math.min(...times) < 60) out.add(records[i][0])
  }
  return [...out].sort()
}

test('2933 agrees with an all-triples oracle on random records', () => {
  let seed = 2933
  const rand = limit => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % limit }
  for (let t = 0; t < 600; t++) {
    const span = [90, 240, 1440][rand(3)]
    const records = Array.from({ length: 1 + rand(14) }, () => {
      const at = rand(span) + (span === 1440 ? 0 : 480)
      return ['abc'[rand(3)], `${String(Math.floor(at / 60)).padStart(2, '0')}${String(at % 60).padStart(2, '0')}`]
    })
    assert.deepEqual(solve(records), oracle(records), JSON.stringify(records))
  }
})

test('2933 frames are well formed', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const lines = python.split('\n')
  for (const records of [
    [['mia', '0910'], ['leo', '1305'], ['mia', '0950'], ['leo', '1405'], ['mia', '0935'], ['leo', '1335']],
    [['zed', '2340'], ['zed', '0010'], ['zed', '2355']],
    [['ana', '0700'], ['bob', '1200'], ['ana', '0700'], ['ana', '0700']],
  ]) {
    const { frames, result } = buildTrace(parseInput(JSON.stringify({ access_times: records })))
    for (const frame of frames) {
      assert.ok(ids.has(frame.phase), frame.phase)
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      const line = lines[frame.pythonLine - 1]
      assert.ok(line.trim() && !line.trim().startsWith('def '), line)
      assert.ok(frame.message.length > 0)
      if (frame.phase === 'check') assert.equal(frame.gap, frame.sorted[frame.current][frame.i] - frame.sorted[frame.current][frame.i - 2])
    }
    assert.equal(frames.filter(frame => frame.phase === 'read').length, records.length)
    assert.deepEqual(frames.at(-1).answer, result)
    assert.equal(frames.at(-1).phase, 'done')
  }
})
