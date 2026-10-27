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

export function buildTrace(input) {
  const { arr, queries } = input
  const frames = [{ phase: 'start', activeLine: L('for each query'), query: null, range: null, counts: null, answers: [], message: 'Answer the queries in order, counting values inside each range.' }]
  const answers = []
  queries.forEach((query, qi) => {
    const [left, right, threshold] = query
    const counts = {}
    for (let i = left; i <= right; i++) counts[arr[i]] = (counts[arr[i]] || 0) + 1
    frames.push({ phase: 'count', activeLine: L('count how many times'), query: qi, range: [left, right], threshold, counts: { ...counts }, answers: answers.slice(), message: `Query ${qi + 1}: count the values in positions ${left} to ${right}.` })
    let found = -1
    for (const value of Object.keys(counts)) {
      if (counts[value] >= threshold) found = Number(value)
    }
    answers.push(found)
    frames.push({ phase: 'answer', activeLine: L('if its count'), query: qi, range: [left, right], threshold, counts: { ...counts }, answers: answers.slice(), message: found === -1 ? `No value reaches ${threshold}, so the answer is -1.` : `Value ${found} reaches ${threshold}, so the answer is ${found}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), query: null, range: null, counts: null, answers: answers.slice(), message: `Answers: [${answers.join(', ')}].` })
  return { input, result: answers, frames }
}

export const code = `online majority for each query [left, right, threshold]:
  set answers to an empty list
  for each query in order:
    count how many times each value appears from left to right
    set found to -1
    for each value with a count:
      if its count is at least threshold then
        set found to that value
    add found to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def online_majority(arr, queries):
    answers = []
    for left, right, threshold in queries:
        counts = {}
        for i in range(left, right + 1):
            counts[arr[i]] = counts.get(arr[i], 0) + 1
        found = -1
        for value, count in counts.items():
            if count >= threshold:
                found = value
        answers.append(found)
    return answers
`
