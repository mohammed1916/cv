// Independently written teaching model. The sample inputs are invented for this visualization.
export const code = [
  'function prefixesDivisibleByFive(nums):',
  '  remainder = 0',
  '  answer = []',
  '  for bit in nums:',
  '    remainder = (remainder * 2 + bit) mod 5',
  '    answer.push(remainder == 0)',
  '  return answer',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def prefixes_divisible_by_five(nums):
    remainder = 0
    answer = []
    for bit in nums:
        remainder = (remainder * 2 + bit) % 5
        answer.append(remainder == 0)
    return answer`

const PSEUDO = code.map(line => line.text)
const PY_LINES = python.split('\n')
function lineOf(lines, key) {
  const index = lines.findIndex(text => text.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, pseudoKey, pyKey, message, snapshot) => ({
  phase,
  activeLine: lineOf(PSEUDO, pseudoKey),
  pythonLine: lineOf(PY_LINES, pyKey),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty prefix, whose remainder is zero.' },
  { id: 'inspect', label: 'Add a bit', description: 'Shift the remainder left by one bit and add the new bit, modulo five.' },
  { id: 'update', label: 'Record', description: 'Store whether this prefix is divisible by five.' },
  { id: 'done', label: 'Result', description: 'Return one boolean for every prefix.' },
]

export const inputLabel = 'JSON object with nums, for example {"nums":[1,0,1]}'
export const complexity = 'O(n) time and O(n) output. Only one remainder from 0 to 4 is kept while scanning. The visualizer accepts up to 24 bits.'
export const examples = [
  { label: 'Mixed bits', input: '{"nums":[1,0,1,1,0,0,1,0]}' },
  { label: 'Leading zeros', input: '{"nums":[0,0,0,1]}' },
  { label: 'Repeated ones', input: '{"nums":[1,1,1,1,1,1]}' },
  { label: 'Single zero', input: '{"nums":[0]}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use {"nums": [...]} with bits.')
  if (input.nums.length < 1 || input.nums.length > 24) throw new Error('Use between 1 and 24 bits.')
  if (!input.nums.every(bit => bit === 0 || bit === 1)) throw new Error('Every entry must be 0 or 1.')
  return { nums: [...input.nums] }
}

export function buildTrace({ nums }) {
  const frames = []
  const answer = []
  let remainder = 0
  frames.push(frame('start', 'remainder = 0', 'remainder = 0', 'Start with the empty prefix, remainder 0.', { nums, remainder, answer: [] }))
  nums.forEach((bit, index) => {
    frames.push(frame('inspect', 'for bit in nums', 'for bit in nums', `Read bit ${bit} at position ${index}.`, { nums, index, bit, remainder, answer: [...answer] }))
    remainder = (remainder * 2 + bit) % 5
    frames.push(frame('inspect', 'remainder = (remainder', 'remainder = (remainder',
      `The prefix now has remainder ${remainder} modulo 5.`, { nums, index, bit, remainder, answer: [...answer] }))
    answer.push(remainder === 0)
    frames.push(frame('update', 'answer.push', 'answer.append',
      `Prefix ${index + 1} is ${remainder === 0 ? '' : 'not '}divisible by 5.`, { nums, index, bit, remainder, answer: [...answer] }))
  })
  frames.push(frame('done', 'return answer', 'return answer', 'Every prefix has been checked.', { nums, remainder, answer: [...answer], result: [...answer] }))
  return { input: { nums }, result: answer, frames }
}
