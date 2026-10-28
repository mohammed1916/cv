export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  const { nums } = obj
  if (nums.length < 2 || nums.length > 8) throw new Error('Use 2 to 8 numbers for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('Each number must be an integer from 1 to 100000.')
  return { nums }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  const frames = []
  let best = null
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const g = gcd(nums[i], nums[j])
      // (a * b) / g^2 is exactly (a / g) times (b / g), so no overflow-prone product is needed.
      const strength = (nums[i] / g) * (nums[j] / g)
      if (best === null || strength > best) best = strength
      frames.push({ phase: 'pair', activeLine: L('set strength to'), i, j, g, strength, best, message: `Pair ${nums[i]}, ${nums[j]} has gcd ${g} and strength ${strength}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), i: -1, j: -1, g: null, strength: null, best, message: `Maximum pair strength: ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximize pair strength using gcd(nums)
  set best to nothing
  for each index i from 0 to n-2 do
    for each index j after i do
      set g to the gcd of nums[i] and nums[j]
      set strength to (nums[i] / g) times (nums[j] / g)
      if best is nothing or strength is greater than best then
        set best to strength
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_pair_strength(nums):
    def gcd(a, b):
        while b:
            a, b = b, a % b
        return a

    best = None
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            g = gcd(nums[i], nums[j])
            strength = (nums[i] // g) * (nums[j] // g)
            if best is None or strength > best:
                best = strength
    return best
`
