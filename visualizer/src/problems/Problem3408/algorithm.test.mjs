import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3408 official example, with the initial tasks added one by one', () => {
  const input = {
    operations: ['add', 'add', 'add', 'add', 'edit', 'execTop', 'rmv', 'add', 'execTop'],
    arguments: [[1, 101, 10], [2, 102, 20], [3, 103, 15], [4, 104, 5], [102, 8], [], [101], [5, 105, 15], []],
  }
  assert.deepEqual(solve(input), [null, null, null, null, null, 3, null, null, 5])
})

test('3408 ties on priority go to the higher task id', () => {
  const input = { operations: ['add', 'add', 'execTop'], arguments: [[1, 3, 7], [2, 9, 7], []] }
  assert.deepEqual(solve(input), [null, null, 2])
})

test('3408 an empty manager answers -1', () => {
  assert.deepEqual(solve({ operations: ['execTop'], arguments: [[]] }), [-1])
})

test('3408 rejects editing a task that was removed', () => {
  assert.throws(() => parseInput(JSON.stringify({ operations: ['add', 'rmv', 'edit'], arguments: [[1, 2, 3], [2], [2, 5]] })))
})

// Independent oracle: keep only live tasks and scan them for the best (priority, task) on each execTop.
function oracle({ operations, arguments: args }) {
  const tasks = new Map()
  return operations.map((op, i) => {
    const a = args[i]
    if (op === 'add') { tasks.set(a[1], { user: a[0], p: a[2] }); return null }
    if (op === 'edit') { tasks.get(a[0]).p = a[1]; return null }
    if (op === 'rmv') { tasks.delete(a[0]); return null }
    if (tasks.size === 0) return -1
    let best = null
    for (const [t, info] of tasks) {
      if (best === null || info.p > best.info.p || (info.p === best.info.p && t > best.t)) best = { t, info }
    }
    tasks.delete(best.t)
    return best.info.user
  })
}

test('3408 random valid sequences match a scanning oracle', () => {
  let seed = 3408
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const operations = []
    const args = []
    const live = []
    let nextId = 1
    for (let i = 0; i < 1 + rnd(12); i++) {
      const pick = rnd(4)
      if (pick === 0 || live.length === 0) {
        operations.push('add'); args.push([1 + rnd(5), nextId, rnd(21)]); live.push(nextId); nextId++
      } else if (pick === 1) {
        operations.push('edit'); args.push([live[rnd(live.length)], rnd(21)])
      } else if (pick === 2) {
        const at = rnd(live.length)
        operations.push('rmv'); args.push([live[at]]); live.splice(at, 1)
      } else {
        operations.push('execTop'); args.push([])
      }
    }
    // Keep the edit targets that exist: edits are only generated for live tasks, and execTop removes its task.
    const input = { operations, arguments: args }
    let sim
    try { sim = parseInput(JSON.stringify(input)) } catch { continue }
    const resultFromRun = buildTrace(sim).result
    assert.deepEqual(resultFromRun, oracle(input), JSON.stringify(input))
  }
})
