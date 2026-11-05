export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and start, such as {"n":2,"start":3}.')
  const { n, start } = input
  if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error('n must be an integer from 1 to 6.')
  if (!Number.isInteger(start) || start < 0 || start >= 2 ** n) throw new Error(`start must be an integer from 0 to ${2 ** n - 1}.`)
  return { n, start }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function circularPermutation(n, start) {', 'def circular_permutation(n, start):'],
  ['  const size = 2 ** n', '    size = 1 << n'],
  ['  const answer = []', '    answer = []'],
  ['  for (let index = 0; index < size; index++) {', '    for index in range(size):'],
  ['    const gray = index ^ (index >> 1)', '        gray = index ^ (index >> 1)'],
  ['    answer.push(start ^ gray)', '        answer.append(start ^ gray)'],
  ['  }', ''],
  ['  return answer', '    return answer'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ n, start }) {
  const size = 2 ** n
  const answer = []
  const frames = [{ phase: 'size', activeLine: L('const size'), pythonLine: P('size = 1 << n'), index: -1, gray: null, answer: [], message: `There are ${size} numbers with ${n} bits.` }]
  for (let index = 0; index < size; index++) {
    const gray = index ^ (index >> 1)
    frames.push({ phase: 'gray', activeLine: L('const gray'), pythonLine: P('gray = index ^'), index, gray, answer: [...answer], message: `Gray code of ${index} is ${gray.toString(2).padStart(n, '0')}.` })
    answer.push(start ^ gray)
    frames.push({ phase: 'append', activeLine: L('answer.push'), pythonLine: P('answer.append'), index, gray, answer: [...answer], message: `Append ${start} XOR ${gray} = ${start ^ gray}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), index: -1, gray: null, answer: [...answer], message: `Circular order starting at ${start}. Each step, including the wrap-around, changes one bit.` })
  return { input: { n, start }, result: answer, frames }
}
