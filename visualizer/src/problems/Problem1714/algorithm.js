const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 integers in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) throw new Error('Each nums value is an integer from 0 to 100.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries has 1 to 6 pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2) throw new Error('Each query is [start, step].')
    const [start, step] = q
    if (!Number.isInteger(start) || start < 0 || start >= nums.length) throw new Error('start must be a valid index of nums.')
    if (!Number.isInteger(step) || step < 1 || step > 12) throw new Error('step is an integer from 1 to 12.')
  }
  return { nums, queries }
}

export const code = `for each query [start, step], sum the special elements
  set MOD to 1000000007
  for each query [start, step] in order
    set total to 0 and index to start
    while index is still inside nums
      add nums[index] to total
      move index forward by step
    append total modulo MOD to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const line = code.findIndex(c => c.text.includes(s))
  if (line < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return line + 1
}

export const python = `def special_sums(nums, queries):
    MOD = 1000000007
    answers = []
    for start, step in queries:
        total = 0
        index = start
        while index < len(nums):
            total += nums[index]
            index += step
        answers.append(total % MOD)
    return answers
`
const P = s => {
  const line = python.split('\n').findIndex(p => p.includes(s))
  if (line < 0) throw new Error(`Missing python line: ${s}`)
  return line + 1
}

export const phases = [
  { id: 'setup', label: 'Setup', description: 'Read the array and queries.' },
  { id: 'query', label: 'Query', description: 'Start a query at its start index.' },
  { id: 'visit', label: 'Visit', description: 'Add the element at the current index.' },
  { id: 'advance', label: 'Step', description: 'Jump forward by step.' },
  { id: 'store', label: 'Store', description: 'Record the query answer modulo MOD.' },
  { id: 'done', label: 'Result', description: 'All queries are answered.' },
]

export function buildTrace({ nums, queries }) {
  const frames = []
  const answers = []
  frames.push({ pythonLine: P('MOD = '), phase: 'setup', activeLine: L('set MOD'), qi: -1, start: -1, step: 0, index: -1, visited: [], total: 0, answers: [], message: `Each query walks the array with a stride of step, starting at start.` })
  queries.forEach(([start, step], qi) => {
    frames.push({ pythonLine: P('for start, step'), phase: 'query', activeLine: L('for each query'), qi, start, step, index: start, visited: [], total: 0, answers: [...answers], message: `Query ${qi + 1}: start ${start}, step ${step}.` })
    let total = 0
    const visited = []
    let index = start
    frames.push({ pythonLine: P('total = 0'), phase: 'query', activeLine: L('set total to 0'), qi, start, step, index, visited: [], total, answers: [...answers], message: `Set total to 0 and index to ${start}.` })
    while (index < nums.length) {
      total += nums[index]
      visited.push(index)
      frames.push({ pythonLine: P('total += nums'), phase: 'visit', activeLine: L('add nums[index]'), qi, start, step, index, visited: [...visited], total, answers: [...answers], message: `Add nums[${index}] = ${nums[index]}; total is ${total}.` })
      index += step
      frames.push({ pythonLine: P('index += step'), phase: 'advance', activeLine: L('move index forward'), qi, start, step, index, visited: [...visited], total, answers: [...answers], message: index < nums.length ? `Next index ${index} is still inside nums.` : `Next index ${index} is past the end, so the walk stops.` })
    }
    answers.push(total % MOD)
    frames.push({ pythonLine: P('answers.append'), phase: 'store', activeLine: L('append total modulo'), qi, start, step, index: -1, visited: [...visited], total, answers: [...answers], message: `Query ${qi + 1} answer is ${total % MOD}.` })
  })
  frames.push({ pythonLine: P('return answers'), phase: 'done', activeLine: L('return answers'), qi: queries.length, start: -1, step: 0, index: -1, visited: [], total: 0, answers: [...answers], message: `Answers: ${answers.join(', ')}.` })
  return { input: { nums, queries }, result: answers, frames }
}
