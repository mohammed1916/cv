export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object such as {"nums":[1,4]}.')
  const { nums } = data
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 entries in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 63)) throw new Error('Values are integers from 0 to 63 in this visualization.')
  return { nums }
}

export function buildTrace({ nums }) {
  let beauty = 0
  const frames = [{ phase: 'start', activeLine: L('set beauty to 0'), index: -1, beauty, message: 'The effective value of a triple (i, j, k) is (nums[i] AND nums[j]) OR nums[k]. Build the xor over all triples.' }]
  nums.forEach((value, index) => {
    beauty ^= value
    frames.push({ phase: 'fold', activeLine: L('set beauty to beauty xor value'), index, beauty, message: `Xor in ${value}. Running beauty: ${beauty}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return beauty'), index: -1, beauty, message: `Xor-beauty: ${beauty}.` })
  return { input: { nums }, result: beauty, frames }
}

export const code = `xor-beauty of an array:
  set beauty to 0
  for each value in nums do
    set beauty to beauty xor value
  the effective values of triples that repeat an index cancel in pairs
  the triples that remain each contribute one value of nums
  return beauty`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def xor_beauty(nums):
    beauty = 0
    for v in nums:
        beauty ^= v
    return beauty
`
