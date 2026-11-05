export const phases = [
  { id: 'start', label: 'Pairs', description: 'Consider every ordered pair of different indices.' },
  { id: 'check', label: 'Concatenate', description: 'Join the two strings in order; the pair counts when the result equals the target.' },
  { id: 'done', label: 'Result', description: 'Return how many ordered pairs match.' },
]

export const code = `function countPairs(nums, target) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i !== j && nums[i] + nums[j] === target) count++
    }
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_pairs(nums, target):
    count = 0
    for i in range(len(nums)):
        for j in range(len(nums)):
            if i != j and nums[i] + nums[j] == target:
                count += 1
    return count
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"nums":["7","77"],"target":"777"}.') }
  const { nums, target } = obj || {}
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 30 || !nums.every(s => typeof s === 'string' && /^[0-9]{1,8}$/.test(s))) {
    throw new Error('nums must have 2 to 30 digit strings of length 1 to 8.')
  }
  if (typeof target !== 'string' || !/^[0-9]{2,16}$/.test(target)) throw new Error('target must be a digit string of length 2 to 16.')
  return { nums, target }
}

export function buildTrace({ nums, target }) {
  const frames = []
  let count = 0
  const add = (phase, c, p, message, i, j, joined) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nums, target, i, j, joined, count },
  })
  add('start', 'let count = 0', 'count = 0', `Target ${target}; ${nums.length * (nums.length - 1)} ordered pairs to check.`, -1, -1, '')
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i === j) continue
      const joined = nums[i] + nums[j]
      if (joined === target) count++
      add('check', 'if (i !== j', 'if i != j', joined === target ? `${nums[i]} + ${nums[j]} = ${joined}, matching the target.` : `${nums[i]} + ${nums[j]} = ${joined}, not the target.`, i, j, joined)
    }
  }
  add('done', 'return count', 'return count', `${count} ordered pair(s) match.`, -1, -1, '')
  return { input: { nums, target }, result: count, frames }
}
