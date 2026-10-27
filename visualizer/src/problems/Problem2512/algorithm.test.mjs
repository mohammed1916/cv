import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2512 official examples', () => {
  const example1 = {
    positive_feedback: ['smart', 'brilliant', 'studious'], negative_feedback: ['not'],
    report: ['this student is studious', 'the student is smart'], student_id: [1, 2], k: 2,
  }
  const example2 = {
    positive_feedback: ['smart', 'brilliant', 'studious'], negative_feedback: ['not'],
    report: ['this student is not studious', 'the student is smart'], student_id: [1, 2], k: 2,
  }
  assert.deepEqual(solve(example1), [1, 2])
  assert.deepEqual(solve(example2), [2, 1])
})

test('2512 equal scores are broken by the smaller id', () => {
  const input = { positive_feedback: ['good'], negative_feedback: ['bad'], report: ['good', 'good', 'good'], student_id: [30, 10, 20], k: 2 }
  assert.deepEqual(solve(input), [10, 20])
})

test('2512 rejects a word that is both positive and negative', () => {
  assert.throws(() => parseInput('{"positive_feedback":["a"],"negative_feedback":["a"],"report":["a"],"student_id":[1],"k":1}'))
})

// Independent oracle: score every student directly, sort all of them, and take the first k.
function oracle(input) {
  const pos = new Set(input.positive_feedback)
  const neg = new Set(input.negative_feedback)
  const all = input.report.map((sentence, i) => {
    const words = sentence.split(' ')
    const score = words.filter(w => pos.has(w)).length * 3 - words.filter(w => neg.has(w)).length
    return { id: input.student_id[i], score }
  })
  all.sort((a, b) => (b.score - a.score) || (a.id - b.id))
  return all.slice(0, input.k).map(x => x.id)
}

test('2512 seeded random inputs match a sort-all oracle', () => {
  let seed = 2512
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pos = ['pa', 'pb', 'pc']
  const neg = ['na', 'nb']
  const all = [...pos, ...neg, 'xa', 'xb']
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(6)
    const report = Array.from({ length: count }, () => Array.from({ length: 1 + rnd(5) }, () => all[rnd(all.length)]).join(' '))
    const student_id = Array.from({ length: count }, (_, i) => 10 * i + 1 + rnd(9))
    const input = { positive_feedback: pos, negative_feedback: neg, report, student_id, k: 1 + rnd(count) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
