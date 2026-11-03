import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: dynamic programming over every deci-binary number up to the limit.
function oracle(limit) {
  const dp = [0]
  const deci = []
  for (let v = 1; v <= limit; v++) if (String(v).split('').every(ch => ch === '0' || ch === '1')) deci.push(v)
  for (let n = 1; n <= limit; n++) {
    let best = Infinity
    for (const k of deci) if (k <= n) best = Math.min(best, dp[n - k] + 1)
    dp.push(best)
  }
  return dp
}

test('1689 samples give the largest digit', () => {
  assert.equal(buildTrace('2046').result, 6)
  assert.equal(buildTrace('5').result, 5)
  assert.equal(buildTrace('90000').result, 9)
})

test('1689 matches the dynamic programming oracle up to 300', () => {
  const dp = oracle(300)
  for (let n = 1; n <= 300; n++) assert.equal(buildTrace(String(n)).result, dp[n], `n=${n}`)
})

test('1689 final layers are deci-binary and add back to n', () => {
  let seed = 5
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 100; t++) {
    const digits = String(1 + rnd(9)) + Array.from({ length: rnd(12) }, () => rnd(10)).join('')
    const trace = buildTrace(digits)
    const layers = trace.frames.at(-1).snapshot.layers
    assert.equal(layers.length, trace.result)
    for (const row of layers) assert.ok(/^[01]+$/.test(row))
    const sum = layers.reduce((acc, row) => acc + BigInt(row), 0n)
    assert.equal(sum, BigInt(digits), digits)
  }
})

test('1689 rejects malformed input', () => {
  assert.throws(() => parseInput('0'), /positive/)
  assert.throws(() => parseInput('0123'), /positive/)
  assert.throws(() => parseInput('12a'), /positive/)
  assert.throws(() => parseInput('1'.repeat(31)), /positive/)
})

test('1689 frames use declared phases and carry line numbers', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const frame of buildTrace('3142').frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.pythonLine >= 1)
  }
})
