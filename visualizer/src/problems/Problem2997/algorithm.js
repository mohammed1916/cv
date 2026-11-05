export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Number.isInteger(obj.k)) throw new Error('Use a JSON object with a nums array and an integer k.')
  const { nums, k } = obj
  if (nums.length < 1 || nums.length > 20) throw new Error('nums must have 1 to 20 entries (visualization cap).')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 15)) throw new Error('Each value is an integer from 0 to 15 (visualization cap).')
  if (k < 0 || k > 15) throw new Error('k is an integer from 0 to 15 (visualization cap).')
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  let total = 0
  const frames = [{ pythonLine: 2, phase: 'start', activeLine: L('let total = 0'), total, diff: null, flips: 0, message: 'Start with total XOR 0.' }]
  for (const value of nums) {
    total ^= value
    frames.push({ pythonLine: 4, phase: 'fold', activeLine: L('total ^= value'), total, diff: null, flips: 0, message: `XOR in ${value}: total is now ${total}.` })
  }
  let diff = total ^ k
  frames.push({ pythonLine: 5, phase: 'diff', activeLine: L('let diff = total ^ k'), total, diff, flips: 0, message: `${total} xor ${k} = ${diff}. Each set bit needs one flip.` })
  let flips = 0
  while (diff !== 0) {
    diff &= diff - 1
    flips++
    frames.push({ pythonLine: 8, phase: 'bit', activeLine: L('diff &= diff - 1'), total, diff, flips, message: `Fixed one bit. Flips so far: ${flips}.` })
  }
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return flips'), total, diff, flips, message: `Minimum flips: ${flips}.` })
  return { input, nums, k, result: flips, frames }
}

export const code = `function minOperations(nums, k) {
  let total = 0
  for (const value of nums) {
    total ^= value
  }
  let diff = total ^ k
  let flips = 0
  while (diff !== 0) {
    diff &= diff - 1
    flips++
  }
  return flips
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums, k):
    total = 0
    for value in nums:
        total ^= value
    diff = total ^ k
    flips = 0
    while diff:
        diff &= diff - 1
        flips += 1
    return flips
`
