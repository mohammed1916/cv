export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('nums has 1 to 20 integers from 1 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > 100) throw new Error('k is an integer from 1 to 100.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const present = new Set(nums)
  const frames = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('present'), at: -1, m: k, message: `Store the ${present.size} distinct values of nums.` })
  let m = k
  frames.push({ pythonLine: 3, phase: 'start', activeLine: L('candidate'), at: -1, m, message: `First multiple to test is ${m}.` })
  while (present.has(m)) {
    frames.push({ pythonLine: 4, phase: 'check', activeLine: L('while'), at: nums.indexOf(m), m, ok: true, message: `${m} appears in nums, so try the next multiple.` })
    m += k
    frames.push({ pythonLine: 5, phase: 'step', activeLine: L('add k'), at: -1, m, message: `Candidate becomes ${m}.` })
  }
  frames.push({ pythonLine: 4, phase: 'check', activeLine: L('while'), at: -1, m, ok: false, message: `${m} is missing from nums.` })
  frames.push({ pythonLine: 6, phase: 'done', activeLine: L('return'), at: -1, m, ok: true, message: `The smallest missing multiple is ${m}.` })
  return { input: { nums, k }, result: m, frames }
}

export const code = `smallest positive multiple of k missing from nums
  present = the set of values in nums
  candidate = k
  while candidate is in present
    candidate = candidate + k
  return candidate`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_missing_multiple(nums, k):
    present = set(nums)
    m = k
    while m in present:
        m += k
    return m
`
