import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (names, args) => buildTrace(parseInput(JSON.stringify([names, args])))

// Independent oracle: keep the raw history and search it on every pop.
function brute(ops) {
  const items = []
  const out = []
  for (const op of ops) {
    if (op.name === 'push') { items.push(op.value); out.push(null); continue }
    const count = v => items.filter(x => x === v).length
    let best = -1
    for (let i = 0; i < items.length; i++) {
      if (best === -1 || count(items[i]) > count(items[best]) || (count(items[i]) === count(items[best]) && i > best)) best = i
    }
    out.push(items[best])
    items.splice(best, 1)
  }
  return out
}

test('official example', () => {
  const t = run(['FreqStack', 'push', 'push', 'push', 'push', 'push', 'push', 'pop', 'pop', 'pop', 'pop'], [[], [5], [7], [5], [7], [4], [5], [], [], [], []])
  assert.deepEqual(t.result, [null, null, null, null, null, null, 5, 7, 5, 4])
  assert.equal(t.frames.at(-1).phase, 'done')
})

test('matches brute force on random operation sequences', () => {
  let seed = 13
  const rnd = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % m }
  for (let t = 0; t < 400; t++) {
    const names = ['FreqStack'], args = [[]]
    let size = 0
    const count = 1 + rnd(40)
    for (let i = 0; i < count; i++) {
      if (size > 0 && rnd(3) === 0) { names.push('pop'); args.push([]); size-- } else { names.push('push'); args.push([rnd(5)]); size++ }
    }
    if (names.length < 2) continue
    const trace = run(names, args)
    assert.deepEqual(trace.result, brute(parseInput(JSON.stringify([names, args]))))
  }
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('[["FreqStack","pop"],[[],[]]]'))
  assert.throws(() => parseInput('[["Stack","push"],[[],[1]]]'))
  assert.throws(() => parseInput('[["FreqStack","push"],[[],[]]]'))
  assert.throws(() => parseInput('[["FreqStack","peek"],[[],[]]]'))
  assert.throws(() => parseInput('{}'))
})
