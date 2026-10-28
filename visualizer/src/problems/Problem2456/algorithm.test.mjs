import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2456 official examples', () => {
  assert.deepEqual(solve('{"creators":["alice","bob","alice","charlie"],"ids":["one","two","three","four"],"views":[5,10,5,4]}'), [['alice', 'one'], ['bob', 'two']])
  assert.deepEqual(solve('{"creators":["alice","alice","alice"],"ids":["a","b","c"],"views":[1,2,2]}'), [['alice', 'b']])
})

test('2456 a tie on views goes to the smaller video id', () => {
  assert.deepEqual(solve('{"creators":["ann","ann"],"ids":["zz","aa"],"views":[3,3]}'), [['ann', 'aa']])
})

test('2456 rejects arrays of different lengths', () => {
  assert.throws(() => parseInput('{"creators":["a"],"ids":["x","y"],"views":[1]}'))
})

// Independent oracle: total each creator by filtering, then pick the best video by scanning all of them.
function oracle(creators, ids, views) {
  const names = [...new Set(creators)].sort()
  const totals = names.map(c => creators.reduce((sum, name, i) => (name === c ? sum + views[i] : sum), 0))
  const best = Math.max(...totals)
  const result = []
  names.forEach((c, k) => {
    if (totals[k] !== best) return
    const mine = ids.map((d, i) => ({ d, v: views[i] })).filter((_, i) => creators[i] === c)
    const pick = mine.reduce((a, b) => (b.v > a.v || (b.v === a.v && b.d < a.d) ? b : a))
    result.push([c, pick.d])
  })
  return result
}

test('2456 random videos match a filter-and-scan oracle', () => {
  let seed = 2456
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 300; round++) {
    const n = 1 + rnd(10)
    const creators = [], ids = [], views = []
    for (let i = 0; i < n; i++) {
      creators.push(['ann', 'bob', 'cy'][rnd(3)])
      ids.push(`v${rnd(6)}`)
      views.push(rnd(10))
    }
    const text = JSON.stringify({ creators, ids, views })
    assert.deepEqual(solve(text), oracle(creators, ids, views), text)
  }
})
