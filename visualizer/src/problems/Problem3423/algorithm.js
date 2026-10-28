export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12) throw new Error('Use {"nums": [...]} with 2 to 12 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < -100 || v > 100)) throw new Error('Numbers are integers from -100 to 100.')
  return { nums }
}

export function buildTrace(input) {
  const nums = input.nums
  const n = nums.length
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('set best to zero'), at: null, next: null, gap: null, best: 0, message: 'Start with a best difference of zero.' }]
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n
    const gap = Math.abs(nums[i] - nums[next])
    frames.push({ phase: 'pair', activeLine: L('set gap to'), at: i, next, gap, best, message: `Compare ${nums[i]} at ${i} with ${nums[next]} at ${next}: gap ${gap}.` })
    if (gap > best) {
      best = gap
      frames.push({ phase: 'better', activeLine: L('if gap is greater than best'), at: i, next, gap, best, message: `${gap} is the largest gap so far.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), at: null, next: null, gap: null, best, message: `Largest adjacent difference: ${best}.` })
  return { input, result: best, frames }
}

export const code = `largest difference between circular neighbours
  set best to zero
  for each index i from 0 to n minus 1
    let next be the index after i, wrapping back to 0 after the last index
    set gap to the absolute difference of nums at i and nums at next
    if gap is greater than best then set best to gap
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_adjacent_difference(nums):
    n = len(nums)
    best = 0
    for i in range(n):
        gap = abs(nums[i] - nums[(i + 1) % n])
        if gap > best:
            best = gap
    return best
`
