export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and requests.')
  const { nums, requests } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums must be an array of 1 to 10 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 99)) throw new Error('Each nums value must be an integer from 0 to 99.')
  if (!Array.isArray(requests) || requests.length < 1 || requests.length > 8) throw new Error('requests must be an array of 1 to 8 [start, end] pairs.')
  for (const r of requests) {
    if (!Array.isArray(r) || r.length !== 2 || !Number.isInteger(r[0]) || !Number.isInteger(r[1]) || r[0] < 0 || r[1] < r[0] || r[1] >= nums.length) {
      throw new Error('Each request needs 0 <= start <= end < nums.length.')
    }
  }
  return { nums, requests }
}

const CODE = [
  'function maxSumRangeQuery(nums, requests) {',
  '  const n = nums.length',
  '  const diff = Array(n + 1).fill(0)',
  '  for (const [s, e] of requests) { diff[s] += 1; diff[e + 1] -= 1 }',
  '  const counts = []',
  '  let running = 0',
  '  for (let i = 0; i < n; i++) { running += diff[i]; counts.push(running) }',
  '  const values = [...nums].sort((a, b) => b - a)',
  '  const sortedCounts = [...counts].sort((a, b) => b - a)',
  '  let total = 0',
  '  for (let i = 0; i < n; i++) total += values[i] * sortedCounts[i]',
  '  return total % 1000000007',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(c => c.includes(s)) + 1

export function buildTrace({ nums, requests }) {
  const n = nums.length
  const diff = Array(n + 1).fill(0)
  const frames = [{ phase: 'start', pythonLine: 3, activeLine: L('const diff'), index: -1, counts: null, message: 'Count how many requests cover each position using a difference array.' }]
  for (const [s, e] of requests) {
    diff[s] += 1
    diff[e + 1] -= 1
    frames.push({ phase: 'mark', pythonLine: 6, activeLine: L('for (const [s, e]'), index: s, counts: null, message: `Request [${s}, ${e}] adds one at ${s} and takes one away after ${e}.` })
  }
  const counts = []
  let running = 0
  for (let i = 0; i < n; i++) {
    running += diff[i]
    counts.push(running)
    frames.push({ phase: 'count', pythonLine: 11, activeLine: L('running += diff[i]'), index: i, counts: [...counts], message: `Position ${i} is covered by ${running} request(s).` })
  }
  const values = [...nums].sort((a, b) => b - a)
  const sortedCounts = [...counts].sort((a, b) => b - a)
  frames.push({ phase: 'sort', pythonLine: 13, activeLine: L('const values'), index: -1, counts: sortedCounts, message: 'Largest values will be paired with the most covered positions.' })
  let total = 0
  for (let i = 0; i < n; i++) {
    total += values[i] * sortedCounts[i]
    frames.push({ phase: 'pair', pythonLine: 14, activeLine: L('total += values[i]'), index: i, counts: sortedCounts, message: `Add ${values[i]} times ${sortedCounts[i]} to the total, now ${total}.` })
  }
  const result = total % 1000000007
  frames.push({ phase: 'done', pythonLine: 15, activeLine: L('return total'), index: -1, counts: sortedCounts, message: `Maximum sum is ${result}.` })
  return { input: { nums, requests }, nums, counts, result, frames }
}

export const python = `def max_permutation_sum(nums, requests):
    n = len(nums)
    diff = [0] * (n + 1)
    for start, end in requests:
        diff[start] += 1
        diff[end + 1] -= 1
    counts = []
    running = 0
    for i in range(n):
        running += diff[i]
        counts.append(running)
    values = sorted(nums, reverse=True)
    counts.sort(reverse=True)
    total = sum(v * c for v, c in zip(values, counts))
    return total % 1000000007
`
