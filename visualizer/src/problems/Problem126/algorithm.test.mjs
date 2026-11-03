import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

// Independent oracle: enumerate every simple path from begin in the full word graph,
// keep the shortest ones that end at end. Only viable for the small graphs used here.
function oracle(beginWord, endWord, wordList) {
  const nodes = [...new Set([beginWord, ...wordList])]
  const adjacent = (a, b) => {
    let diff = 0
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++
    return diff === 1
  }
  let best = Infinity
  const found = []
  const dfs = (path) => {
    const last = path.at(-1)
    if (path.length - 1 > best) return
    if (last === endWord) {
      if (path.length - 1 < best) { best = path.length - 1; found.length = 0 }
      found.push([...path])
      return
    }
    for (const nb of nodes) {
      if (path.includes(nb) || !adjacent(last, nb)) continue
      if (nb !== endWord && !wordList.includes(nb)) continue
      dfs([...path, nb])
    }
  }
  if (wordList.includes(endWord)) dfs([beginWord])
  return found.sort((a, b) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1
    return 0
  })
}

test('the cold-to-warm ladder returns three shortest sequences of length five', () => {
  const run = buildTrace({ beginWord: 'cold', endWord: 'warm', wordList: ['cord', 'card', 'ward', 'word', 'worm', 'warm', 'wood'] })
  assert.deepEqual(run.result, [
    ['cold', 'cord', 'card', 'ward', 'warm'],
    ['cold', 'cord', 'word', 'ward', 'warm'],
    ['cold', 'cord', 'word', 'worm', 'warm'],
  ])
})

test('hand-checked pair, unreachable end, and chain', () => {
  assert.deepEqual(buildTrace({ beginWord: 'pen', endWord: 'pan', wordList: ['pan', 'pin', 'pen', 'ten'] }).result, [['pen', 'pan']])
  assert.deepEqual(buildTrace({ beginWord: 'aaa', endWord: 'ccc', wordList: ['aac', 'acc', 'ccc', 'bbb'] }).result, [['aaa', 'aac', 'acc', 'ccc']])
  assert.deepEqual(buildTrace({ beginWord: 'aaa', endWord: 'zzz', wordList: ['aab', 'abb'] }).result, [])
})

test('random small graphs agree with exhaustive path enumeration', () => {
  let state = 3
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const pool = ['ab', 'ac', 'bb', 'bc', 'cb', 'cc', 'aa', 'ba', 'ca']
  for (let t = 0; t < 120; t++) {
    const shuffled = [...pool].sort(() => rand(3) - 1)
    const wordList = shuffled.slice(0, 2 + rand(6))
    const beginWord = shuffled[7] ?? 'ac'
    const endWord = wordList[rand(wordList.length)]
    if (beginWord === endWord) continue
    const input = { beginWord, endWord, wordList }
    assert.deepEqual(buildTrace(input).result, oracle(beginWord, endWord, wordList), JSON.stringify(input))
  }
})

test('every frame points at real pseudocode and Python lines', () => {
  const run = buildTrace({ beginWord: 'cold', endWord: 'warm', wordList: ['cord', 'card', 'ward', 'word', 'worm', 'warm', 'wood'] })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('{"beginWord":"ab","endWord":"ab","wordList":["ab"]}'), /must differ/)
  assert.throws(() => parseInput('{"beginWord":"ab","endWord":"cd","wordList":["ab","cde"]}'), /same length/)
  assert.throws(() => parseInput('{"beginWord":"ab","endWord":"cd","wordList":["cd","cd"]}'), /repeat/)
})
