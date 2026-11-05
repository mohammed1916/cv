// LeetCode 2154: Keep Multiplying Found Values by Two.
// Keep the numbers in a set. While the current value is present, double it. The first missing value ends it.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"nums":[3,1,6,4],"original":3}.') }
  const { nums, original } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) {
    throw new Error('nums holds 1 to 30 integers from 1 to 1000.')
  }
  if (!Number.isInteger(original) || original < 1 || original > 1000) throw new Error('original is an integer from 1 to 1000.')
  return { nums, original }
}

export const code = `function findFinalValue(nums, original) {
  const present = new Set(nums)
  let current = original
  while (present.has(current)) {
    current *= 2
  }
  return current
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: find_final_value
def find_final_value(nums, original):
    present = set(nums)
    current = original
    while current in present:
        current *= 2
    return current
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Build the set of values present.' },
  { id: 'found', label: 'Found', description: 'The current value is present, so it doubles.' },
  { id: 'missing', label: 'Missing', description: 'The current value is absent, so the process stops.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]

export function buildTrace({ nums, original }) {
  const frames = []
  const present = new Set(nums)
  let current = original
  const trail = []
  frames.push({ phase: 'start', activeLine: L('const present = new Set'), pythonLine: P('present = set'), message: `Start with ${original}; ${present.size} distinct values present.`, current, trail: [] })
  while (present.has(current)) {
    trail.push(current)
    frames.push({ phase: 'found', activeLine: L('while (present.has(current))'), pythonLine: P('while current in present'), message: `${current} is present, so double it.`, current, trail: [...trail] })
    current *= 2
  }
  frames.push({ phase: 'missing', activeLine: L('return current'), pythonLine: P('while current in present'), message: `${current} is not present, so the process stops.`, current, trail: [...trail] })
  frames.push({ phase: 'done', activeLine: L('return current'), pythonLine: P('return current'), message: `Final value: ${current}.`, current, trail: [...trail] })
  return { input: { nums, original }, result: current, frames }
}
