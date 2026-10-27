export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Number.isInteger(data.k)) {
    throw new Error('Use {"nums": [...], "k": n} with a 0/1 array and an integer k.')
  }
  const { nums, k } = data
  if (nums.length < 1 || nums.length > 12) throw new Error('nums must have 1 to 12 entries.')
  if (nums.some(v => v !== 0 && v !== 1)) throw new Error('nums entries must be 0 or 1.')
  if (k < 1 || k > nums.length) throw new Error(`k must be an integer from 1 to ${nums.length}.`)
  return { nums, k }
}

// Bit at index j after the flips started so far: the original bit XOR the parity of windows covering j.
function effectiveBits(nums, flipped, k) {
  return nums.map((bit, j) => {
    let covering = 0
    for (let s = Math.max(0, j - k + 1); s <= j; s++) covering += flipped[s]
    return bit ^ (covering % 2)
  })
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  const flipped = Array(n).fill(0)
  let active = 0
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('flipped = [0] * n'), i: -1, flipped: [...flipped], bits: [...nums], active, count, result: null, message: `Scan left to right. A window of ${k} starting at i flips bits i to i+${k - 1}.` }]
  let result = null
  for (let i = 0; i < n; i++) {
    if (i >= k) {
      active ^= flipped[i - k]
      frames.push({ phase: 'expire', activeLine: L('active ^= flipped[i - k]'), i, flipped: [...flipped], bits: effectiveBits(nums, flipped, k), active, count, result: null, message: `Index ${i}: the window that started at ${i - k} no longer covers it, so the flip parity is ${active}.` })
    }
    if (nums[i] !== active) {
      frames.push({ phase: 'scan', activeLine: L('if nums[i] == active'), i, flipped: [...flipped], bits: effectiveBits(nums, flipped, k), active, count, result: null, message: `Index ${i} reads ${nums[i]} with flip parity ${active}, which is already 1. No flip here.` })
      continue
    }
    if (i + k > n) {
      result = -1
      frames.push({ phase: 'impossible', activeLine: L('return -1'), i, flipped: [...flipped], bits: effectiveBits(nums, flipped, k), active, count, result, message: `Index ${i} is 0 but a window of ${k} starting here would run past the end. Return -1.` })
      break
    }
    flipped[i] = 1
    active ^= 1
    count++
    frames.push({ phase: 'flip', activeLine: L('active ^= 1'), i, flipped: [...flipped], bits: effectiveBits(nums, flipped, k), active, count, result: null, message: `Index ${i} is 0 with no pending flip. Flip the window starting at ${i}; ${count} flip${count === 1 ? '' : 's'} so far.` })
  }
  if (result === null) {
    result = count
    frames.push({ phase: 'done', activeLine: L('return count'), i: -1, flipped: [...flipped], bits: effectiveBits(nums, flipped, k), active, count, result, message: `Every bit is 1. Minimum flips: ${count}.` })
  }
  return { input, result, frames }
}

export const code = `def minKBitFlips(nums, k):
    n = len(nums)
    flipped = [0] * n
    active = 0
    count = 0
    for i in range(n):
        if i >= k:
            active ^= flipped[i - k]
        if nums[i] == active:
            if i + k > n:
                return -1
            flipped[i] = 1
            active ^= 1
            count += 1
    return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
