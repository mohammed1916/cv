// The repeated value fills half the array, so its tally is the first to reach half the length.
export const code = String.raw`function repeatedHalf(nums) {
  const half = nums.length / 2;
  const tally = new Map();
  for (const value of nums) {
    const seen = (tally.get(value) ?? 0) + 1;
    tally.set(value, seen);
    if (seen === half) return value;
  }
  return -1;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def repeated_half(nums):
    half = len(nums) // 2
    tally = {}
    for value in nums:
        seen = tally.get(value, 0) + 1
        tally[value] = seen
        if seen == half:
            return value
    return -1`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'scan', label: 'Tally', description: 'Count each value as it is read.' },
  { id: 'found', label: 'Found', description: 'The first value to reach half the length is the answer.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input && input.nums
  if (!Array.isArray(nums) || nums.length < 4 || nums.length > 20 || nums.length % 2 !== 0) {
    throw new Error('Use nums: an even-length list of 4 to 20 integers.')
  }
  if (nums.some(value => !Number.isInteger(value) || value < 0 || value > 10000)) {
    throw new Error('Values must be integers from 0 to 10000.')
  }
  const half = nums.length / 2
  const counts = new Map()
  for (const value of nums) counts.set(value, (counts.get(value) ?? 0) + 1)
  const repeated = [...counts.values()].filter(count => count > 1)
  if (repeated.length !== 1 || repeated[0] !== half) {
    throw new Error('One value must appear exactly half the length; the other values must each appear once.')
  }
  return { nums }
}

export function buildTrace({ nums }) {
  const half = nums.length / 2
  const tally = new Map()
  const frames = []
  let answer = -1
  nums.some((value, index) => {
    const seen = (tally.get(value) ?? 0) + 1
    tally.set(value, seen)
    const done = seen === half
    frames.push({
      phase: done ? 'found' : 'scan', activeLine: L(done ? 'return value' : 'const seen'), pythonLine: PY(done ? 'return value' : 'seen = tally'),
      index, value, seen, half, tally: [...tally.entries()], answer: done ? value : null,
      message: done ? `${value} has now been seen ${seen} times, which is half of ${nums.length}. It is the answer.`
        : `Read ${value} at index ${index}: its tally is ${seen}.`,
    })
    if (done) answer = value
    return done
  })
  return { input: { nums }, result: answer, frames }
}
