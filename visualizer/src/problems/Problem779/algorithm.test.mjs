import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (n, k) => buildTrace(parseInput(JSON.stringify({ n, k })))
function rowString(n) {
  let row = '0'
  for (let i = 1; i < n; i++) row = [...row].map(c => (c === '0' ? '01' : '10')).join('')
  return row
}
const popcountParity = x => { let c = 0; while (x) { c += x & 1; x = Math.floor(x / 2) } return c % 2 }
test('official examples', () => {
  assert.equal(run(1, 1).result, 0)
  assert.equal(run(2, 1).result, 0)
  assert.equal(run(2, 2).result, 1)
})
test('every cell for n up to 10 equals the expanded row', () => {
  for (let n = 1; n <= 10; n++) {
    const row = rowString(n)
    for (let k = 1; k <= row.length; k++) {
      const r = run(n, k)
      assert.equal(r.result, Number(row[k - 1]), `${n},${k}`)
      assert.equal(r.frames.at(-1).phase, 'done')
    }
  }
})
test('large values match Thue-Morse parity', () => {
  for (const k of [1, 2, 3, 434991989, 2 ** 29, 123456789]) assert.equal(run(30, k).result, popcountParity(k - 1))
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"n":2,"k":3}'))
  assert.throws(() => parseInput('{"n":31,"k":1}'))
  assert.throws(() => parseInput('[1,1]'))
})
