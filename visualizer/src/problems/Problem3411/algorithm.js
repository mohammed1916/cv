export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with a "nums" array.')
  const { nums } = input
  if (nums.length < 2 || nums.length > 30) throw new Error('nums holds 2 to 30 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 12)) throw new Error('Each number is an integer from 1 to 12.')
  return { nums }
}

// BigInt keeps the product exact; with 30 values up to 12 it exceeds 2^53.
function gcd(a, b) {
  let x = a
  let y = b
  while (y !== 0n) [x, y] = [y, x % y]
  return x
}

export function buildTrace(input) {
  const { nums } = input
  const frames = [{ phase: 'start', activeLine: L('set best to zero'), start: -1, end: -1, product: '1', gcd: '0', lcm: '1', equal: false, best: 0, message: 'Try every subarray, extending it one value at a time.' }]
  let best = 0
  let bestRange = null
  for (let start = 0; start < nums.length; start++) {
    let product = 1n
    let g = 0n
    let l = 1n
    for (let end = start; end < nums.length; end++) {
      const x = BigInt(nums[end])
      product *= x
      g = gcd(g, x)
      l = (l * x) / gcd(l, x)
      const equal = product === g * l
      if (equal && end - start + 1 > best) { best = end - start + 1; bestRange = [start, end] }
      frames.push({ phase: 'extend', activeLine: L('multiply product by'), start, end, product: product.toString(), gcd: g.toString(), lcm: l.toString(), equal, best, message: `Subarray ${start} to ${end} has product ${product} and gcd times lcm ${g * l}. ${equal ? 'They match.' : 'They differ.'}` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), start: bestRange ? bestRange[0] : -1, end: bestRange ? bestRange[1] : -1, product: '', gcd: '', lcm: '', equal: true, best, message: `The longest subarray with equal products has length ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest subarray whose product equals its lcm times its gcd
  set best to zero
  for each start index
    set product to one, gcd to zero and lcm to one
    for each end index from start to the last index
      multiply product by the value at end
      update gcd and lcm with the value at end
      if product equals gcd times lcm then
        keep the length if it beats best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import gcd

def max_equal_product_length(nums):
    best = 0
    for start in range(len(nums)):
        product = 1
        g = 0
        lcm = 1
        for end in range(start, len(nums)):
            value = nums[end]
            product *= value
            g = gcd(g, value)
            lcm = lcm * value // gcd(lcm, value)
            if product == g * lcm:
                best = max(best, end - start + 1)
    return best
`
