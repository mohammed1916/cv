export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and target.')
  const { nums, target } = input
  if (!Array.isArray(nums) || !Array.isArray(target) || nums.length !== target.length || nums.length < 1 || nums.length > 8) {
    throw new Error('nums and target are equal-length lists of 1 to 8 integers.')
  }
  const ok = v => Number.isInteger(v) && v >= 1 && v <= 4
  if (!nums.every(ok) || !target.every(ok)) throw new Error('Each value is an integer from 1 to 4.')
  return { nums, target }
}

export function buildTrace({ nums, target }) {
  const state = nums.slice()
  const frames = []
  let ops = 0
  const mismatchedAt = () => state.map((v, i) => (v !== target[i] ? i : -1)).filter(i => i >= 0)
  frames.push({ pythonLine: pyAt('ops = 0'), phase: 'start', activeLine: codeAt('count operations'), at: -1, value: null, state: state.slice(), ops, message: 'Start from nums.' })
  for (;;) {
    const bad = mismatchedAt()
    if (bad.length === 0) break
    const x = state[bad[0]]
    frames.push({ pythonLine: pyAt('bad = '), phase: 'pick', activeLine: codeAt('first position still wrong'), at: bad[0], value: x, state: state.slice(), ops, message: `Position ${bad[0]} is still wrong and holds ${x}; choose ${x}.` })
    for (let i = 0; i < state.length; i++) {
      if (state[i] === x) {
        state[i] = target[i]
        frames.push({ pythonLine: pyAt('if nums[i] == x'), phase: 'update', activeLine: codeAt('every position holding x'), at: i, value: x, state: state.slice(), ops, message: `Index ${i} held ${x}; it now takes its target ${target[i]}.` })
      }
    }
    ops++
  }
  frames.push({ pythonLine: pyAt('return ops'), phase: 'done', activeLine: codeAt('return the count'), at: -1, value: null, state: state.slice(), ops, message: `nums matches target after ${ops} operation${ops === 1 ? '' : 's'}.` })
  return { input: { nums, target }, result: ops, frames }
}

export const code = `count operations until nums matches target
  ops is 0
  loop
    bad is every index where nums differs from target
    if bad is empty then return ops
    x is nums at the first index in bad
    for each index holding x, set nums to its target value
    add 1 to ops
  return the count`.split('\n').map((text, index) => ({ line: index + 1, text }))

const codeAt = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums, target):
    nums = list(nums)
    ops = 0
    while True:
        bad = [i for i in range(len(nums)) if nums[i] != target[i]]
        if not bad:
            return ops
        x = nums[bad[0]]
        for i in range(len(nums)):
            if nums[i] == x:
                nums[i] = target[i]
        ops += 1
`
const pyAt = s => python.split('\n').findIndex(l => l.includes(s)) + 1
