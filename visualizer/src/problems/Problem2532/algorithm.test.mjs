import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (n, k, time) => buildTrace(parseInput(JSON.stringify({ n, k, time }))).result
const PY = python.split('\n')

test('2532 worked example', () => {
  assert.equal(solve(1, 3, [[1, 1, 2, 1], [1, 1, 3, 1], [1, 1, 4, 1]]), 6)
})

test('2532 frames point at real python lines', () => {
  for (const f of buildTrace({ n: 2, k: 2, time: [[1, 2, 1, 1], [2, 1, 2, 1]] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2532 rejects malformed times', () => {
  assert.throws(() => parseInput('{"n":1,"k":2,"time":[[1,1,1,1]]}'))
})

// Oracle: advance one minute at a time, applying the same rules with per-worker countdowns.
function minuteByMinute(n, k, time) {
  const st = Array(k).fill('left'), rem = Array(k).fill(0)
  let bridgeRem = 0, boxesLeft = n, delivered = 0
  for (let t = 0; ; t++) {
    for (let i = 0; i < k; i++) {
      if (rem[i] !== 0) continue
      if (st[i] === 'toRight') { st[i] = 'picking'; rem[i] = time[i][1] }
      else if (st[i] === 'picking') st[i] = 'ready'
      else if (st[i] === 'toLeft') {
        delivered++
        if (delivered === n) return t
        st[i] = 'putting'; rem[i] = time[i][3]
      } else if (st[i] === 'putting') st[i] = 'left'
    }
    if (bridgeRem === 0) {
      const sumOf = i => time[i][0] + time[i][2]
      const key = i => [sumOf(i), i]
      const pick = list => list.sort((a, b) => key(a)[0] - key(b)[0] || key(a)[1] - key(b)[1]).at(-1)
      const ready = [...Array(k).keys()].filter(i => st[i] === 'ready')
      const idle = [...Array(k).keys()].filter(i => st[i] === 'left')
      if (ready.length) { const i = pick(ready); st[i] = 'toLeft'; rem[i] = time[i][2]; bridgeRem = rem[i] }
      else if (boxesLeft > 0 && idle.length) { const i = pick(idle); boxesLeft--; st[i] = 'toRight'; rem[i] = time[i][0]; bridgeRem = rem[i] }
    }
    for (let i = 0; i < k; i++) if (rem[i] > 0) rem[i]--
    if (bridgeRem > 0) bridgeRem--
  }
}

test('2532 random inputs match a minute-by-minute oracle', () => {
  let seed = 2532
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(4), k = 1 + rnd(3)
    const time = Array.from({ length: k }, () => Array.from({ length: 4 }, () => 1 + rnd(5)))
    assert.equal(solve(n, k, time), minuteByMinute(n, k, time), JSON.stringify({ n, k, time }))
  }
})
