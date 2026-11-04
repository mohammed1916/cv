import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = responses => buildTrace({ responses }).result

test('3527 hand-computed cases', () => {
  assert.equal(solve([['mint', 'lime', 'mint'], ['lime', 'kiwi'], ['kiwi', 'mint', 'kiwi'], ['plum']]), 'kiwi')
  assert.equal(solve([['tea', 'tea', 'tea', 'tea'], ['milk'], ['milk', 'soda'], ['soda', 'milk']]), 'milk')
  assert.equal(solve([['solo']]), 'solo')
  assert.equal(solve([['b', 'a']]), 'a')
  assert.equal(solve([['ab'], ['a']]), 'a')
})

test('3527 a repeat within a day is marked and not counted', () => {
  const { frames } = buildTrace({ responses: [['tea', 'tea'], ['tea']] })
  assert.equal(frames.filter(f => f.phase === 'repeat').length, 1)
  assert.deepEqual(frames.at(-1).counts, [['tea', 2]])
  assert.deepEqual(frames.at(-1).marks, [['counted', 'repeat'], ['counted']])
})

test('3527 the seen set clears each day', () => {
  const { frames } = buildTrace({ responses: [['a', 'b'], ['a']] })
  const dayFrames = frames.filter(f => f.phase === 'day')
  assert.deepEqual(dayFrames.map(f => f.seen), [[], []])
  assert.deepEqual(frames.filter(f => f.phase === 'count').map(f => f.seen), [['a'], ['a', 'b'], ['a']])
})

test('3527 parseInput enforces the rules', () => {
  assert.doesNotThrow(() => parseInput('{"responses":[["ok"]]}'))
  assert.throws(() => parseInput('{"responses":[]}'))
  assert.throws(() => parseInput('{"responses":[[]]}'))
  assert.throws(() => parseInput('{"responses":[["Bad"]]}'))
  assert.throws(() => parseInput('{"responses":[["abcdefghijk"]]}'))
  assert.throws(() => parseInput('[]'))
})

// Oracle: for every distinct word, count days containing it, then sort by count and word.
function oracle(responses) {
  const words = [...new Set(responses.flat())]
  const scored = words.map(word => [word, responses.filter(day => day.includes(word)).length])
  scored.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
  return scored[0][0]
}

test('3527 random surveys match a per-word oracle', () => {
  let seed = 3527
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  const pool = ['a', 'ab', 'abc', 'b', 'ba', 'c', 'cab', 'z']
  for (let t = 0; t < 500; t++) {
    const responses = Array.from({ length: 1 + rnd(8) }, () => Array.from({ length: 1 + rnd(10) }, () => pool[rnd(pool.length)]))
    assert.equal(solve(parseInput(JSON.stringify({ responses })).responses), oracle(responses), JSON.stringify(responses))
  }
})

test('3527 frames are well formed', () => {
  const known = new Set(phases.map(p => p.id))
  const pythonLines = python.split('\n')
  const { frames } = buildTrace({ responses: [['mint', 'lime', 'mint'], ['lime', 'kiwi']] })
  assert.equal(frames[0].phase, 'start')
  assert.equal(frames.at(-1).phase, 'done')
  for (const f of frames) {
    assert.ok(known.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pythonLines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
  }
})
