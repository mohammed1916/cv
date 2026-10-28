const MAX_LENGTH = 12
const MAX_VALUE = 5

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`Use an array of 1 to ${MAX_LENGTH} integers.`)
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return nums
}

export const code = `total count of elements that have the maximum frequency
  set count to an empty map from value to occurrences
  for each value in nums
    add one to count of value
  set top to the largest occurrence count
  set total to 0
  for each value in count
    if count of value equals top then
      add count of value to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(nums) {
  const count = new Map()
  const frames = [{ phase: 'start', index: -1, counts: {}, top: 0, total: 0, activeLine: L('set count to'), message: 'Tally how often each value appears.' }]
  nums.forEach((v, i) => {
    count.set(v, (count.get(v) ?? 0) + 1)
    frames.push({ phase: 'tally', index: i, counts: Object.fromEntries(count), top: 0, total: 0, activeLine: L('add one to count'), message: `Tally ${v}: now ${count.get(v)}.` })
  })
  const top = Math.max(...count.values())
  frames.push({ phase: 'top', index: -1, counts: Object.fromEntries(count), top, total: 0, activeLine: L('set top to'), message: `The largest frequency is ${top}.` })
  let total = 0
  for (const [v, c] of count) {
    if (c === top) total += c
    frames.push({ phase: 'sum', index: -1, counts: Object.fromEntries(count), top, total, activeLine: L('if count of value equals top'), message: c === top ? `Value ${v} has frequency ${c}, so add ${c}; total ${total}.` : `Value ${v} has frequency ${c}, which is not the maximum.` })
  }
  frames.push({ phase: 'done', index: -1, counts: Object.fromEntries(count), top, total, activeLine: L('return total'), message: `Elements with maximum frequency: ${total}.` })
  return { input: nums, result: total, frames }
}

export const python = `def count_max_frequency_elements(nums):
    count = {}
    for v in nums:
        count[v] = count.get(v, 0) + 1
    top = max(count.values())
    total = 0
    for v in count:
        if count[v] == top:
            total += count[v]
    return total
`
