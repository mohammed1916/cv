export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12) throw new Error('Use {"nums": [...]} with 2 to 12 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Numbers are integers from 1 to 1000.')
  return { nums }
}

export function buildTrace(input) {
  const sorted = [...input.nums].sort((a, b) => a - b)
  const frames = [{ phase: 'sort', activeLine: L('sort a copy of nums'), i: -1, gap: null, best: null, sorted, message: `Sorted numbers: ${sorted.join(', ')}.` }]
  let best = Infinity
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1]
    frames.push({ phase: 'gap', activeLine: L('set gap to'), i, gap, best: best === Infinity ? null : best, sorted, message: `Neighbours ${sorted[i - 1]} and ${sorted[i]} differ by ${gap}.` })
    if (gap < best) {
      best = gap
      frames.push({ phase: 'better', activeLine: L('if gap is less than best'), i, gap, best, sorted, message: `${gap} is the smallest gap so far.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), i: -1, gap: null, best, sorted, message: `Smallest possible value of the partition: ${best}.` })
  return { input, sorted, result: best, frames }
}

export const code = `find the smallest possible |max(nums1) - min(nums2)| over all splits
  sort a copy of nums in ascending order
  set best to a very large number
  for each position i from 1 to n minus 1
    set gap to sorted at i minus sorted at i minus 1
    if gap is less than best then set best to gap
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_value_of_partition(nums):
    ordered = sorted(nums)
    best = float('inf')
    for i in range(1, len(ordered)):
        gap = ordered[i] - ordered[i - 1]
        if gap < best:
            best = gap
    return best
`
