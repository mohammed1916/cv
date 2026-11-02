export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 digit strings in this visualization.')
  const width = nums[0]?.length
  if (!nums.every(s => typeof s === 'string' && /^[0-9]+$/.test(s) && s.length === width && width <= 12)) throw new Error('Each number is a digit string of the same length, at most 12 digits.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries has 1 to 8 pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || q[0] < 1 || q[0] > nums.length) throw new Error('Each query is [k, trim] with 1 <= k <= n.')
    if (!Number.isInteger(q[1]) || q[1] < 1 || q[1] > width) throw new Error('trim must be between 1 and the digit length.')
  }
  return { nums, queries }
}

export function buildTrace({ nums, queries }) {
  const frames = []
  const answer = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('empty answer'), at: -1, k: null, trim: null, keys: [], order: [], result: null, message: `Answer ${queries.length} queries over ${nums.length} numbers.` })
  for (const [k, trim] of queries) {
    frames.push({ pythonLine: 3, phase: 'query', activeLine: L('for each query'), at: -1, k, trim, keys: [], order: [], result: null, message: `Query k=${k}, keep the last ${trim} digits.` })
    const keyed = nums.map((s, i) => ({ key: s.slice(-trim), i }))
    frames.push({ pythonLine: 4, phase: 'keys', activeLine: L('trim each'), at: -1, k, trim, keys: keyed.map(x => x.key), order: [], result: null, message: `Trimmed values: ${keyed.map(x => x.key).join(', ')}.` })
    keyed.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : a.i - b.i))
    const order = keyed.map(x => x.i)
    frames.push({ pythonLine: 5, phase: 'sort', activeLine: L('sort'), at: -1, k, trim, keys: keyed.map(x => x.key), order, result: null, message: `Sorted by trimmed value, then index: ${order.join(', ')}.` })
    const picked = keyed[k - 1].i
    answer.push(picked)
    frames.push({ pythonLine: 6, phase: 'pick', activeLine: L('append'), at: picked, k, trim, keys: keyed.map(x => x.key), order, result: picked, message: `The ${k}th entry is index ${picked}.` })
  }
  frames.push({ pythonLine: 7, phase: 'done', activeLine: L('return answer'), at: -1, k: null, trim: null, keys: [], order: [], result: answer, message: `Answers: [${answer.join(', ')}].` })
  return { input: { nums, queries }, result: answer, frames }
}

export const code = `answer the queries about trimmed numbers
  answer = empty list
  for each query [k, trim]
    make a key for each number by keeping its last trim digits
    sort the indices by key, then by index
    append the index at position k minus 1
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_trimmed_numbers(nums, queries):
    answer = []
    for k, trim in queries:
        keyed = [(s[-trim:], i) for i, s in enumerate(nums)]
        keyed.sort()
        answer.append(keyed[k - 1][1])
    return answer
`
