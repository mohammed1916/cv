// Independently written teaching model. The sample arrays are invented for this visualizer.
export const phases = [
  { id: 'start', label: 'Start', description: 'Begin the running gcd at zero.' },
  { id: 'inspect', label: 'Fold in', description: 'Combine the running gcd with the next value.' },
  { id: 'update', label: 'Euclid step', description: 'Replace the pair with its remainder step until the remainder is zero.' },
  { id: 'done', label: 'Result', description: 'Report whether the running gcd reached one.' },
]

export const inputLabel = 'JSON array of 1 to 12 positive integers up to 1000000000'
export const complexity = 'O(n log M) time for n values up to M, with O(1) extra space. The visualizer caps the array at 12 values.'
export const examples = [
  { label: 'Coprime', input: '[6,10,15]' },
  { label: 'Shared factor', input: '[4,8,12]' },
  { label: 'Single', input: '[7]' },
]

export const code = `function isGoodArray(nums):
  g = 0
  for x in nums:
    g = gcd(g, x)
    if g == 1: return true
  return false

function gcd(a, b):
  while b != 0:
    a, b = b, a mod b
  return a`

export const python = `from math import gcd

def is_good_array(nums):
    g = 0
    for x in nums:
        g = gcd(g, x)
        if g == 1:
            return True
    return False`

const at = (source, key) => {
  const index = source.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing solution line: ${key}`)
  return index + 1
}
const CODE_LINE = key => at(code, key)
const PY_LINE = key => at(python, key)

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Enter a JSON array of integers.') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a JSON array of 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Each value must be an integer from 1 to 1000000000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let g = 0
  const push = (phase, key, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: CODE_LINE(key), pythonLine: PY_LINE(pyKey), message, nums, g, ...extra,
  })

  push('start', 'g = 0', 'g = 0', `The running gcd starts at 0. A good array needs its gcd to be exactly 1.`)
  for (let index = 0; index < nums.length; index++) {
    const x = nums[index]
    let a = g
    let b = x
    push('inspect', 'g = gcd(g, x)', 'g = gcd(g, x)', `Fold in value ${x}: compute gcd(${a}, ${b}).`, { index, a, b })
    while (b !== 0) {
      const remainder = a % b
      a = b
      b = remainder
      push('update', 'a, b = b', 'g = gcd(g, x)', `Euclid step: the pair becomes (${a}, ${b}). ${b === 0 ? 'The remainder is zero, so the last nonzero value is the gcd.' : `The remainder ${b} carries forward.`}`, { index, a, b })
    }
    g = a
    const reached = g === 1
    push('inspect', 'if g == 1', 'if g == 1', `The running gcd is now ${g}. ${reached ? 'It reached 1, so a combination of the values can sum to 1.' : 'It is not 1 yet, so the next value is folded in.'}`, { index, a: g, b: null, reached })
    if (reached) {
      push('done', 'return true', 'return True', `The running gcd reached 1 after value ${index + 1}, so the array is good.`, { index, result: true })
      return { input: nums, result: true, frames }
    }
  }

  push('done', 'return false', 'return False', `The gcd of all values is ${g}, not 1, so no integer combination sums to 1.`, { index: nums.length, result: false })
  return { input: nums, result: false, frames }
}
