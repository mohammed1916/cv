export const code = [
  'best starts at zero',
  'for each left end l',
  'lo and hi start at nums[l], x at zero',
  'extend r and fold nums[r] into lo, hi and x',
  'if hi minus lo exceeds k then stop this left end',
  'otherwise best takes the larger of best and x',
  'return best',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= 0 && v < 64)) throw new Error('nums has 1 to 12 integers from 0 to 63.')
  if (!Number.isInteger(k) || k < 0 || k > 63) throw new Error('k is an integer from 0 to 63.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  let best = 0
  frames.push({ window: null, lo: null, hi: null, x: null, best, phase: 'setup', activeLine: L('best starts'), message: 'Best starts at 0, since every value is non-negative.' })
  for (let l = 0; l < nums.length; l++) {
    let lo = nums[l]
    let hi = nums[l]
    let x = 0
    for (let r = l; r < nums.length; r++) {
      lo = Math.min(lo, nums[r])
      hi = Math.max(hi, nums[r])
      x ^= nums[r]
      frames.push({ window: [l, r], lo, hi, x, best, phase: 'extend', activeLine: L('extend r'), message: `Window ${l} to ${r}: range ${hi - lo}, XOR ${x}.` })
      if (hi - lo > k) {
        frames.push({ window: [l, r], lo, hi, x, best, phase: 'stop', activeLine: L('then stop'), message: `Range ${hi - lo} is above k = ${k}; this start is finished.` })
        break
      }
      best = Math.max(best, x)
      frames.push({ window: [l, r], lo, hi, x, best, phase: 'record', activeLine: L('otherwise best'), message: `Best is now ${best}.` })
    }
  }
  frames.push({ window: null, lo: null, hi: null, x: null, best, phase: 'done', activeLine: L('return best'), message: `Largest allowed XOR is ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const python = `def max_subarray_xor(nums, k):
    best = 0
    for l in range(len(nums)):
        lo = hi = nums[l]
        x = 0
        for r in range(l, len(nums)):
            lo = min(lo, nums[r])
            hi = max(hi, nums[r])
            x ^= nums[r]
            if hi - lo > k:
                break
            best = max(best, x)
    return best`
