export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 12) throw new Error('Use a JSON array of 3 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Values are integers from 1 to 10.')
  return nums
}

export function buildTrace(nums) {
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1)
  const n = nums.length
  const frames = [{ phase: 'count', activeLine: L('counts = how many'), value: null, before: 0, group: 0, after: n, total: 0, message: `Count how many times each value appears (${counts.size} distinct values).` }]
  let total = 0
  let before = 0
  for (const [value, c] of counts) {
    const after = n - before - c
    const added = before * c * after
    total += added
    frames.push({ phase: 'group', activeLine: L('total = total + before'), value, before, group: c, after, total, message: `Value ${value} has ${c} copies; ${before} entries come before its group and ${after} after. That gives ${added} triplets with it in the middle.` })
    before += c
  }
  frames.push({ phase: 'done', activeLine: L('return total'), value: null, before: n, group: 0, after: 0, total, message: `Unequal triplets: ${total}.` })
  return { input: nums, result: total, frames }
}

export const code = `number of triplets with three different values
  counts = how many times each value appears
  total = 0
  before = 0
  n = length of nums
  for each count c in counts
    after = n - before - c
    total = total + before * c * after
    before = before + c
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def count_unequal_triplets(nums):
    n = len(nums)
    total = 0
    before = 0
    for c in Counter(nums).values():
        after = n - before - c
        total += before * c * after
        before += c
    return total
`
