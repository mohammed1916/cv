export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 40 || nums.length % 2 !== 0) throw new Error('Use an array of 2 to 40 numbers with an even count.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each number is an integer from 1 to 50.')
  return nums
}

export function buildTrace(nums) {
  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length
  const frames = [{ phase: 'start', activeLine: L('sort a copy'), index: -1, partner: -1, best: null, message: 'Sorted. Each round removes the smallest and largest remaining numbers, so the pairs are mirror positions.' }]
  let best = null
  for (let i = 0; i < n / 2; i++) {
    const average = (sorted[i] + sorted[n - 1 - i]) / 2
    if (best === null || average < best) best = average
    frames.push({ phase: 'pair', activeLine: L('set average'), index: i, partner: n - 1 - i, best, message: `Pair ${sorted[i]} with ${sorted[n - 1 - i]}: average ${average}. Best so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, partner: -1, best, message: `Minimum average: ${best}.` })
  return { input: nums, sorted, result: best, frames }
}

export const code = `minimum average of the smallest and largest pairs
  sort a copy of nums
  set best to nothing
  for each position i from the start up to half the length
    pair the number at i with the number at the mirror position from the end
    set average to the sum of the pair divided by two
    if best is unset or average is smaller then set best to average
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_average(nums):
    arr = sorted(nums)
    n = len(arr)
    best = None
    for i in range(n // 2):
        avg = (arr[i] + arr[n - 1 - i]) / 2
        if best is None or avg < best:
            best = avg
    return best
`
