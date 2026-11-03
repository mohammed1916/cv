import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const solve = bits => buildTrace(bits).result

// Oracle: simulate the rule literally on a big integer.
function bruteForce(bits) {
  let n = BigInt('0b' + bits)
  let steps = 0
  while (n !== 1n) {
    n = n % 2n === 0n ? n / 2n : n + 1n
    steps++
  }
  return steps
}

test('sample "1101" (13) takes 6 steps', () => {
  assert.equal(solve('1101'), 6)
})

test('small cases: "1" needs 0, "10" needs 1, "11" needs 3, "110" needs 4', () => {
  assert.equal(solve('1'), 0)
  assert.equal(solve('10'), 1)
  assert.equal(solve('11'), 3)
  assert.equal(solve('110'), 4)
})

test('random binary strings match literal simulation', () => {
  let seed = 23
  const rnd = m => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(12)
    const bits = '1' + Array.from({ length: length - 1 }, () => String(rnd(2))).join('')
    assert.equal(solve(bits), Number(bruteForce(bits)), bits)
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('"0"'))
  assert.throws(() => parseInput('"102"'))
  assert.throws(() => parseInput('1011'))
})

test('every frame names a declared phase and a valid code line', () => {
  const run = buildTrace('1101')
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
