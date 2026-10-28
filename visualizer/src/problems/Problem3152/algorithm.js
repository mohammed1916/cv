export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 1 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each nums entry is an integer from 1 to 10.')
  if (!Array.isArray(input.queries) || input.queries.length < 1 || input.queries.length > 6) throw new Error('Use queries: an array of 1 to 6 [from, to] pairs.')
  const n = input.nums.length
  if (input.queries.some(q => !Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || q[0] < 0 || q[1] >= n || q[0] > q[1])) throw new Error('Each query is [from, to] with 0 <= from <= to < nums.length.')
  return { nums: input.nums, queries: input.queries }
}

export function buildTrace(input) {
  const { nums, queries } = input
  const n = nums.length
  // bad[i] counts the adjacent pairs (j - 1, j) with j <= i that share a parity.
  const bad = new Array(n).fill(0)
  const frames = [{ phase: 'start', activeLine: L('set bad[0]'), index: -1, bad: [...bad], range: null, message: 'No adjacent pairs have been checked yet.' }]
  for (let j = 1; j < n; j++) {
    const clash = nums[j] % 2 === nums[j - 1] % 2 ? 1 : 0
    bad[j] = bad[j - 1] + clash
    frames.push({ phase: 'count', activeLine: L('set bad[j]'), index: j, bad: [...bad], range: null, message: clash ? `Elements ${j - 1} and ${j} share parity.` : `Elements ${j - 1} and ${j} differ in parity.` })
  }
  const result = queries.map(([f, t], q) => {
    const special = bad[t] - bad[f] === 0
    frames.push({ phase: 'query', activeLine: L('if bad[t] minus bad[f]'), index: t, bad: [...bad], range: [f, t], query: q, special, message: `Query [${f}, ${t}] is ${special ? 'special' : 'not special'}.` })
    return special
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), index: -1, bad: [...bad], range: null, message: `Answers: ${result.join(', ')}.` })
  return { input, result, frames }
}

export const code = `check whether each query range alternates parity
  set bad[0] to 0
  for each index j from 1 to n minus 1 do
    set bad[j] to bad[j - 1], plus 1 if nums[j] and nums[j - 1] have the same parity
  set answers to an empty list
  for each query [f, t] do
    if bad[t] minus bad[f] is 0 then add true to answers
    otherwise add false to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def special_array_queries(nums, queries):
    bad = [0] * len(nums)
    for j in range(1, len(nums)):
        bad[j] = bad[j - 1] + (1 if nums[j] % 2 == nums[j - 1] % 2 else 0)
    return [bad[t] - bad[f] == 0 for f, t in queries]
`
