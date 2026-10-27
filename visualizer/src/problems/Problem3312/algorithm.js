const MAX_LENGTH = 10
const MAX_VALUE = 200

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Array.isArray(data.queries)) throw new Error('Use an object like {"nums":[2,3,4],"queries":[0,2,2]}.')
  if (data.nums.length < 2 || data.nums.length > MAX_LENGTH) throw new Error(`Use 2 to ${MAX_LENGTH} numbers.`)
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Numbers are integers from 1 to ${MAX_VALUE}.`)
  const pairs = data.nums.length * (data.nums.length - 1) / 2
  if (data.queries.length < 1 || data.queries.length > 10) throw new Error('Use 1 to 10 queries.')
  if (data.queries.some(q => !Number.isInteger(q) || q < 0 || q >= pairs)) throw new Error(`Each query is an index from 0 to ${pairs - 1}.`)
  return { nums: data.nums, queries: data.queries }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace({ nums, queries }) {
  const gcds = []
  const frames = [{ phase: 'start', activeLine: L('set gcds to an empty list'), values: [], active: -1, message: 'Start with an empty list of pair gcds.' }]
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      gcds.push(gcd(nums[i], nums[j]))
      frames.push({ phase: 'pairs', activeLine: L('add gcd of nums[i]'), values: [...gcds], active: gcds.length - 1, message: `gcd(${nums[i]}, ${nums[j]}) = ${gcds[gcds.length - 1]}.` })
    }
  }
  gcds.sort((a, b) => a - b)
  frames.push({ phase: 'sort', activeLine: L('sort gcds'), values: [...gcds], active: -1, message: 'Sorted all pair gcds in increasing order.' })
  const answers = []
  for (const q of queries) {
    answers.push(gcds[q])
    frames.push({ phase: 'query', activeLine: L('add gcds[q]'), values: [...gcds], active: q, message: `Query ${q} reads position ${q}: ${gcds[q]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), values: [...gcds], active: -1, message: `Answers: ${answers.join(', ')}.` })
  return { input: { nums, queries }, result: answers, sorted: gcds, frames }
}

export const code = `answer queries about sorted pair gcds
  set gcds to an empty list
  for each index i from 0 to n - 1
    for each index j from i + 1 to n - 1
      add gcd of nums[i] and nums[j] to gcds
  sort gcds in increasing order
  set answers to an empty list
  for each query q
    add gcds[q] to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sorted_gcd_pair_queries(nums, queries):
    from math import gcd
    gcds = sorted(gcd(nums[i], nums[j]) for i in range(len(nums)) for j in range(i + 1, len(nums)))
    return [gcds[q] for q in queries]
`
