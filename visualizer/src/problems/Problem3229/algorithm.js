export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Array.isArray(data.target)) throw new Error('Use an object with arrays nums and target, for example {"nums":[3,5,1,2],"target":[4,6,2,4]}.')
  if (data.nums.length !== data.target.length) throw new Error('nums and target must have the same length.')
  if (data.nums.length < 1 || data.nums.length > 10) throw new Error('Arrays must have 1 to 10 entries.')
  const valid = v => Number.isInteger(v) && v >= 1 && v <= 20
  if (!data.nums.every(valid) || !data.target.every(valid)) throw new Error('Values must be integers from 1 to 20.')
  return { nums: data.nums, target: data.target }
}

export function buildTrace(input) {
  const { nums, target } = input
  const diff = nums.map((v, i) => target[i] - v)
  let rises = 0
  let falls = 0
  let prevUp = 0
  let prevDown = 0
  const frames = [{ phase: 'start', activeLine: L('set rises to 0'), cursor: -1, diff, rises, falls, message: 'Work with the required change at each index: target minus nums. Positive and negative needs are counted separately.' }]
  for (let i = 0; i < diff.length; i++) {
    const d = diff[i]
    const up = Math.max(d, 0)
    const down = Math.max(-d, 0)
    const addRise = Math.max(0, up - prevUp)
    const addFall = Math.max(0, down - prevDown)
    rises += addRise
    falls += addFall
    prevUp = up
    prevDown = down
    frames.push({ phase: 'step', activeLine: L('to rises'), cursor: i, diff, rises, falls, message: `Index ${i} needs ${d}. It adds ${addRise} increments and ${addFall} decrements.` })
  }
  const result = rises + falls
  frames.push({ phase: 'done', activeLine: L('return rises plus falls'), cursor: -1, diff, rises, falls, message: `Total operations: ${rises} increments plus ${falls} decrements, which is ${result}.` })
  return { input, result, frames }
}

export const code = `minimum operations to make nums equal target
  set rises to 0 and falls to 0
  set previous up and previous down to 0
  for each index i
    set d to target[i] minus nums[i]
    set up to d if d is positive, otherwise 0
    set down to minus d if d is negative, otherwise 0
    add the amount up exceeds previous up by to rises
    add the amount down exceeds previous down by to falls
    set previous up to up and previous down to down
  return rises plus falls`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums, target):
    rises = 0
    falls = 0
    prev_up = 0
    prev_down = 0
    for a, b in zip(nums, target):
        d = b - a
        up = max(d, 0)
        down = max(-d, 0)
        rises += max(0, up - prev_up)
        falls += max(0, down - prev_down)
        prev_up, prev_down = up, down
    return rises + falls
`
