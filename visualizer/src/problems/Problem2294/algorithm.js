export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums needs 1 to 12 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Values are integers from 0 to 100.')
  if (!Number.isInteger(k) || k < 0 || k > 100) throw new Error('k is an integer from 0 to 100.')
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const sorted = [...nums].sort((a, b) => a - b)
  let groups = 1
  let start = sorted[0]
  const frames = [{ phase: 'start', activeLine: L('set groups to 1'), value: sorted[0], groups, start, message: `Start the first group at ${start}.` }]
  for (let i = 1; i < sorted.length; i++) {
    const value = sorted[i]
    if (value - start > k) {
      groups += 1
      start = value
      frames.push({ phase: 'open', activeLine: L('open a new group'), value, groups, start, message: `${value} is more than ${k} above the group start; open group ${groups} at ${value}.` })
    } else {
      frames.push({ phase: 'join', activeLine: L('add value to the current group'), value, groups, start, message: `${value} is within ${k} of ${start}; it joins the current group.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return groups'), value: -1, groups, start, message: `${groups} groups are needed.` })
  return { input, result: groups, frames }
}

export const code = `minimum groups where each group's largest minus smallest is at most k:
  sort the values from smallest to largest
  set groups to 1 and start to the smallest value
  for each later value in sorted order
    if value minus start is greater than k then
      open a new group and set start to value
    otherwise add value to the current group
  return groups`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def partition_array_by_difference(nums, k):
    values = sorted(nums)
    groups = 1
    start = values[0]
    for value in values[1:]:
        if value - start > k:
            groups += 1
            start = value
    return groups
`
