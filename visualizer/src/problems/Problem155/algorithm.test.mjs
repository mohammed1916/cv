import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: keep a plain array and scan it for the minimum on every getMin call.
function oracle(ops) {
  const items = []
  const out = []
  for (const op of ops) {
    if (op[0] === 'push') items.push(op[1])
    else if (op[0] === 'pop') items.pop()
    else if (op[0] === 'top') out.push(items[items.length - 1])
    else out.push(Math.min(...items))
  }
  return out
}

test('the classic example reports the minimum after each change', () => {
  const ops = [['push', -2], ['push', 0], ['push', -3], ['getMin'], ['pop'], ['top'], ['getMin']]
  assert.deepEqual(buildTrace(ops).result, [-3, 0, -2])
})

test('minimum survives popping the current minimum', () => {
  const ops = [['push', 5], ['push', 1], ['push', 3], ['pop'], ['getMin'], ['pop'], ['getMin']]
  assert.deepEqual(buildTrace(ops).result, [1, 5])
})

test('random valid sequences agree with the scan oracle', () => {
  let state = 41
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const ops = []
    let size = 0
    for (let k = 0; k < 1 + rand(25); k++) {
      const roll = rand(4)
      if (roll === 0 || size === 0) { ops.push(['push', rand(201) - 100]); size++ }
      else if (roll === 1) { ops.push(['pop']); size-- }
      else ops.push([roll === 2 ? 'top' : 'getMin'])
    }
    assert.deepEqual(buildTrace(ops).result, oracle(ops), JSON.stringify(ops))
  }
})

test('every frame points at real code and Python lines', () => {
  for (const frame of buildTrace([['push', 1], ['push', 2], ['getMin'], ['pop'], ['top']]).frames) {
    assert.ok(frame.activeLine >= 1, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('[["pop"]]'), /non-empty/)
  assert.throws(() => parseInput('[["push", 101]]'), /-100 to 100/)
  assert.throws(() => parseInput('[["peek"]]'), /Each operation/)
  assert.throws(() => parseInput('[["push", 1], ["top", 2]]'), /takes no value/)
})
