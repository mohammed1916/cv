import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (memory_limit, operations) => buildTrace(parseInput(JSON.stringify({ memory_limit, operations }))).result

test('3508 a router keeps packets in first-in first-out order and evicts the oldest when full', () => {
  const operations = [
    ['addPacket', 1, 2, 3],
    ['addPacket', 1, 2, 3],
    ['addPacket', 4, 5, 6],
    ['addPacket', 7, 8, 9],
    ['forwardPacket'],
    ['getCount', 8, 0, 10],
    ['addPacket', 7, 8, 9],
  ]
  // The duplicate is rejected; adding (7, 8, 9) evicts (1, 2, 3); forwarding returns (4, 5, 6).
  assert.deepEqual(solve(2, operations), [true, false, true, true, [4, 5, 6], 1, false])
})

test('3508 an empty router forwards an empty list', () => {
  assert.deepEqual(solve(1, [['forwardPacket']]), [[]])
})

test('3508 rejects timestamps that decrease', () => {
  assert.throws(() => parseInput(JSON.stringify({ memory_limit: 2, operations: [['addPacket', 1, 2, 5], ['addPacket', 1, 2, 4]] })))
})

// Independent oracle: a plain array of packets, searched linearly for duplicates.
function oracle(memory_limit, operations) {
  const packets = []
  return operations.map(([name, ...args]) => {
    if (name === 'addPacket') {
      const [s, d, t] = args
      if (packets.some(p => p[0] === s && p[1] === d && p[2] === t)) return false
      if (packets.length === memory_limit) packets.splice(0, 1)
      packets.push([s, d, t])
      return true
    }
    if (name === 'forwardPacket') return packets.length === 0 ? [] : packets.shift()
    const [d, start, end] = args
    return packets.filter(([, pd, pt]) => pd === d && pt >= start && pt <= end).length
  })
}

test('3508 random operation lists match a linear-search oracle', () => {
  let seed = 3508
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const memory_limit = 1 + rnd(4)
    const operations = []
    let time = 0
    const count = 1 + rnd(14)
    for (let i = 0; i < count; i++) {
      const kind = rnd(3)
      if (kind === 0) {
        time += rnd(3)
        operations.push(['addPacket', rnd(4), rnd(4), time])
      } else if (kind === 1) {
        operations.push(['forwardPacket'])
      } else {
        const start = rnd(time + 1)
        operations.push(['getCount', rnd(4), start, start + rnd(time + 1 - start)])
      }
    }
    assert.deepEqual(solve(memory_limit, operations), oracle(memory_limit, operations), JSON.stringify({ memory_limit, operations }))
  }
})
