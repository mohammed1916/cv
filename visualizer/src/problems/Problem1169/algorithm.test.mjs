import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: a transaction is flagged when its amount is over 1000 or when some other transaction
// has the same name, a different city, and a time within 60 minutes. Written with filter instead of loops.
function oracle(transactions) {
  const rows = transactions.map(t => {
    const [name, time, amount, city] = t.split(',')
    return { name, time: Number(time), amount: Number(amount), city }
  })
  return transactions.filter((_, i) => rows[i].amount > 1000 || rows.some((other, j) => j !== i
    && other.name === rows[i].name && other.city !== rows[i].city && Math.abs(other.time - rows[i].time) <= 60))
}

test('a large amount is flagged and a distant trip is not', () => {
  assert.deepEqual(buildTrace({ transactions: ['mia,5,1500,oslo', 'mia,900,20,oslo'] }).result, ['mia,5,1500,oslo'])
})

test('two trips in different cities within 60 minutes flag both, but 90 minutes apart flags neither', () => {
  assert.deepEqual(
    buildTrace({ transactions: ['ren,10,300,kyoto', 'ren,40,200,kyoto', 'ren,100,400,lima'] }).result,
    ['ren,40,200,kyoto', 'ren,100,400,lima'],
  )
  assert.deepEqual(buildTrace({ transactions: ['ren,0,300,kyoto', 'ren,90,200,lima'] }).result, [])
})

test('the same city never conflicts, and a 60-minute gap still conflicts', () => {
  assert.deepEqual(buildTrace({ transactions: ['sam,0,90,nara', 'sam,30,90,nara'] }).result, [])
  assert.deepEqual(buildTrace({ transactions: ['sam,0,90,nara', 'sam,60,90,kobe'] }).result, ['sam,0,90,nara', 'sam,60,90,kobe'])
})

test('random small inputs agree with the oracle', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const names = ['ann', 'bo']
  const cities = ['nyc', 'rome']
  for (let t = 0; t < 200; t++) {
    const transactions = Array.from({ length: 1 + rand(8) }, () => `${names[rand(2)]},${rand(200)},${rand(1600)},${cities[rand(2)]}`)
    assert.deepEqual(buildTrace({ transactions }).result, oracle(transactions), JSON.stringify(transactions))
  }
})

test('frames use declared phases, carry snapshots and finish with the result', () => {
  const run = buildTrace({ transactions: ['ren,10,300,kyoto', 'ren,40,200,kyoto', 'ren,100,400,lima'] })
  const ids = phases.map(p => p.id)
  for (const frame of run.frames) {
    assert.ok(ids.includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 7)
    assert.ok(Array.isArray(frame.snapshot.flagged))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).snapshot.result, run.result)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[]'), /JSON object/)
  assert.throws(() => parseInput({ transactions: [] }), /between 1 and 50/)
  assert.throws(() => parseInput({ transactions: ['Ann,1,1,nyc'] }), /name must be/)
  assert.throws(() => parseInput({ transactions: ['ann,1001,1,nyc'] }), /time must be/)
  assert.throws(() => parseInput({ transactions: ['ann,1,1'] }), /name,time,amount,city/)
})
