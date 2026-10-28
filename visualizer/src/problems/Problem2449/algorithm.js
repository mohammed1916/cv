export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with nums and target.')
  const { nums, target } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6) throw new Error('nums must have 1 to 6 entries.')
  if (!Array.isArray(target) || target.length !== nums.length) throw new Error('target must match nums in length.')
  const all = [...nums, ...target]
  if (all.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Values are integers from 1 to 20.')
  const sum = a => a.reduce((x, y) => x + y, 0)
  if (sum(nums) !== sum(target)) throw new Error('nums and target must have the same sum.')
  const odd = a => a.filter(v => v % 2 === 1).length
  if (odd(nums) !== odd(target)) throw new Error('nums and target must have the same number of odd values.')
  return { nums, target }
}

export function buildTrace(input) {
  const { nums, target } = input
  const oddN = nums.filter(v => v % 2 === 1).sort((a, b) => a - b)
  const oddT = target.filter(v => v % 2 === 1).sort((a, b) => a - b)
  const evenN = nums.filter(v => v % 2 === 0).sort((a, b) => a - b)
  const evenT = target.filter(v => v % 2 === 0).sort((a, b) => a - b)
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('split nums and target into odd values'), total: 0, pair: null, message: 'Operations keep each value’s parity, so odd and even values are matched separately.' }]
  for (const [a, b] of [...oddN.map((v, i) => [v, oddT[i]]), ...evenN.map((v, i) => [v, evenT[i]])]) {
    total += Math.abs(a - b)
    frames.push({ phase: 'pair', activeLine: L('add the absolute difference'), total, pair: [a, b], message: `Pair ${a} with ${b}: difference ${Math.abs(a - b)}. Total ${total}.` })
  }
  const result = total / 4
  frames.push({ phase: 'done', activeLine: L('return the total divided by four'), total, pair: null, message: `Each operation reduces the total difference by at most four: ${result} operations.` })
  return { input, result, frames }
}

export const code = `minimum number of operations to make the arrays similar:
  split nums and target into odd values and even values, each sorted
  set total to zero
  for each matched pair of sorted odd values, and then each matched pair of sorted even values
    add the absolute difference of the pair to total
  return the total divided by four`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_similar_operations(nums, target):
    odd_n = sorted(v for v in nums if v % 2 == 1)
    odd_t = sorted(v for v in target if v % 2 == 1)
    even_n = sorted(v for v in nums if v % 2 == 0)
    even_t = sorted(v for v in target if v % 2 == 0)
    total = sum(abs(a - b) for a, b in zip(odd_n, odd_t))
    total += sum(abs(a - b) for a, b in zip(even_n, even_t))
    return total // 4
`
