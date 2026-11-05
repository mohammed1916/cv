export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, queries and x.')
  const { nums, queries, x } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('nums has 1 to 20 integers from 1 to 20.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 20 || !queries.every(q => Number.isInteger(q) && q >= 1 && q <= 20)) throw new Error('queries has 1 to 20 integers from 1 to 20.')
  if (!Number.isInteger(x) || x < 1 || x > 20) throw new Error('x is an integer from 1 to 20.')
  return { nums, queries, x }
}

export function buildTrace({ nums, queries, x }) {
  const frames = []
  const positions = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('const positions = []'), positions: [], query: null, answer: -1, message: `Look for ${x} in nums.` })
  nums.forEach((v, i) => {
    if (v === x) {
      positions.push(i)
      frames.push({ pythonLine: 2, phase: 'record', activeLine: L('const positions = []'), positions: [...positions], query: null, answer: -1, message: `Occurrence ${positions.length} of ${x} is at index ${i}.` })
    }
  })
  const answer = []
  for (const q of queries) {
    const value = q <= positions.length ? positions[q - 1] : -1
    answer.push(value)
    frames.push({ pythonLine: 7, phase: 'query', activeLine: L('if (q <= positions.length)'), positions: [...positions], query: q, answer: value, message: value === -1 ? `Only ${positions.length} occurrences; query ${q} gives -1.` : `Occurrence ${q} is at index ${value}.` })
  }
  frames.push({ pythonLine: 9, phase: 'done', activeLine: L('return answer'), positions: [...positions], query: null, answer: null, message: `Answers: [${answer.join(', ')}].` })
  return { input: { nums, queries, x }, result: answer, frames }
}

export const code = `function occurrences(nums, queries, x) {
  const positions = []
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === x) positions.push(i)
  }
  const answer = []
  for (const q of queries) {
    if (q <= positions.length) answer.push(positions[q - 1])
    else answer.push(-1)
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def occurrences(nums, queries, x):
    positions = [i for i, v in enumerate(nums) if v == x]
    answer = []
    for q in queries:
        if q <= len(positions):
            answer.append(positions[q - 1])
        else:
            answer.append(-1)
    return answer
`
