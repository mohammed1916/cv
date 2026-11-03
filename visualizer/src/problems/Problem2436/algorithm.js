const MAX_LENGTH = 10
const MAX_VALUE = 60

const P = s => {
  const i = python.split('\n').findIndex(line => line.includes(s))
  if (i < 0) throw new Error(`missing python line: ${s}`)
  return i + 1
}
const L = s => {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`missing pseudocode line: ${s}`)
  return i + 1
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`Use a list of 1 to ${MAX_LENGTH} integers.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 1 to ${MAX_VALUE} in this visualization.`)
  return nums
}

export function buildTrace(nums) {
  const n = nums.length
  const frames = []
  const frame = extra => ({ segments: [], current: -1, candidate: null, count: 0, ...extra })
  const segmentsCopy = segs => segs.map(s => ({ ...s }))

  if (nums.includes(1)) {
    frames.push(frame({ phase: 'impossible', current: nums.indexOf(1), activeLine: L('if some element is one'), pythonLine: P('if 1 in nums'), message: `Element ${nums.indexOf(1)} is 1, and a subarray holding only it has gcd 1. No valid split exists.` }))
    frames.push(frame({ phase: 'done', result: -1, activeLine: L('if some element is one'), pythonLine: P('return -1'), message: 'The answer is -1.' }))
    return { input: nums, result: -1, frames }
  }

  frames.push(frame({ phase: 'start', current: 0, count: 1, segments: [{ start: 0, end: 0, gcd: nums[0] }], activeLine: L('count = 1'), pythonLine: P('count = 1'), message: `Start a subarray at index 0 with gcd ${nums[0]}.` }))
  let count = 1
  let current = nums[0]
  const segments = [{ start: 0, end: 0, gcd: nums[0] }]
  for (let i = 1; i < n; i++) {
    const x = nums[i]
    const g = gcd(current, x)
    const before = current
    if (g > 1) {
      current = g
      segments[segments.length - 1].end = i
      segments[segments.length - 1].gcd = g
      frames.push(frame({ phase: 'extend', current: i, candidate: g, count, segments: segmentsCopy(segments), activeLine: L('if g is above one'), pythonLine: P('if g > 1:'), message: `gcd(${before}, ${x}) is ${g}, above one, so index ${i} joins the subarray.` }))
    } else {
      count++
      current = x
      segments.push({ start: i, end: i, gcd: x })
      frames.push(frame({ phase: 'cut', current: i, candidate: g, count, segments: segmentsCopy(segments), activeLine: L('start a new subarray at x'), pythonLine: P('count += 1'), message: `gcd(${before}, ${x}) is ${g}, not above one, so index ${i} starts subarray number ${count}.` }))
    }
  }
  frames.push(frame({ phase: 'done', count, segments: segmentsCopy(segments), result: count, activeLine: L('return count'), pythonLine: P('return count'), message: `${count} subarray${count === 1 ? '' : 's'} in the greedy split.` }))
  return { input: nums, result: count, frames }
}

export const code = [
  'minimum number of subarrays where each has gcd above one',
  'if some element is one then return -1',
  'count = 1 and current = the first element',
  'for each next element x',
  '  g = gcd of current and x',
  '  if g is above one then extend the subarray and set current to g',
  '  else start a new subarray at x, add one to count, and set current to x',
  'return count',
].map((text, index) => ({ line: index + 1, text }))

export const python = `from math import gcd

def min_subarrays(nums):
    if 1 in nums:
        return -1
    count = 1
    current = nums[0]
    for x in nums[1:]:
        g = gcd(current, x)
        if g > 1:
            current = g
        else:
            count += 1
            current = x
    return count
`
