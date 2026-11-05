export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 150) throw new Error('n must be an integer from 1 to 150.')
  return { n }
}

export function buildTrace({ n }) {
  let multiple = n
  const frames = [{ phase: 'start', pythonLine: 2, activeLine: L('let multiple = n'), multiple, message: `Start with ${n} and check whether it is even.` }]
  while (multiple % 2 !== 0) {
    multiple += n
    frames.push({ phase: 'step', pythonLine: 4, activeLine: L('multiple += n'), multiple, message: `${multiple - n} is odd, so try ${multiple}.` })
  }
  frames.push({ phase: 'done', pythonLine: 5, activeLine: L('return multiple'), multiple, message: `${multiple} is the smallest even multiple of ${n}.` })
  return { input: { n }, result: multiple, frames }
}

export const code = `function smallestEvenMultiple(n) {
  let multiple = n
  while (multiple % 2 !== 0) {
    multiple += n
  }
  return multiple
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def smallest_even_multiple(n):
    multiple = n
    while multiple % 2 != 0:
        multiple += n
    return multiple
`
