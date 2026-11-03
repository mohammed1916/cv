import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const MOD = 1000000007n

function isPrime(x) {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

function factorial(k) {
  let f = 1n
  for (let i = 2n; i <= BigInt(k); i++) f *= i
  return f
}

// Independent reference: count primes, then use BigInt factorials.
function reference(n) {
  let p = 0
  for (let x = 2; x <= n; x++) if (isPrime(x)) p++
  return Number(factorial(p) * factorial(n - p) % MOD)
}

// Direct enumeration: a value that is prime must sit at a prime position.
function brute(n) {
  const used = Array(n + 1).fill(false)
  let count = 0
  const place = pos => {
    if (pos > n) { count++; return }
    for (let v = 1; v <= n; v++) {
      if (used[v] || (isPrime(v) && !isPrime(pos))) continue
      used[v] = true
      place(pos + 1)
      used[v] = false
    }
  }
  place(1)
  return count
}

test('samples: n = 5 gives 12, n = 10 gives 17280, n = 1 gives 1', () => {
  assert.equal(buildTrace(5).result, 12)
  assert.equal(buildTrace(10).result, 17280)
  assert.equal(buildTrace(1).result, 1)
})

test('small n agree with direct enumeration', () => {
  for (let n = 1; n <= 7; n++) assert.equal(buildTrace(n).result, brute(n), `n=${n}`)
})

test('large n agree with the BigInt reference', () => {
  for (const n of [50, 97, 100]) assert.equal(buildTrace(n).result, reference(n), `n=${n}`)
})

test('parseInput accepts one whole number and rejects everything else', () => {
  assert.equal(parseInput(' 7 '), 7)
  for (const bad of ['0', '101', 'abc', '2.5', '']) assert.throws(() => parseInput(bad))
})

test('every frame names a declared phase and a code line, and the last frame is done', () => {
  const run = buildTrace(10)
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).snapshot.answer, run.result)
})
