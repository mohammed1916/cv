import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { toInt, toIp } from './algorithm.js'

test('751 official example', () => {
  assert.deepEqual(buildTrace({ ip: '255.0.0.7', n: 10 }).result, ['255.0.0.7/32', '255.0.0.8/29', '255.0.0.16/32'])
})

test('751 an aligned power of two is one block', () => {
  assert.deepEqual(buildTrace({ ip: '10.0.0.0', n: 256 }).result, ['10.0.0.0/24'])
})

test('751 rejects a range that passes the last address', () => {
  assert.throws(() => parseInput('{"ip":"255.255.255.255","n":2}'))
})

// Independent oracle: at each address, take the largest prefix whose block starts there and fits the range,
// by testing every prefix length instead of growing the block.
function oracle(ip, n) {
  const first = toInt(ip), end = first + n
  const blocks = []
  let pos = first
  while (pos < end) {
    let best = null
    for (let bits = 0; bits <= 32; bits++) {
      const size = 2 ** bits
      if (pos % size === 0 && pos + size <= end) best = bits
    }
    blocks.push(`${toIp(pos)}/${32 - best}`)
    pos += 2 ** best
  }
  return blocks
}

test('751 random ranges match an oracle', () => {
  let seed = 61
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const ip = toIp(rnd(2 ** 20))
    const n = 1 + rnd(500)
    assert.deepEqual(buildTrace({ ip, n }).result, oracle(ip, n), `${ip} ${n}`)
  }
})
