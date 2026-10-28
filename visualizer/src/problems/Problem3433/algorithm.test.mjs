import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (numberOfUsers, events) => buildTrace({ numberOfUsers, events }).result

test('3433 official examples', () => {
  const offline = ['OFFLINE', '11', '0']
  assert.deepEqual(solve(2, [['MESSAGE', '10', 'id1 id0'], offline, ['MESSAGE', '71', 'HERE']]), [2, 2])
  assert.deepEqual(solve(2, [['MESSAGE', '10', 'id1 id0'], offline, ['MESSAGE', '71', 'ALL']]), [2, 2])
})

test('3433 a user offline at HERE time is skipped, and ALL still reaches them', () => {
  assert.deepEqual(solve(2, [['OFFLINE', '10', '0'], ['MESSAGE', '12', 'HERE']]), [0, 1])
  assert.deepEqual(solve(2, [['OFFLINE', '10', '0'], ['MESSAGE', '12', 'ALL']]), [1, 1])
})

test('3433 rejects an id outside the user range', () => {
  assert.throws(() => parseInput('{"numberOfUsers":2,"events":[["MESSAGE","1","id5"]]}'))
})

// Independent oracle: for each message, decide offline status directly from the offline windows,
// instead of tracking a back-online time per user.
function oracle(numberOfUsers, events) {
  const windows = events.filter(e => e[0] === 'OFFLINE').map(e => [Number(e[2]), Number(e[1]), Number(e[1]) + 60])
  const counts = Array(numberOfUsers).fill(0)
  const offlineAt = (u, t) => windows.some(([who, s, end]) => who === u && s <= t && t < end)
  for (const [kind, text, value] of events) {
    if (kind !== 'MESSAGE') continue
    const t = Number(text)
    if (value === 'ALL') {
      for (let u = 0; u < numberOfUsers; u++) counts[u]++
    } else if (value === 'HERE') {
      for (let u = 0; u < numberOfUsers; u++) if (!offlineAt(u, t)) counts[u]++
    } else {
      for (const tok of value.split(' ')) counts[Number(tok.slice(2))]++
    }
  }
  return counts
}

test('3433 random event logs match a window-check oracle', () => {
  let seed = 3433
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const numberOfUsers = 1 + rnd(4)
    const events = []
    const windows = []
    const count = 1 + rnd(8)
    for (let i = 0; i < count; i++) {
      const time = 1 + rnd(150)
      if (rnd(2) === 0) {
        const u = rnd(numberOfUsers)
        // Only an online user can go offline, as in the statement.
        if (windows.some(([who, s, end]) => who === u && s <= time && time < end)) continue
        windows.push([u, time, time + 60])
        events.push(['OFFLINE', String(time), String(u)])
      } else {
        const mode = rnd(3)
        let value
        if (mode === 0) value = 'ALL'
        else if (mode === 1) value = 'HERE'
        else value = Array.from({ length: 1 + rnd(3) }, () => `id${rnd(numberOfUsers)}`).join(' ')
        events.push(['MESSAGE', String(time), value])
      }
    }
    if (events.length === 0) continue
    const input = { numberOfUsers, events }
    assert.deepEqual(solve(numberOfUsers, events), oracle(numberOfUsers, events), JSON.stringify(input))
  }
})
