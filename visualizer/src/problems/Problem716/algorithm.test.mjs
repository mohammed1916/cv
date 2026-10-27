import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('716 official example', () => {
  const ops = [['push', 5], ['push', 1], ['push', 5], ['top'], ['popMax'], ['top'], ['peekMax'], ['pop'], ['top']]
  assert.deepEqual(buildTrace(ops).result, [null, null, null, 5, 5, 1, 5, 1, 5])
})

test('716 popMax removes the most recent of equal maxima', () => {
  const ops = [['push', 2], ['push', 2], ['popMax'], ['top']]
  assert.deepEqual(buildTrace(ops).result, [null, null, 2, 2])
})

test('716 rejects a pop on an empty stack', () => {
  assert.throws(() => parseInput('[["pop"]]'))
})

// Independent oracle: keep each value with its push number; ties for the maximum go to the larger push number.
function oracle(ops) {
  const items = []
  let pushes = 0
  return ops.map(([kind, value]) => {
    if (kind === 'push') { items.push({ value, id: pushes++ }); return null }
    if (kind === 'pop') return items.pop().value
    if (kind === 'top') return items.at(-1).value
    if (kind === 'peekMax') return Math.max(...items.map(x => x.value))
    let pick = 0
    items.forEach((x, i) => {
      const best = items[pick]
      if (x.value > best.value || (x.value === best.value && x.id > best.id)) pick = i
    })
    return items.splice(pick, 1)[0].value
  })
}

test('716 random operation sequences match an oracle', () => {
  let seed = 97
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const ops = []
    let size = 0
    for (let i = 0; i < 1 + rnd(25); i++) {
      if (size === 0 || rnd(3) === 0) {
        ops.push(['push', rnd(11) - 5])
        size++
      } else {
        const kind = ['pop', 'top', 'peekMax', 'popMax'][rnd(4)]
        ops.push([kind])
        if (kind === 'pop' || kind === 'popMax') size--
      }
    }
    assert.deepEqual(buildTrace(ops).result, oracle(ops), JSON.stringify(ops))
  }
})
