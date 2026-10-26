import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function valid(num, seq) {
  if (seq.length < 3) return false
  if (seq.join('') !== num) return false
  if (seq.some((v, i) => v > 2 ** 31 - 1 || (String(v).length !== 1 && false))) return false
  let pos = 0
  for (const v of seq) { if (num[pos] === '0' && String(v) !== '0') return false; pos += String(v).length }
  for (let i = 2; i < seq.length; i++) if (seq[i] !== seq[i - 1] + seq[i - 2]) return false
  return true
}
// Independent oracle: pick the first two numbers, then follow the forced sum.
function exists(num) {
  const n = num.length
  const LIM = 2 ** 31 - 1
  for (let a = 1; a < n; a++) for (let b = 1; a + b < n; b++) {
    const s1 = num.slice(0, a), s2 = num.slice(a, a + b)
    if ((s1.length > 1 && s1[0] === '0') || (s2.length > 1 && s2[0] === '0')) continue
    let x = Number(s1), y = Number(s2), pos = a + b
    if (x > LIM || y > LIM) continue
    while (pos < n) {
      const z = x + y
      const zs = String(z)
      if (z > LIM || !num.startsWith(zs, pos)) break
      pos += zs.length; x = y; y = z
    }
    if (pos === n) return true
  }
  return false
}
test('official examples', () => {
  assert.deepEqual(buildTrace('1101111').result, [11, 0, 11, 11])
  assert.deepEqual(buildTrace('112358130').result, [])
  assert.deepEqual(buildTrace('0123').result, [])
})
test('random digit strings agree with existence oracle and results are valid', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 600; t++) {
    let num
    if (t % 3 === 0) { // plant a fibonacci sequence
      let a = rnd(20), b = rnd(20); num = `${a}${b}`
      for (let k = 0; k < 2 + rnd(5); k++) { const c = a + b; num += c; a = b; b = c }
    } else num = Array.from({ length: 1 + rnd(12) }, () => rnd(3) === 0 ? '0' : String(rnd(10))).join('')
    const r = buildTrace(num).result
    assert.equal(r.length > 0, exists(num), num)
    if (r.length) assert.ok(valid(num, r), num)
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('"12a"')); assert.throws(() => parseInput('""')); assert.throws(() => parseInput('123'))
})
