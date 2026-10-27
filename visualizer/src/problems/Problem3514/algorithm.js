export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, such as {"nums":[1,2,3]}.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must hold 1 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 31)) throw new Error('Each entry is an integer from 1 to 31.')
  return { nums }
}

export const code = `count unique XOR triplet values of a list
  set values to the distinct numbers in nums
  set pairs to every XOR of two values, including a value with itself
  set triples to every XOR of a pair with a value
  return the number of distinct triples`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums }) {
  const values = [...new Set(nums)].sort((a, b) => a - b)
  const frames = [{ phase: 'values', activeLine: L('set values to the distinct'), values, pairs: 0, triples: 0, message: `Distinct values: ${values.join(', ')}.` }]
  const pairs = new Set()
  for (const a of values) for (const b of values) pairs.add(a ^ b)
  frames.push({ phase: 'pairs', activeLine: L('set pairs to every XOR'), values, pairs: pairs.size, triples: 0, message: `${pairs.size} distinct XOR values come from two values, including 0.` })
  const triples = new Set()
  for (const p of pairs) for (const c of values) triples.add(p ^ c)
  frames.push({ phase: 'triples', activeLine: L('set triples to every XOR'), values, pairs: pairs.size, triples: triples.size, message: `Combining each pair value with each value gives ${triples.size} distinct triple values.` })
  frames.push({ phase: 'done', activeLine: L('return the number of distinct'), values, pairs: pairs.size, triples: triples.size, message: `Unique XOR triplet values: ${triples.size}.` })
  return { input: { nums }, values, result: triples.size, frames }
}

export const python = `def count_unique_xor_triplets_ii(nums):
    values = sorted(set(nums))
    pairs = {a ^ b for a in values for b in values}
    triples = {p ^ c for p in pairs for c in values}
    return len(triples)
`
