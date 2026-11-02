import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('1324 worked examples', () => {
  assert.deepEqual(solve('HOW ARE YOU'), ['HAY', 'ORO', 'WEU'])
  assert.deepEqual(solve('TO BE OR NOT TO BE'), ['TBONTB', 'OEROOE', '   T'])
  assert.deepEqual(solve('CONTEST IS COMING'), ['CIC', 'OSO', 'N M', 'T I', 'E N', 'S G', 'T'])
})

test('1324 rejects irregular spacing', () => {
  assert.throws(() => parseInput('{"s":"A  B"}'))
  assert.throws(() => parseInput('{"s":" A"}'))
})

// Independent oracle: pad every word to the longest, read columns, then trim trailing spaces.
function oracle(s) {
  const words = s.split(' ')
  const width = Math.max(...words.map(w => w.length))
  const out = []
  for (let col = 0; col < width; col++) {
    out.push(words.map(w => (col < w.length ? w[col] : ' ')).join('').replace(/ +$/, ''))
  }
  return out
}

test('1324 random sentences match a padded-column oracle', () => {
  let seed = 1324
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(6) }, () => Array.from({ length: 1 + rnd(6) }, () => 'ABCDEFGHIJ'[rnd(10)]).join(''))
    const s = words.join(' ')
    assert.deepEqual(solve(s), oracle(s), s)
  }
})
