export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object such as {"nums":[1,2,1,3]}.')
  const { nums } = data
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 entries in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 50)) throw new Error('Values are integers from 1 to 50 in this visualization.')
  return { nums }
}

export function buildTrace({ nums }) {
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1)
  const frames = [{ phase: 'count', activeLine: L('count how often each value appears'), value: null, counts: Object.fromEntries(counts), result: 0, message: `Counted ${counts.size} distinct values.` }]
  let result = 0
  for (const [value, count] of counts) {
    if (count === 2) {
      result ^= value
      frames.push({ phase: 'fold', activeLine: L('xor value into result'), value, counts: Object.fromEntries(counts), result, message: `${value} appears twice, so xor it in. Result: ${result}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if count equals 2'), value, counts: Object.fromEntries(counts), result, message: `${value} appears ${count} time${count === 1 ? '' : 's'}, so it is skipped.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return result'), value: null, counts: Object.fromEntries(counts), result, message: `XOR of values that appear twice: ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `xor of numbers that appear twice:
  count how often each value appears
  set result to 0
  for each distinct value in the counts do
    if count equals 2 then
      xor value into result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def xor_of_twice(nums):
    counts = {}
    for v in nums:
        counts[v] = counts.get(v, 0) + 1
    result = 0
    for v in counts:
        if counts[v] == 2:
            result ^= v
    return result
`
