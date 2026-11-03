export const phases = [
  { id: 'prefix', label: 'Build prefixes', description: 'Store the XOR of the first i values at position i, so any range can be read from two entries.' },
  { id: 'query', label: 'Answer query', description: 'For the inclusive range l to r, XOR the prefix after r with the prefix before l. Equal bits cancel.' },
  { id: 'done', label: 'Complete', description: 'Return every answer in the order the queries were given.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.arr) || !Array.isArray(input.queries)) throw new Error('Use an object such as {"arr": [5, 2, 6, 7], "queries": [[0, 2]]}.')
  const { arr, queries } = input
  if (arr.length < 1 || arr.length > 12 || !arr.every(v => Number.isInteger(v) && v >= 0 && v <= 255)) throw new Error('arr is 1 to 12 integers from 0 to 255.')
  if (queries.length < 1 || queries.length > 8) throw new Error('Use 1 to 8 queries.')
  for (const [l, r] of queries) {
    if (!Number.isInteger(l) || !Number.isInteger(r) || l < 0 || r >= arr.length || l > r) throw new Error(`Query [${l}, ${r}] must satisfy 0 ≤ l ≤ r < ${arr.length}.`)
  }
  return { arr, queries }
}

export function buildTrace({ arr, queries }) {
  const frames = []
  const pre = [0]
  for (let i = 0; i < arr.length; i++) {
    pre.push(pre[i] ^ arr[i])
    frames.push({ phase: 'prefix', activeLine: L('pre.append'), pythonLine: P('pre.append'), snapshot: { arr, pre: [...pre], query: null, answers: [] },
      message: `Prefix ${i + 1} is ${pre[i]} XOR ${arr[i]} = ${pre[i + 1]}.` })
  }
  const answers = []
  for (const [l, r] of queries) {
    const value = pre[r + 1] ^ pre[l]
    answers.push(value)
    frames.push({ phase: 'query', activeLine: L('answers.append'), pythonLine: P('for l, r in queries'), snapshot: { arr, pre: [...pre], query: [l, r], answers: [...answers] },
      message: `Range [${l}, ${r}]: prefix ${r + 1} is ${pre[r + 1]} and prefix ${l} is ${pre[l]}. Their XOR is ${value}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), pythonLine: P('return ['), snapshot: { arr, pre: [...pre], query: null, answers: [...answers] },
    message: `All queries are answered: ${answers.join(', ')}.` })
  return { input: { arr, queries }, result: answers, frames }
}

export const code = `xor range queries(arr, queries):
  pre = [0]
  for i from 0 to length - 1:
    pre.append(pre[i] XOR arr[i])
  answers = empty list
  for each [l, r] in queries:
    answers.append(pre[r + 1] XOR pre[l])
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def xor_queries(arr, queries):
    pre = [0]
    for v in arr:
        pre.append(pre[-1] ^ v)
    return [pre[r + 1] ^ pre[l] for l, r in queries]`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
