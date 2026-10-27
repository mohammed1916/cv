export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Number.isInteger(input.k) || !Number.isInteger(input.x)) throw new Error('Use an object with an integer array nums and integers k and x.')
  if (input.nums.length < 1 || input.nums.length > 40) throw new Error('nums must have 1 to 40 entries.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each entry of nums is an integer from 1 to 50.')
  if (input.k < 1 || input.k > input.nums.length) throw new Error('k must be from 1 up to the length of nums.')
  if (input.x < 1 || input.x > input.k) throw new Error('x must be from 1 up to k.')
  return { nums: input.nums, k: input.k, x: input.x }
}

export function buildTrace({ nums, k, x }) {
  const frames = []
  const answers = []
  for (let start = 0; start + k <= nums.length; start++) {
    const counts = new Map()
    for (const value of nums.slice(start, start + k)) counts.set(value, (counts.get(value) || 0) + 1)
    frames.push({ phase: 'count', activeLine: L('count how many times each value'), left: start, right: start + k - 1, ranked: [], chosen: [], total: null, answers: [...answers], message: `Window at ${start}: count each value.` })
    const ranked = [...counts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || b.value - a.value)
    const chosen = ranked.slice(0, x)
    frames.push({ phase: 'rank', activeLine: L('sort the values'), left: start, right: start + k - 1, ranked, chosen, total: null, answers: [...answers], message: `Most frequent first, larger value first on ties. The top ${x} are kept.` })
    const total = chosen.reduce((sum, item) => sum + item.value * item.count, 0)
    answers.push(total)
    frames.push({ phase: 'sum', activeLine: L('add value times count'), left: start, right: start + k - 1, ranked, chosen, total, answers: [...answers], message: `X-sum of this window: ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), left: nums.length - k, right: nums.length - 1, ranked: [], chosen: [], total: null, answers: [...answers], message: `X-sums: [${answers.join(', ')}].` })
  return { input: { nums, k, x }, result: answers, frames }
}

export const code = `find the x-sum of all k-long subarrays (nums, k, x):
  set answers to empty
  for each start from 0 to the length of nums minus k
    count how many times each value occurs in the window
    sort the values by count, highest first, then by value, largest first
    set total to 0
    for the first x values in that order
      add value times count to total
    append total to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_x_sum(nums, k, x):
    answers = []
    for start in range(len(nums) - k + 1):
        counts = {}
        for value in nums[start:start + k]:
            counts[value] = counts.get(value, 0) + 1
        ranked = sorted(counts.items(), key=lambda item: (-item[1], -item[0]))
        total = 0
        for value, count in ranked[:x]:
            total += value * count
        answers.append(total)
    return answers
`
