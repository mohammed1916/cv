export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('nums must be 1–10,000 integers from −10,000 to 10,000.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be an integer from 1 to the length of nums.')
  return { nums, k }
}

// A window of k values slides across nums. Each step adds the entering value and removes the leaving one.
export function buildTrace({ nums, k }) {
  let sum = 0
  for (let i = 0; i < k; i++) sum += nums[i]
  let best = sum
  let bestStart = 0
  const frames = [{ phase: 'start', nums, k, l: 0, r: k - 1, sum, best, bestStart, activeLine: L('let sum = 0'), pythonLine: P('total = sum(nums[:k])'), message: `First window: indices 0 to ${k - 1}, sum ${sum}.` }]
  for (let i = k; i < nums.length; i++) {
    sum += nums[i] - nums[i - k]
    if (sum > best) { best = sum; bestStart = i - k + 1 }
    frames.push({ phase: 'slide', nums, k, l: i - k + 1, r: i, sum, best, bestStart, activeLine: L('sum += nums[right]'), pythonLine: P('total += nums[i]'), message: `Slide to indices ${i - k + 1} to ${i}: sum ${sum}, best so far ${best}.` })
  }
  const result = best / k
  frames.push({ phase: 'done', nums, k, l: bestStart, r: bestStart + k - 1, sum, best, bestStart, result, activeLine: L('return best / k'), pythonLine: P('return best / k'), message: `Largest average: ${best} / ${k} = ${result}.` })
  return { input: { nums, k }, result, frames }
}

const SOURCE = `function findMaxAverage(nums, k) {
  let sum = 0
  for (let i = 0; i < k; i++) sum += nums[i]
  let best = sum
  for (let right = k; right < nums.length; right++) {
    sum += nums[right] - nums[right - k]
    best = Math.max(best, sum)
  }
  return best / k
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_max_average(nums, k):
    total = sum(nums[:k])
    best = total
    for i in range(k, len(nums)):
        total += nums[i] - nums[i - k]
        best = max(best, total)
    return best / k`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
