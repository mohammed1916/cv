import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
const run = (o) => buildTrace(parseInput(JSON.stringify(o)))
function oracle(paragraph, banned) {
  const tally = {}
  for (const w of paragraph.replace(/[^A-Za-z]+/g, ' ').toLowerCase().split(' ')) if (w && !banned.includes(w)) tally[w] = (tally[w] || 0) + 1
  const max = Math.max(...Object.values(tally))
  return Object.keys(tally).find(w => tally[w] === max)
}
test('official examples', () => {
  assert.equal(run({ paragraph: 'Bob hit a ball, the hit BALL flew far after it was hit.', banned: ['hit'] }).result, 'ball')
  assert.equal(run({ paragraph: 'a.', banned: [] }).result, 'a')
})
test('random paragraphs match an independent tally', () => {
  const vocab = ['a', 'bb', 'cat', 'Dog', 'EEL', 'fox']; const punct = [' ', ', ', '. ', '! ', ';']
  let seed = 7; const rnd = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  for (let t = 0; t < 300; t++) {
    let p = ''; for (let i = 0; i < 1 + rnd(12); i++) p += vocab[rnd(6)] + punct[rnd(5)]
    const banned = vocab.filter(() => rnd(4) === 0).map(w => w.toLowerCase())
    if (!p.toLowerCase().match(/[a-z]+/g).some(w => !banned.includes(w))) continue
    const r = run({ paragraph: p, banned })
    assert.equal(r.result, oracle(p, banned)); assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  for (const bad of ['null', '{}', '{"paragraph":"","banned":[]}', '{"paragraph":"a","banned":["a"]}', '{"paragraph":"a","banned":["A"]}', '{"paragraph":"123","banned":[]}']) assert.throws(() => parseInput(bad))
})
