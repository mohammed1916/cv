export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and start, such as {"n":2,"start":3}.')
  const { n, start } = input
  if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error('n must be an integer from 1 to 6.')
  if (!Number.isInteger(start) || start < 0 || start >= 2 ** n) throw new Error(`start must be an integer from 0 to ${2 ** n - 1}.`)
  return { n, start }
}

export const code = `circular permutation of all n-bit numbers starting at start
  set size to two to the power n
  for each index i from 0 to size minus 1
    set gray to i XOR (i shifted right by one)
    append start XOR gray to the answer
  return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, start }) {
  const size = 2 ** n
  const answer = []
  const frames = [{ phase: 'size', activeLine: L('set size to'), index: -1, gray: null, answer: [], message: `There are ${size} numbers with ${n} bits.` }]
  for (let index = 0; index < size; index++) {
    const gray = index ^ (index >> 1)
    frames.push({ phase: 'gray', activeLine: L('set gray to'), index, gray, answer: [...answer], message: `Gray code of ${index} is ${gray.toString(2).padStart(n, '0')}.` })
    answer.push(start ^ gray)
    frames.push({ phase: 'append', activeLine: L('append start XOR gray'), index, gray, answer: [...answer], message: `Append ${start} XOR ${gray} = ${start ^ gray}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answer'), index: -1, gray: null, answer: [...answer], message: `Circular order starting at ${start}. Each step, including the wrap-around, changes one bit.` })
  return { input: { n, start }, result: answer, frames }
}

export const python = `def circular_permutation(n, start):
    size = 1 << n
    answer = []
    for index in range(size):
        gray = index ^ (index >> 1)
        answer.append(start ^ gray)
    return answer
`
