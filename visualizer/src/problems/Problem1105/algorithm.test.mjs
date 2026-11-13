import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
  }
}

// Oracle: enumerate every split of the ordered books into contiguous shelves.
function oracle(books, width) {
  const best = (from) => {
    if (from === books.length) return 0
    let bestCost = Infinity
    let used = 0
    let tallest = 0
    for (let to = from; to < books.length; to++) {
      used += books[to][0]
      tallest = Math.max(tallest, books[to][1])
      if (used > width) break
      bestCost = Math.min(bestCost, tallest + best(to + 1))
    }
    return bestCost
  }
  return best(0)
}

test('sample matches the partition oracle', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  const input = JSON.parse(examples[0].input)
  assert.equal(trace.result, oracle(input.books, input.shelfWidth))
  assert.equal(trace.result, 13)
})

test('one shelf takes the tallest book; separate shelves add heights', () => {
  assert.equal(run(examples[1].input).result, 4)
  assert.equal(run(examples[2].input).result, 10)
})

test('width and shelf-height updates have separate truthful code frames', () => {
  const trace = buildTrace({ books: [[2, 6]], shelfWidth: 3 })
  const grow = trace.frames.find(frame => frame.kind === 'grow')
  const tallest = trace.frames.find(frame => frame.kind === 'tallest')
  assert.equal(grow.snapshot.width, 2)
  assert.equal(grow.snapshot.tallest, 0)
  assert.equal(tallest.snapshot.width, 2)
  assert.equal(tallest.snapshot.tallest, 6)
  assert.notEqual(grow.activeLine, tallest.activeLine)
})

test('matches the oracle on seeded books', () => {
  let seed = 1105
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const shelfWidth = 1 + rnd(12)
    const count = 1 + rnd(7)
    const books = Array.from({ length: count }, () => [1 + rnd(shelfWidth), 1 + rnd(9)])
    const trace = buildTrace({ books, shelfWidth })
    checkFrames(trace)
    assert.equal(trace.result, oracle(books, shelfWidth), JSON.stringify({ books, shelfWidth }))
  }
})

test('rejects books that cannot fit or malformed pairs', () => {
  assert.throws(() => parseInput('{"books":[[9,2]],"shelfWidth":8}'))
  assert.throws(() => parseInput('{"books":[[2]],"shelfWidth":8}'))
  assert.throws(() => parseInput('{"books":[],"shelfWidth":8}'))
})
