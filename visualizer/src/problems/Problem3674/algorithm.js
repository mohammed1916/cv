export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums is a list of 1 to 10 values (the visualization caps it at 10).')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 31)) throw new Error('Each value is an integer from 1 to 31.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const same = nums.every(x => x === nums[0])
  frames.push({ pythonLine: P('if all'), phase: 'check', activeLine: L('if every element'), index: -1, value: null, message: same ? 'Every element already matches.' : 'The elements do not all match yet.' })
  if (same) {
    frames.push({ pythonLine: P('return 0'), phase: 'done', activeLine: L('return 0'), index: -1, value: nums[0], message: 'No operations are needed.' })
    return { input: { nums }, result: 0, frames }
  }
  let common = nums[0]
  for (let i = 1; i < nums.length; i++) {
    common &= nums[i]
    frames.push({ pythonLine: P('common &= x'), phase: 'and', activeLine: L('compute the AND'), index: i, value: common, message: `Running AND through index ${i} is ${common}.` })
  }
  frames.push({ pythonLine: P('return 1'), phase: 'done', activeLine: L('return 1'), index: -1, value: common, message: `One operation on the whole array sets every element to ${common}.` })
  return { input: { nums }, result: 1, frames }
}

export const code = `count the operations needed to make every element equal
if every element already matches the first, return 0
compute the AND of all elements from left to right
one operation on the whole array sets every element to that AND
return 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums):
    if all(x == nums[0] for x in nums):
        return 0
    common = nums[0]
    for x in nums[1:]:
        common &= x
    return 1
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
