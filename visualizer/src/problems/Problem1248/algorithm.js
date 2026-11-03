// Independently written teaching model. The sample arrays are invented for this visualizer.
export const phases = [
  { id: 'start', label: 'Start', description: 'Record the empty prefix, which has zero odd numbers so far.' },
  { id: 'inspect', label: 'Look back', description: 'Find earlier prefixes that leave exactly k odd numbers between them and this position.' },
  { id: 'update', label: 'Record', description: 'Add the current odd-count prefix so later positions can use it.' },
  { id: 'done', label: 'Result', description: 'Report how many subarrays have exactly k odd numbers.' },
]

export const inputLabel = 'JSON object with nums (1 to 20 positive integers up to 1000) and k (1 to the length of nums)'
export const complexity = 'O(n) time and O(n) space for the prefix counts. The visualizer caps the array at 20 values.'
export const examples = [
  { label: 'Two odds', input: '{"nums":[1,1,2,1,1],"k":3}' },
  { label: 'No odds', input: '{"nums":[2,4,6],"k":1}' },
  { label: 'Alternating', input: '{"nums":[1,2,1,2,1],"k":2}' },
]

export const code = `function countNiceSubarrays(nums, k):
  seen[0] = 1
  odd = 0, answer = 0
  for x in nums:
    odd += x mod 2
    answer += seen[odd - k]
    seen[odd] += 1
  return answer`

export const python = `from collections import defaultdict

def number_of_subarrays(nums, k):
    seen = defaultdict(int)
    seen[0] = 1
    odd = 0
    answer = 0
    for x in nums:
        odd += x % 2
        answer += seen[odd - k]
        seen[odd] += 1
    return answer`

const at = (source, key) => {
  const index = source.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing solution line: ${key}`)
  return index + 1
}
const CODE_LINE = key => at(code, key)
const PY_LINE = key => at(python, key)

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter a JSON object with nums and k.') }
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums needs 1 to 20 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Each value in nums must be an integer from 1 to 1000.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be an integer from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const seen = new Map([[0, 1]])
  let odd = 0
  let answer = 0
  const snapshot = () => [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([count, times]) => ({ count, times }))
  const push = (phase, key, pyKey, message, index, extra = {}) => frames.push({
    phase, activeLine: CODE_LINE(key), pythonLine: PY_LINE(pyKey), message,
    nums, k, index, odd, answer, seen: snapshot(), ...extra,
  })

  push('start', 'seen[0] = 1', 'seen[0] = 1', `The empty prefix has 0 odd numbers, so seen counts it once. The target is ${k} odd numbers.`, -1)
  for (let i = 0; i < nums.length; i++) {
    odd += nums[i] % 2
    const need = odd - k
    const found = seen.get(need) ?? 0
    answer += found
    push('inspect', 'odd += x mod 2', 'odd += x % 2', `Value ${nums[i]} (${nums[i] % 2 ? 'odd' : 'even'}) brings the prefix to ${odd} odd numbers. Earlier prefixes with ${need} odd numbers give ${found} subarray${found === 1 ? '' : 's'} ending here.`, i, { need, found })
    push('inspect', 'answer += seen', 'answer += seen[odd - k]', `Answer is now ${answer}.`, i, { need, found })
    seen.set(odd, (seen.get(odd) ?? 0) + 1)
    push('update', 'seen[odd] += 1', 'seen[odd] += 1', `The prefix with ${odd} odd numbers is recorded for later positions.`, i)
  }

  push('done', 'return answer', 'return answer', `There are ${answer} subarray${answer === 1 ? '' : 's'} with exactly ${k} odd numbers.`, nums.length)
  return { input: { nums, k }, result: answer, frames }
}
