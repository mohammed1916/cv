import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1604 official examples', () => {
  assert.deepEqual(solve('{"keyName":["daniel","daniel","daniel","luis","luis","luis","luis"],"keyTime":["10:00","10:40","11:00","09:00","11:00","13:00","15:00"]}'), ['daniel'])
  assert.deepEqual(solve('{"keyName":["alice","alice","alice","bob","bob","bob","bob"],"keyTime":["12:01","12:00","18:00","21:00","21:20","21:30","23:00"]}'), ['bob'])
  assert.deepEqual(solve('{"keyName":["john","john","john"],"keyTime":["23:58","23:59","00:01"]}'), [])
  assert.deepEqual(solve('{"keyName":["leslie","leslie","leslie","clare","clare","clare","clare"],"keyTime":["13:00","13:20","14:00","18:00","18:51","19:30","19:49"]}'), ['clare', 'leslie'])
})

test('1604 exactly sixty minutes counts, sixty-one does not', () => {
  assert.deepEqual(solve('{"keyName":["ann","ann","ann"],"keyTime":["10:00","10:30","11:00"]}'), ['ann'])
  assert.deepEqual(solve('{"keyName":["ann","ann","ann"],"keyTime":["10:00","10:30","11:01"]}'), [])
})

test('1604 rejects a malformed time', () => {
  assert.throws(() => parseInput('{"keyName":["ann"],"keyTime":["24:00"]}'))
})

// Independent oracle: try every triple of one name's swipes, with no sorting.
function oracle(keyName, keyTime) {
  const toMinutes = clock => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3))
  const groups = {}
  keyName.forEach((name, i) => { (groups[name] ??= []).push(toMinutes(keyTime[i])) })
  const alerts = []
  for (const [name, times] of Object.entries(groups)) {
    let hit = false
    for (let a = 0; a < times.length; a++) {
      for (let b = a + 1; b < times.length; b++) {
        for (let c = b + 1; c < times.length; c++) {
          const lo = Math.min(times[a], times[b], times[c]), hi = Math.max(times[a], times[b], times[c])
          if (hi - lo <= 60) hit = true
        }
      }
    }
    if (hit) alerts.push(name)
  }
  return alerts.sort()
}

test('1604 random swipes match a triple-scan oracle', () => {
  let seed = 1604
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const names = ['ann', 'bob', 'cy', 'dee']
  for (let round = 0; round < 250; round++) {
    const count = 1 + rnd(12)
    const keyName = [], keyTime = []
    for (let i = 0; i < count; i++) {
      keyName.push(names[rnd(names.length)])
      const minute = 540 + rnd(240)
      keyTime.push(`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`)
    }
    const text = JSON.stringify({ keyName, keyTime })
    assert.deepEqual(solve(text), oracle(keyName, keyTime), text)
  }
})
