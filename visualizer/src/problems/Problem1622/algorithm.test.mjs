import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const MOD = 1000000007n
const solve = ops => buildTrace({ ops }).result

// Independent oracle: keep every real value in a plain array and update all of them on each call.
function oracle(ops) {
  const values = []
  const out = []
  for (const [name, x] of ops) {
    if (name === 'append') values.push(BigInt(x) % MOD)
    else if (name === 'addAll') for (let i = 0; i < values.length; i++) values[i] = (values[i] + BigInt(x)) % MOD
    else if (name === 'multAll') for (let i = 0; i < values.length; i++) values[i] = (values[i] * BigInt(x)) % MOD
    else out.push(x >= values.length ? -1 : Number(values[x]))
  }
  return out
}

test('1622 hand-made sequences give the expected answers', () => {
  assert.deepEqual(solve([['append', 2], ['addAll', 3], ['append', 7], ['multAll', 2], ['getIndex', 0], ['addAll', 3], ['append', 10], ['multAll', 2], ['getIndex', 2], ['getIndex', 9]]), [10, 20, -1])
  assert.deepEqual(solve([['getIndex', 0], ['append', 5], ['getIndex', 0]]), [-1, 5])
  assert.deepEqual(solve([['append', 4], ['multAll', 1000], ['getIndex', 0]]), [4000])
})

test('1622 values stay correct when the modulus wraps', () => {
  const ops = [['append', 1000000006], ['multAll', 1000], ['addAll', 1000000000], ['append', 999999999], ['multAll', 999], ['getIndex', 0], ['getIndex', 1]]
  assert.deepEqual(solve(ops), oracle(ops))
})

test('1622 random operation lists match the plain-array oracle', () => {
  let seed = 29
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const count = 1 + rnd(30)
    const ops = []
    for (let k = 0; k < count; k++) {
      const pick = rnd(4)
      if (pick === 0) ops.push(['append', rnd(1000000007)])
      else if (pick === 1) ops.push(['addAll', rnd(1000000007)])
      else if (pick === 2) ops.push(['multAll', 1 + rnd(1000)])
      else ops.push(['getIndex', rnd(12)])
    }
    assert.deepEqual(solve(ops), oracle(ops), JSON.stringify(ops))
  }
})

test('1622 frames carry phase, code line, narration and snapshot', () => {
  const run = buildTrace({ ops: [['append', 2], ['addAll', 3], ['getIndex', 0]] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 5)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.ok(python.includes('def fancy_ops'))
})

test('1622 rejects malformed operations', () => {
  assert.throws(() => parseInput('[["append",1]]'), /object/)
  assert.throws(() => parseInput('{"ops":[["push",1]]}'), /name must be/)
  assert.throws(() => parseInput('{"ops":[["multAll",0]]}'), /1 to 1000/)
  assert.throws(() => parseInput('{"ops":[["getIndex",-1]]}'), /negative/)
  assert.throws(() => parseInput('{"ops":[]}'), /between 1 and 40/)
})
