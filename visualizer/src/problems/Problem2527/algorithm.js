export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object such as {"nums":[1,4]}.')
  const { nums } = data
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 entries in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 63)) throw new Error('Values are integers from 0 to 63 in this visualization.')
  return { nums }
}

export const code = `function xorBeauty(nums) {
  let beauty = 0
  for (const value of nums) {
    beauty ^= value
  }
  return beauty
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums }) {
  let beauty = 0
  const frames = [{ phase: 'start', activeLine: L('let beauty = 0'), pythonLine: 2, index: -1, beauty, message: 'For one bit, the triples (i, j, k) pair up so that only the parity of each bit survives. The xor-beauty is the xor of every element.' }]
  nums.forEach((value, index) => {
    beauty ^= value
    frames.push({ phase: 'fold', activeLine: L('beauty ^= value'), pythonLine: 4, index, beauty, message: `Xor in ${value}. Running beauty: ${beauty}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return beauty'), pythonLine: 5, index: -1, beauty, message: `Xor-beauty: ${beauty}.` })
  return { input: { nums }, result: beauty, frames }
}

export const python = `def xor_beauty(nums):
    beauty = 0
    for v in nums:
        beauty ^= v
    return beauty
`
