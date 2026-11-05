export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with candies and numPeople.')
  const { candies, numPeople } = data
  if (!Number.isInteger(candies) || candies < 1 || candies > 100) throw new Error('candies is an integer from 1 to 100.')
  if (!Number.isInteger(numPeople) || numPeople < 1 || numPeople > 10) throw new Error('numPeople is an integer from 1 to 10.')
  return { candies, numPeople }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function distributeCandies(candies, numPeople) {', 'def distribute_candies(candies, numPeople):'],
  ['  const totals = Array(numPeople).fill(0)', '    result = [0] * numPeople'],
  ['  let left = candies', '    left = candies'],
  ['  let give = 1', '    give = 1'],
  ['  let person = 0', '    person = 0'],
  ['  while (left > 0) {', '    while left > 0:'],
  ['    const amount = Math.min(give, left)', '        amount = min(give, left)'],
  ['    totals[person] += amount', '        result[person] += amount'],
  ['    left -= amount', '        left -= amount'],
  ['    give += 1', '        give += 1'],
  ['    person = (person + 1) % numPeople', '        person = (person + 1) % numPeople'],
  ['  }', ''],
  ['  return totals', '    return result'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { candies, numPeople } = input
  const totals = Array(numPeople).fill(0)
  let left = candies
  let give = 1
  let person = 0
  const frames = [{ phase: 'start', pythonLine: P('result = [0]'), activeLine: L('const totals'), person: -1, totals: [...totals], left, message: `${candies} candies and ${numPeople} people. The first gift is 1.` }]
  while (left > 0) {
    const amount = Math.min(give, left)
    totals[person] += amount
    left -= amount
    frames.push({ phase: 'give', pythonLine: P('amount = min'), activeLine: L('const amount'), person, totals: [...totals], left, message: `Give ${amount} to person ${person}. ${left} candies remain.` })
    give += 1
    person = (person + 1) % numPeople
  }
  frames.push({ phase: 'done', pythonLine: P('return result'), activeLine: L('return totals'), person: -1, totals: [...totals], left, message: `Final totals: ${totals.join(', ')}.` })
  return { input, result: totals, frames }
}
