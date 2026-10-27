export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Number.isInteger(data.k)) throw new Error('Use an object such as {"nums":[5,10,1,5,2],"k":1}.')
  const { nums, k } = data
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 entries in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 50)) throw new Error('Values are integers from 0 to 50.')
  if (k < 0 || k > 4) throw new Error('k is an integer from 0 to 4 in this visualization.')
  return { nums, k }
}

const setBits = i => i.toString(2).split('').filter(b => b === '1').length

export function buildTrace({ nums, k }) {
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), index: -1, bits: null, total, message: `Add nums[i] for each index i with exactly ${k} set bits in binary.` }]
  nums.forEach((value, index) => {
    const bits = setBits(index)
    const hit = bits === k
    if (hit) total += value
    frames.push({ phase: hit ? 'add' : 'skip', activeLine: L(hit ? 'then add nums[i] to total' : 'if bits equals k'), index, bits, total, message: `Index ${index} (${index.toString(2)}) has ${bits} set bits. ${hit ? `Add ${value}.` : 'Skip it.'}` })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, bits: null, total, message: `Sum: ${total}.` })
  return { input: { nums, k }, result: total, frames }
}

export const code = `sum values at indices with k set bits:
  set total to 0
  for each index i of nums do
    count the set bits of i as bits
    if bits equals k then add nums[i] to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_by_set_bits(nums, k):
    total = 0
    for i in range(len(nums)):
        if bin(i).count('1') == k:
            total += nums[i]
    return total
`
