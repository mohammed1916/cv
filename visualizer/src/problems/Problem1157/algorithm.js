export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.arr) || !Array.isArray(obj.queries)) {
    throw new Error('Use {"arr": [...], "queries": [[left, right, threshold], ...]}.')
  }
  if (obj.arr.length < 1 || obj.arr.length > 12) throw new Error('arr needs 1 to 12 integers.')
  if (obj.arr.some(v => !Number.isInteger(v) || v < 0 || v > 9)) throw new Error('arr values are integers from 0 to 9.')
  if (obj.queries.length < 1 || obj.queries.length > 6) throw new Error('Use 1 to 6 queries.')
  for (const q of obj.queries) {
    if (!Array.isArray(q) || q.length !== 3 || q.some(v => !Number.isInteger(v))) {
      throw new Error('Each query is [left, right, threshold] with integers.')
    }
    const [left, right, threshold] = q
    if (left < 0 || right >= obj.arr.length || left > right) throw new Error('Each query needs 0 <= left <= right < arr length.')
    const length = right - left + 1
    if (threshold > length || 2 * threshold <= length) {
      throw new Error('threshold must be more than half the subarray length and at most its length, so the majority is unique.')
    }
  }
  return { arr: obj.arr, queries: obj.queries }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function onlineMajority(arr, queries) {', 'def online_majority(arr, queries):'],
  ['  const answers = []', '    answers = []'],
  ['  for (const [left, right, threshold] of queries) {', '    for left, right, threshold in queries:'],
  ['    const counts = new Map()', '        counts = {}'],
  ['    for (let i = left; i <= right; i++) counts.set(arr[i], (counts.get(arr[i]) || 0) + 1)', '        for i in range(left, right + 1): counts[arr[i]] = counts.get(arr[i], 0) + 1'],
  ['    let found = -1', '        found = -1'],
  ['    for (const [value, count] of counts) {', '        for value, count in counts.items():'],
  ['      if (count >= threshold) found = value', '            if count >= threshold: found = value'],
  ['    }', ''],
  ['    answers.push(found)', '        answers.append(found)'],
  ['  }', ''],
  ['  return answers', '    return answers'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { arr, queries } = input
  const frames = [{ phase: 'start', pythonLine: P('answers = []'), activeLine: L('const answers'), query: null, range: null, counts: null, answers: [], message: 'Answer the queries in order, counting values inside each range.' }]
  const answers = []
  queries.forEach((query, qi) => {
    const [left, right, threshold] = query
    const counts = {}
    for (let i = left; i <= right; i++) counts[arr[i]] = (counts[arr[i]] || 0) + 1
    frames.push({ phase: 'count', pythonLine: P('for i in range'), activeLine: L('for (let i = left'), query: qi, range: [left, right], threshold, counts: { ...counts }, answers: answers.slice(), message: `Query ${qi + 1}: count the values in positions ${left} to ${right}.` })
    let found = -1
    for (const value of Object.keys(counts)) {
      if (counts[value] >= threshold) found = Number(value)
    }
    answers.push(found)
    frames.push({ phase: 'answer', pythonLine: P('if count >= threshold'), activeLine: L('if (count >= threshold)'), query: qi, range: [left, right], threshold, counts: { ...counts }, answers: answers.slice(), message: found === -1 ? `No value reaches ${threshold}, so the answer is -1.` : `Value ${found} reaches ${threshold}, so the answer is ${found}.` })
  })
  frames.push({ phase: 'done', pythonLine: P('return answers'), activeLine: L('return answers'), query: null, range: null, counts: null, answers: answers.slice(), message: `Answers: [${answers.join(', ')}].` })
  return { input, result: answers, frames }
}
