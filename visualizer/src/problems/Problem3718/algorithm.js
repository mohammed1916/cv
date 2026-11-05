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
  frames.push({ pythonLine: P('present = set'), phase: 'start', activeLine: L('const present'), at: -1, m: k, message: `Store the ${present.size} distinct values of nums.` })
  let m = k
  frames.push({ pythonLine: P('m = k'), phase: 'start', activeLine: L('let m = k'), at: -1, m, message: `First multiple to test is ${m}.` })
  while (present.has(m)) {
    frames.push({ pythonLine: P('while m in'), phase: 'check', activeLine: L('while (present'), at: nums.indexOf(m), m, ok: true, message: `${m} appears in nums, so try the next multiple.` })
    m += k
    frames.push({ pythonLine: P('m += k'), phase: 'step', activeLine: L('m = m + k'), at: -1, m, message: `Candidate becomes ${m}.` })
  }
  frames.push({ pythonLine: P('while m in'), phase: 'check', activeLine: L('while (present'), at: -1, m, ok: false, message: `${m} is missing from nums.` })
  frames.push({ pythonLine: P('return m'), phase: 'done', activeLine: L('return m'), at: -1, m, ok: true, message: `The smallest missing multiple is ${m}.` })
  return { input: { nums, k }, result: m, frames }
}

export const code = `function smallestMissingMultiple(nums, k) {
  const present = new Set(nums)
  let m = k
  while (present.has(m)) {
    m = m + k
  }
  return m
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

export const python = `def smallest_missing_multiple(nums, k):
    present = set(nums)
    m = k
    while m in present:
        m += k
    return m
`
