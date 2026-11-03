// LeetCode 2819: Minimum Relative Loss After Buying Chocolates (draft rules).
// Each query [k, m] buys exactly m chocolates. For a chosen price p, Bob pays min(p, k) and Alice pays the rest.
// Relative loss per chocolate is Bob's share minus Alice's share, so it can be negative.
// Choosing m chocolates means taking the m smallest per-chocolate values, so the answer is their sum.

const isInt = (value, low, high) => Number.isInteger(value) && value >= low && value <= high

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with prices and queries.')
  const { prices, queries } = input
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 10 || !prices.every(p => isInt(p, 1, 20))) {
    throw new Error('prices has 1 to 10 integers from 1 to 20.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 5) throw new Error('queries has 1 to 5 pairs.')
  for (const pair of queries) {
    if (!Array.isArray(pair) || pair.length !== 2 || !isInt(pair[0], 1, 20) || !isInt(pair[1], 0, prices.length)) {
      throw new Error('Each query is [k, m] with k from 1 to 20 and m from 0 to the number of prices.')
    }
  }
  return { prices, queries }
}

const CODE_TEXT = [
  'minimum relative loss for each query [k, m]',
  '  answers ← empty list',
  '  FOR each query (k, m)',
  '    values ← empty list',
  '    FOR each price p',
  '      bob ← min(p, k)',
  '      alice ← p - bob',
  '      append bob - alice to values',
  '    sort values in ascending order',
  '    total ← sum of the first m values in sorted order',
  '    append total to answers',
  '  return answers',
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

const PYTHON_TEXT = `def minimum_relative_loss(prices, queries):
    answers = []
    for k, m in queries:
        values = []
        for p in prices:
            bob = min(p, k)
            alice = p - bob
            values.append(bob - alice)
        values.sort()
        answers.append(sum(values[:m]))
    return answers
`

export const python = PYTHON_TEXT

const P = s => {
  const index = PYTHON_TEXT.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'query', label: 'Query', description: 'Start one query with its k and m.' },
  { id: 'value', label: 'Value', description: 'Split each price into Bob and Alice shares.' },
  { id: 'sort', label: 'Sort', description: 'Order the per-chocolate values.' },
  { id: 'take', label: 'Take', description: 'Add the smallest values until m are taken.' },
  { id: 'answer', label: 'Answer', description: 'Record this query total.' },
  { id: 'done', label: 'Result', description: 'Return every answer.' },
]

export function buildTrace({ prices, queries }) {
  const frames = []
  const answers = []
  for (let q = 0; q < queries.length; q++) {
    const [k, m] = queries[q]
    const values = []
    const base = { queryIndex: q, k, m, answers: [...answers] }
    frames.push({ ...base, phase: 'query', activeLine: L('FOR each query'), pythonLine: P('for k, m in queries'), price: null, values: [], sorted: null, taken: 0, total: null, message: `Query ${q + 1}: k = ${k}, buy m = ${m}.` })
    for (let i = 0; i < prices.length; i++) {
      const p = prices[i]
      const bob = Math.min(p, k)
      const alice = p - bob
      values.push(bob - alice)
      frames.push({ ...base, phase: 'value', activeLine: L('append bob - alice'), pythonLine: P('values.append(bob - alice)'), price: i, values: [...values], sorted: null, taken: 0, total: null, message: `Price ${p}: Bob ${bob}, Alice ${alice}, value ${bob - alice}.` })
    }
    const sorted = [...values].sort((a, b) => a - b)
    frames.push({ ...base, phase: 'sort', activeLine: L('sort values'), pythonLine: P('values.sort()'), price: null, values: [...values], sorted: [...sorted], taken: 0, total: null, message: `Sorted values: ${sorted.join(', ')}.` })
    let total = 0
    for (let t = 0; t < m; t++) {
      total += sorted[t]
      frames.push({ ...base, phase: 'take', activeLine: L('sum of the first m'), pythonLine: P('answers.append(sum(values[:m]))'), price: null, values: [...values], sorted: [...sorted], taken: t + 1, total, message: `Take ${sorted[t]}; running total ${total}.` })
    }
    if (m === 0) frames.push({ ...base, phase: 'take', activeLine: L('sum of the first m'), pythonLine: P('answers.append(sum(values[:m]))'), price: null, values: [...values], sorted: [...sorted], taken: 0, total: 0, message: 'm is 0, so the total is 0.' })
    answers.push(total)
    frames.push({ queryIndex: q, k, m, answers: [...answers], phase: 'answer', activeLine: L('append total'), pythonLine: P('answers.append'), price: null, values: [...values], sorted: [...sorted], taken: m, total, message: `Query ${q + 1} answer is ${total}.` })
  }
  frames.push({ queryIndex: -1, k: null, m: null, answers: [...answers], phase: 'done', activeLine: L('return answers'), pythonLine: P('return answers'), price: null, values: [], sorted: null, taken: 0, total: null, message: `Answers: ${answers.join(', ')}.` })
  return { input: { prices, queries }, result: answers, frames }
}
