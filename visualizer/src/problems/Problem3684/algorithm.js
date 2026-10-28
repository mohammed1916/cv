export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with "nums" and "k".')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums must be an array of 1 to 20 positive integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Each nums value must be an integer from 1 to 1000000000.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be an integer from 1 to nums.length.')
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const frames = []
  const distinct = [...new Set(nums)]
  frames.push({ phase: 'start', activeLine: L('collect the distinct values'), chosen: [], message: `There are ${distinct.length} distinct values in nums.` })
  const sorted = [...distinct].sort((a, b) => b - a)
  frames.push({ phase: 'sort', activeLine: L('sort the distinct values'), chosen: [], message: `Sorted from largest: ${sorted.join(', ')}.` })
  const result = []
  for (const value of sorted) {
    if (result.length === k) break
    result.push(value)
    frames.push({ phase: 'take', activeLine: L('add the value to result'), chosen: [...result], message: `Take ${value}. ${result.length} of at most ${k} chosen.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), chosen: [...result], message: `Result: [${result.join(', ')}], sum ${result.reduce((a, b) => a + b, 0)}.` })
  return { input: { nums, k }, result, frames }
}

export const code = `largest distinct sum (nums, k):
  collect the distinct values of nums
  sort the distinct values from largest to smallest
  set result to an empty list
  for each value in the sorted order do
    if the length of result is k then stop the loop
    add the value to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_distinct_sum(nums, k):
    distinct = sorted(set(nums), reverse=True)
    result = []
    for value in distinct:
        if len(result) == k:
            break
        result.append(value)
    return result
`
