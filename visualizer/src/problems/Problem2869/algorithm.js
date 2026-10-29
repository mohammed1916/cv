export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be JSON, for example {"nums":[3,1,5,4,2],"k":2}.')
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Number.isInteger(data.k)) throw new Error('Use an object with a nums array and an integer k.')
  const { nums, k } = data
  if (nums.length < 1 || nums.length > 50) throw new Error('nums must have 1 to 50 elements.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each value in nums must be an integer from 1 to 50.')
  if (k < 1 || k > nums.length) throw new Error('k must be between 1 and the length of nums.')
  const need = new Set(Array.from({ length: k }, (_, i) => i + 1))
  for (const v of nums) need.delete(v)
  if (need.size > 0) throw new Error(`nums must contain every value from 1 to ${k}.`)
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const frames = []
  const need = new Set(Array.from({ length: k }, (_, i) => i + 1))
  let ops = 0
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, cursor: -1, removed: null, ops, need: [...need].sort((a, b) => a - b), result: null, ...extra,
  })

  push('setup', 2, 2, `Collect the values 1 to ${k}. Nothing has been taken yet.`)
  push('setup', 3, 3, 'Set the operation count to 0.')
  for (let p = nums.length - 1; p >= 0; p--) {
    const x = nums[p]
    ops += 1
    push('take', 4, 4, `Take the last unremoved element at index ${p}, which is ${x}.`, { cursor: p, removed: x })
    push('take', 5, 5, `Operations so far: ${ops}.`, { cursor: p, removed: x })
    need.delete(x)
    push('take', 6, 6, `${x} is ${x <= k ? 'one of the needed values' : 'not needed'}. Still needed: ${[...need].sort((a, b) => a - b).join(', ') || 'none'}.`, { cursor: p, removed: x })
    push('check', 7, 7, need.size === 0 ? 'Every value from 1 to k has been collected.' : 'Some values are still missing.', { cursor: p, removed: x })
    if (need.size === 0) {
      push('done', 8, 8, `Return ${ops} operations.`, { result: ops })
      return { input, result: ops, frames }
    }
  }
  push('done', 8, 9, `Return ${ops} operations.`, { result: ops })
  return { input, result: ops, frames }
}

export const code = `minimum operations to collect elements 1 to k
  set need to the values 1 through k
  set ops to 0
  for each element x from the end of nums
    add one to ops
    remove x from need
    if need is empty then return ops
  return ops`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minOperations(nums, k):
    need = set(range(1, k + 1))
    ops = 0
    for x in reversed(nums):
        ops += 1
        need.discard(x)
        if not need:
            return ops
    return ops
`
