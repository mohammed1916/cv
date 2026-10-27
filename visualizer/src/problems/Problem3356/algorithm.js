export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 6)) {
    throw new Error('nums must be 1 to 8 integers from 0 to 6.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries must be an array of 1 to 8 [l, r, val] triples.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 3 || !q.every(Number.isInteger)) throw new Error('Each query is [l, r, val] with integers.')
    const [l, r, val] = q
    if (l < 0 || r < l || r >= nums.length || val < 1 || val > 4) throw new Error('Each query needs 0 <= l <= r < nums.length and 1 <= val <= 4.')
  }
  return { nums, queries }
}

export const code = `minimum number of queries whose decrements can zero nums
  let n be the length of nums and q the number of queries
  for k from 0 to q
  supply is zero for every position
  for each of the first k queries add its value to each position in its range
  if every position has supply at least its value then return k
  return minus one if no number of queries works`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums, queries }) {
  const n = nums.length
  const frames = [{ phase: 'start', activeLine: L('let n be'), index: -1, supply: null, k: 0, message: 'Try longer and longer prefixes of the queries.' }]
  let answer = -1
  for (let k = 0; k <= queries.length && answer === -1; k++) {
    const supply = Array(n).fill(0)
    for (const [l, r, val] of queries.slice(0, k)) for (let i = l; i <= r; i++) supply[i] += val
    const short = supply.findIndex((s, i) => s < nums[i])
    frames.push({ phase: short === -1 ? 'done' : 'check', activeLine: L('if every position'), index: short === -1 ? -1 : short, supply: [...supply], k, message: short === -1 ? `The first ${k} queries supply every position.` : `With ${k} queries, position ${short} gets ${supply[short]} but needs ${nums[short]}.` })
    if (short === -1) answer = k
  }
  if (answer === -1) frames.push({ phase: 'done', activeLine: L('return minus one'), index: -1, supply: null, k: queries.length, message: 'No prefix of queries is enough.' })
  return { input: { nums, queries }, result: answer, frames }
}

export const python = `def min_queries(nums, queries):
    n = len(nums)
    for k in range(len(queries) + 1):
        supply = [0] * n
        for l, r, val in queries[:k]:
            for i in range(l, r + 1):
                supply[i] += val
        if all(supply[i] >= nums[i] for i in range(n)):
            return k
    return -1
`
