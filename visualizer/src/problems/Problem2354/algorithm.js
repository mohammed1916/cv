export function parseInput(text) {
  const input = JSON.parse(text)
  const { nums, k } = input ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 values in nums.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Each value in nums is an integer from 1 to 1000.')
  if (!Number.isInteger(k) || k < 1 || k > 60) throw new Error('k is an integer from 1 to 60.')
  return { nums, k }
}

const setBits = v => {
  let count = 0
  for (let x = v; x > 0; x >>= 1) count += x & 1
  return count
}

export function buildTrace({ nums, k }) {
  const distinct = [...new Set(nums)]
  const tally = Array(32).fill(0)
  const frames = [{ phase: 'start', activeLine: L('count excellent pairs'), tally: [...tally], pair: null, total: 0, message: `Keep the ${distinct.length} distinct value${distinct.length === 1 ? '' : 's'} of nums.` }]
  for (const value of distinct) {
    tally[setBits(value)]++
  }
  frames.push({ phase: 'tally', activeLine: L('tally how many distinct values'), tally: [...tally], pair: null, total: 0, message: 'Group the distinct values by how many bits are set.' })

  let total = 0
  for (let x = 0; x < 32; x++) {
    for (let y = 0; y < 32; y++) {
      if (x + y < k) continue
      if (tally[x] * tally[y] === 0) continue
      total += tally[x] * tally[y]
      frames.push({ phase: 'pair', activeLine: L('add tally[x] times tally[y]'), tally: [...tally], pair: [x, y], total, message: `${tally[x]} value(s) with ${x} bits paired with ${tally[y]} with ${y} bits add ${tally[x] * tally[y]} ordered pairs.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the total'), tally: [...tally], pair: null, total, message: `Excellent pairs: ${total}.` })
  return { input: { nums, k }, result: total, frames }
}

export const code = `count excellent pairs
  keep only the distinct values of nums
  tally how many distinct values have each count of set bits
  set the total to zero
  for each bit count x from 0 to 31
    for each bit count y from 0 to 31
      if x plus y is at least k then
        add tally[x] times tally[y] to the total
  return the total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def excellent_pairs(nums, k):
    distinct = set(nums)
    tally = [0] * 32
    for value in distinct:
        tally[bin(value).count('1')] += 1
    total = 0
    for x in range(32):
        for y in range(32):
            if x + y >= k:
                total += tally[x] * tally[y]
    return total
`
