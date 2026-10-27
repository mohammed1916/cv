export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object such as {"nums":[3,2,4,6]}.')
  const { nums } = data
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 entries.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 15)) throw new Error('Values are integers from 0 to 15 in this visualization.')
  return { nums }
}

export function buildTrace({ nums }) {
  let result = 0
  const frames = [{ phase: 'start', activeLine: L('set result to 0'), index: -1, result, message: 'Start with 0. Each operation can only clear bits, so every bit of the answer must already appear in some number.' }]
  nums.forEach((value, index) => {
    result |= value
    frames.push({ phase: 'merge', activeLine: L('set result to result or value'), index, result, message: `Fold in ${value}. The bits kept so far are ${result}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return result'), index: -1, result, message: `Maximum XOR: ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `maximum xor after operations:
  set result to 0
  for each value in nums do
    set result to result or value
  a bit set in any number can be kept, because clearing bits never adds one
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_xor_after_ops(nums):
    result = 0
    for v in nums:
        result |= v
    return result
`
