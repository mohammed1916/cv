export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys positive_feedback, negative_feedback, report, student_id and k.')
  const { positive_feedback: positive, negative_feedback: negative, report, student_id: ids, k } = input
  const words = (name, list) => {
    if (!Array.isArray(list) || list.length < 1 || list.length > 5) throw new Error(`${name} needs 1 to 5 words.`)
    if (list.some(w => typeof w !== 'string' || !/^[a-z]{1,12}$/.test(w))) throw new Error(`${name} words are lowercase letters, 1 to 12 long.`)
    if (new Set(list).size !== list.length) throw new Error(`${name} must not repeat a word.`)
  }
  words('positive_feedback', positive)
  words('negative_feedback', negative)
  if (positive.some(w => negative.includes(w))) throw new Error('A word cannot be both positive and negative.')
  if (!Array.isArray(report) || report.length < 1 || report.length > 6) throw new Error('report needs 1 to 6 sentences.')
  report.forEach(s => {
    if (typeof s !== 'string' || !/^[a-z]+( [a-z]+)*$/.test(s) || s.split(' ').length > 6) throw new Error('Each report sentence is 1 to 6 lowercase words separated by single spaces.')
  })
  if (!Array.isArray(ids) || ids.length !== report.length || ids.some(id => !Number.isInteger(id) || id < 1 || id > 99) || new Set(ids).size !== ids.length) {
    throw new Error('student_id needs one unique integer from 1 to 99 for each report sentence.')
  }
  if (!Number.isInteger(k) || k < 1 || k > report.length) throw new Error('k must be from 1 to the number of students.')
  return { positive_feedback: positive, negative_feedback: negative, report, student_id: ids, k }
}

// The heap keeps the worst student on top: lower score first, and on a tie the larger id.
const worse = (a, b) => a.score < b.score || (a.score === b.score && a.id > b.id)
function siftUp(heap, start) {
  let i = start
  while (i > 0) {
    const parent = (i - 1) >> 1
    if (!worse(heap[i], heap[parent])) break
    ;[heap[i], heap[parent]] = [heap[parent], heap[i]]
    i = parent
  }
}
function siftDown(heap, start) {
  let i = start
  for (;;) {
    const left = 2 * i + 1
    const right = left + 1
    let top = i
    if (left < heap.length && worse(heap[left], heap[top])) top = left
    if (right < heap.length && worse(heap[right], heap[top])) top = right
    if (top === i) return
    ;[heap[i], heap[top]] = [heap[top], heap[i]]
    i = top
  }
}

export function buildTrace(input) {
  const { positive_feedback: positiveWords, negative_feedback: negativeWords, report, student_id: ids, k } = input
  const positive = new Set(positiveWords)
  const negative = new Set(negativeWords)
  const frames = []
  const heap = []
  const scores = Array(report.length).fill(null)
  let index = -1
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, index, scores: [...scores], heap: heap.map(item => ({ ...item })), message,
  })
  snap('start', L('mark the positive and negative words'), 'Mark the feedback words. The heap starts empty.')
  for (let i = 0; i < report.length; i++) {
    index = i
    let score = 0
    for (const word of report[i].split(' ')) {
      if (positive.has(word)) score += 3
      else if (negative.has(word)) score -= 1
    }
    scores[i] = score
    snap('score', L('score the student'), `Student ${ids[i]} scores ${score}.`)
    heap.push({ id: ids[i], score })
    siftUp(heap, heap.length - 1)
    snap('push', L('push the student'), `Student ${ids[i]} enters the heap.`)
    if (heap.length > k) {
      const removed = heap[0]
      const last = heap.pop()
      if (heap.length) { heap[0] = last; siftDown(heap, 0) }
      snap('pop', L('remove the weakest'), `The heap holds more than ${k}, so student ${removed.id} (score ${removed.score}) leaves.`)
    }
  }
  index = -1
  const ranked = [...heap].sort((a, b) => b.score - a.score || a.id - b.id)
  heap.splice(0, heap.length, ...ranked)
  snap('sort', L('sort the heap'), 'Sort the survivors from best to worst, ties by smaller id.')
  const result = ranked.map(item => item.id)
  snap('done', L('return the first k ids'), `Answer: [${result.join(', ')}].`)
  return { input, result, frames }
}

export const code = `mark the positive and negative words
start with an empty heap of students
for each student in order
  score the student: add 3 for each positive word and subtract 1 for each negative word
  push the student onto the heap
  if the heap holds more than k students, remove the weakest
sort the heap from best to worst, with ties broken by smaller id
return the first k ids`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def top_students(positive_feedback, negative_feedback, report, student_id, k):
    positive = set(positive_feedback)
    negative = set(negative_feedback)
    heap = []
    for sid, sentence in zip(student_id, report):
        score = 0
        for word in sentence.split(' '):
            if word in positive:
                score += 3
            elif word in negative:
                score -= 1
        heapq.heappush(heap, (score, -sid))
        if len(heap) > k:
            heapq.heappop(heap)
    ranked = sorted(heap, key=lambda item: (-item[0], -item[1]))
    return [-item[1] for item in ranked]
`
