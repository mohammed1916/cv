import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (word1, word2) => buildTrace({ word1, word2 }).result

test('1657 teaching pairs return the expected answers', () => {
  assert.equal(solve('banana', 'aaabbn'), true)
  assert.equal(solve('aaab', 'aabb'), false)
  assert.equal(solve('cat', 'dog'), false)
  assert.equal(solve('a', 'a'), true)
  assert.equal(solve('ab', 'abc'), false)
})

test('1657 rejects malformed input', () => {
  assert.throws(() => parseInput('{"word1":"AB","word2":"ab"}'), /word1/)
  assert.throws(() => parseInput('{"word1":"ab","word2":""}'), /word2/)
  assert.throws(() => parseInput('["ab","ba"]'), /object/)
})

// Independent oracle: breadth-first search over the words reachable by swapping letters and exchanging every copy of two letters.
function reachable(start) {
  const seen = new Set([start])
  const queue = [start]
  while (queue.length) {
    const arr = queue.shift().split('')
    const next = []
    for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
      const swapped = arr.slice()
      ;[swapped[i], swapped[j]] = [swapped[j], swapped[i]]
      next.push(swapped.join(''))
    }
    const present = [...new Set(arr)]
    for (const from of present) for (const to of present) {
      if (from < to) next.push(arr.map(letter => (letter === from ? to : letter === to ? from : letter)).join(''))
    }
    for (const word of next) if (!seen.has(word)) { seen.add(word); queue.push(word) }
  }
  return seen
}

function allWords(alphabet, length) {
  if (length === 0) return ['']
  return allWords(alphabet, length - 1).flatMap(prefix => [...alphabet].map(letter => prefix + letter))
}

test('1657 matches a reachability oracle for every short word pair', () => {
  for (const length of [1, 2, 3, 4]) {
    const words = allWords('abc', length)
    for (const start of words) {
      const reach = reachable(start)
      for (const target of words) {
        // Moves may be applied to either word, so the pair is close when both reach a common word.
        const common = [...reachable(target)].some(word => reach.has(word))
        assert.equal(solve(start, target), common, `${start} / ${target}`)
      }
    }
  }
})

test('1657 frames point to valid code and Python lines', () => {
  const { frames } = buildTrace({ word1: 'abcd', word2: 'dcba' })
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(phaseIds.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
    assert.equal(typeof frame.message, 'string')
  }
})
