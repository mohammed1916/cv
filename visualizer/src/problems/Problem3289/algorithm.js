export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with a nums array.')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 4 || nums.length > 30) throw new Error('nums has 4 to 30 entries.')
  const n = nums.length - 2
  const counts = Array(n).fill(0)
  for (const v of nums) {
    if (!Number.isInteger(v) || v < 0 || v > n - 1) throw new Error(`Values are integers from 0 to ${n - 1}.`)
    counts[v]++
  }
  if (counts.some(c => c < 1 || c > 2) || counts.filter(c => c === 2).length !== 2) {
    throw new Error('Every value from 0 to n-1 must appear, and exactly two values must appear twice.')
  }
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const seen = new Set()
  const duplicates = []
  const frames = []
  const frame = (phase, line, index, message) => frames.push({ phase, activeLine: line, index, duplicates: [...duplicates], message })
  frame('start', L('set seen to an empty set'), -1, 'Scan the list once and remember every value seen so far.')
  nums.forEach((value, index) => {
    if (seen.has(value)) {
      duplicates.push(value)
      frame('repeat', L('add value to duplicates'), index, `${value} was seen before, so it is one of the sneaky numbers.`)
    } else {
      seen.add(value)
      frame('scan', L('add value to seen'), index, `${value} is new, so remember it.`)
    }
  })
  duplicates.sort((a, b) => a - b)
  frame('sort', L('sort duplicates'), -1, `The two numbers are ${duplicates.join(' and ')}.`)
  frame('done', L('return duplicates'), -1, 'Report the two duplicates in ascending order.')
  return { input, result: duplicates, frames }
}

export const code = `find the two numbers that appear twice
  set seen to an empty set and duplicates to an empty list
  for each value in nums, in order, do
    if value is already in seen then add value to duplicates
    otherwise add value to seen
  sort duplicates in ascending order
  return duplicates`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def get_sneaky_numbers(nums):
    seen = set()
    duplicates = []
    for value in nums:
        if value in seen:
            duplicates.append(value)
        else:
            seen.add(value)
    duplicates.sort()
    return duplicates
`
