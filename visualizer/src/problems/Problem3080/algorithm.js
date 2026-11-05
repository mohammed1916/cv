export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('nums has 1 to 12 integers from 1 to 20.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 12) throw new Error('queries has 1 to 12 entries.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || q[0] < 0 || q[0] >= nums.length || !Number.isInteger(q[1]) || q[1] < 0) throw new Error('Each query is [index, k] with a valid index and k of at least 0.')
  }
  return { nums, queries }
}

export function buildTrace({ nums, queries }) {
  const frames = []
  const n = nums.length
  const marked = Array(n).fill(false)
  let total = nums.reduce((a, b) => a + b, 0)
  const answer = []
  frames.push({ pythonLine: 4, phase: 'start', activeLine: L('let total ='), query: null, marked: [...marked], total, answer: [...answer], message: `Unmarked sum starts at ${total}.` })
  for (const [index, k] of queries) {
    if (!marked[index]) {
      marked[index] = true
      total -= nums[index]
      frames.push({ pythonLine: 8, phase: 'mark', activeLine: L('marked[index] = true'), query: [index, k], marked: [...marked], total, answer: [...answer], message: `Mark index ${index} (value ${nums[index]}).` })
    }
    const order = []
    for (let i = 0; i < n; i++) if (!marked[i]) order.push(i)
    order.sort((a, b) => nums[a] - nums[b] || a - b)
    frames.push({ pythonLine: 10, phase: 'order', activeLine: L('order.sort'), query: [index, k], marked: [...marked], total, answer: [...answer], message: `Unmarked indices in order: ${order.join(', ') || 'none'}.` })
    for (const i of order.slice(0, k)) {
      marked[i] = true
      total -= nums[i]
      frames.push({ pythonLine: 12, phase: 'smallest', activeLine: L('for (const i of order.slice'), query: [index, k], marked: [...marked], total, answer: [...answer], message: `Mark index ${i} (value ${nums[i]}).` })
    }
    answer.push(total)
    frames.push({ pythonLine: 14, phase: 'record', activeLine: L('answer.push(total)'), query: [index, k], marked: [...marked], total, answer: [...answer], message: `Unmarked sum after this query is ${total}.` })
  }
  frames.push({ pythonLine: 15, phase: 'done', activeLine: L('return answer'), query: null, marked: [...marked], total, answer: [...answer], message: `Answers: [${answer.join(', ')}].` })
  return { input: { nums, queries }, result: answer, frames }
}

export const code = `function unmarkedSums(nums, queries) {
  const n = nums.length
  const marked = Array(n).fill(false)
  let total = nums.reduce((a, b) => a + b, 0)
  const answer = []
  for (const [index, k] of queries) {
    if (!marked[index]) {
      marked[index] = true
      total -= nums[index]
    }
    const order = []
    for (let i = 0; i < n; i++) if (!marked[i]) order.push(i)
    order.sort((a, b) => nums[a] - nums[b] || a - b)
    for (const i of order.slice(0, k)) {
      marked[i] = true
      total -= nums[i]
    }
    answer.push(total)
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def unmarked_sums(nums, queries):
    n = len(nums)
    marked = [False] * n
    total = sum(nums)
    answer = []
    for index, k in queries:
        if not marked[index]:
            marked[index] = True
            total -= nums[index]
        order = sorted((i for i in range(n) if not marked[i]), key=lambda i: (nums[i], i))
        for i in order[:k]:
            marked[i] = True
            total -= nums[i]
        answer.append(total)
    return answer
`
