export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 150) throw new Error('n must be an integer from 1 to 150.')
  return { n }
}

export function buildTrace({ n }) {
  let multiple = n
  const frames = [{ phase: 'start', activeLine: L('set multiple to n'), multiple, message: `Start with ${n} and check whether it is even.` }]
  while (multiple % 2 !== 0) {
    multiple += n
    frames.push({ phase: 'step', activeLine: L('add n to multiple'), multiple, message: `${multiple - n} is odd, so try ${multiple}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return multiple'), multiple, message: `${multiple} is the smallest even multiple of ${n}.` })
  return { input: { n }, result: multiple, frames }
}

export const code = `find the smallest positive integer that is a multiple of both 2 and n
read n from the input
set multiple to n
while multiple is odd do
  add n to multiple
return multiple`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_even_multiple(n):
    multiple = n
    while multiple % 2 != 0:
        multiple += n
    return multiple
`
