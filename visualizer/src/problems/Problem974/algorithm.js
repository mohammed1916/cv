// Two prefix sums give a subarray sum divisible by k exactly when they have the same remainder mod k.
// Count how many earlier prefixes had each remainder, and add that count at every step.
export const code = String.raw`function countDivisibleSubarrays(nums, k) {
  const count = new Array(k).fill(0); // how many earlier prefixes had each remainder
  count[0] = 1; // the empty prefix has remainder 0
  let remainder = 0;
  let answer = 0;
  for (const x of nums) {
    remainder = (((remainder + x) % k) + k) % k; // keep the remainder in 0..k-1 even for negative values
    answer += count[remainder]; // each earlier prefix with this remainder ends a valid subarray here
    count[remainder] += 1;
  }
  return answer;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def count_divisible_subarrays(nums, k):
    count = [0] * k  # how many earlier prefixes had each remainder
    count[0] = 1  # the empty prefix has remainder 0
    remainder = 0
    answer = 0
    for x in nums:
        remainder = (remainder + x) % k  # Python keeps the remainder in 0..k-1 even for negative values
        answer += count[remainder]  # each earlier prefix with this remainder ends a valid subarray here
        count[remainder] += 1
    return answer`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'scan', label: 'Prefix remainders', description: 'Track the running remainder and how often each remainder has appeared.' },
  { id: 'done', label: 'Total', description: 'The number of subarrays whose sum is divisible by k.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input && input.nums
  const k = input && input.k
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use nums: a list of 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || Math.abs(v) > 50)) throw new Error('Values must be integers from -50 to 50.')
  if (!Number.isInteger(k) || k < 2 || k > 12) throw new Error('k must be an integer from 2 to 12.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const count = new Array(k).fill(0)
  count[0] = 1
  let remainder = 0
  let answer = 0
  const prefixes = [0]
  const frames = []
  for (let index = 0; index < nums.length; index++) {
    const x = nums[index]
    remainder = (((remainder + x) % k) + k) % k
    const added = count[remainder]
    answer += added
    count[remainder] += 1
    prefixes.push(remainder)
    frames.push({
      phase: 'scan', activeLine: L('answer += count[remainder]'), pythonLine: PY('answer += count[remainder]'),
      index, value: x, remainder, added, answer, count: [...count], prefixes: [...prefixes],
      message: `Prefix after ${index + 1} value${index ? 's' : ''} has remainder ${remainder}. ${added} earlier prefix${added === 1 ? '' : 'es'} share it, so ${added} new subarray${added === 1 ? '' : 's'} end here.`,
    })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: PY('return answer'), index: null, value: null, remainder: null, added: 0, answer, count: [...count], prefixes: [...prefixes], message: `${answer} subarrays have a sum divisible by ${k}.` })
  return { input: { nums, k }, result: answer, frames }
}
