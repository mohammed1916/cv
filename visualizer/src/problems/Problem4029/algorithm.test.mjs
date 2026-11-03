import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (start, requests) => buildTrace({ start, requests }).result

test('4029 hand-checked elevators', () => {
  assert.equal(solve(0, [[0, 3], [2, 1]]), 4)
  assert.equal(solve(0, [[4, 4]]), 4)
  assert.equal(solve(2, [[0, 2]]), 0)
})

test('4029 rejects bad input', () => {
  assert.throws(() => parseInput('{"start":21,"requests":[[0,1]]}'))
  assert.throws(() => parseInput('{"start":0,"requests":[]}'))
  assert.throws(() => parseInput('{"start":0,"requests":[[1]]}'))
})

// Oracle: step the elevator one second at a time over every (floor, served-set) state.
function oracle(start, requests) {
  const m = requests.length
  const full = (1 << m) - 1
  const maxFloor = Math.max(start, ...requests.map(r => r[1])) + 1
  const served = (floor, time, mask) => {
    let out = mask
    requests.forEach(([a, f], i) => { if (f === floor && a <= time) out |= 1 << i })
    return out
  }
  let states = new Set([`${start},${served(start, 0, 0)}`])
  for (let time = 0; time < 400; time++) {
    if ([...states].some(s => Number(s.split(',')[1]) === full)) return time
    const next = new Set()
    for (const s of states) {
      const [floor, mask] = s.split(',').map(Number)
      for (const nf of [floor - 1, floor, floor + 1]) {
        if (nf < 0 || nf > maxFloor) continue
        next.add(`${nf},${served(nf, time + 1, mask)}`)
      }
    }
    states = next
  }
  return -1
}

test('4029 random elevators match a second-by-second oracle', () => {
  let seed = 4029
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const start = rnd(8)
    const m = 1 + rnd(4)
    const requests = Array.from({ length: m }, () => [rnd(10), rnd(8)])
    assert.equal(solve(start, requests), oracle(start, requests), JSON.stringify({ start, requests }))
  }
})

test('4029 final frame carries the answer', () => {
  const run = buildTrace({ start: 0, requests: [[0, 3], [2, 1], [5, 5]] })
  assert.equal(run.frames.at(-1).arrive, run.result)
  assert.equal(run.frames.at(-1).phase, 'done')
})
