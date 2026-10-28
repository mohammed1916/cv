export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n)) throw new Error('Use a JSON object with an integer n.')
  if (input.n < 0 || input.n > 1000) throw new Error('n must be an integer from 0 to 1000.')
  return input
}

export function buildTrace(input) {
  const { n } = input
  let count = 1
  let value = 1
  const values = [0]
  const frames = [{ phase: 'start', activeLine: L('count = 1 for the value 0'), value: 0, count, values: [0], message: 'Zero is monobit, so start the count at 1.' }]
  while (value <= n) {
    count++
    values.push(value)
    frames.push({ phase: 'add', activeLine: L('value = value times 2 plus 1'), value, count, values: [...values], message: `${value} in binary is all ones, so it counts. Count: ${count}.` })
    value = value * 2 + 1
  }
  frames.push({ phase: 'done', activeLine: L('return count'), value: null, count, values: [...values], message: `${count} monobit integer(s) in [0, ${n}].` })
  return { input, result: count, frames }
}

export const code = `count monobit integers (n):
  count = 1 for the value 0
  value = 1
  while value is at most n
    add 1 to count
    value = value times 2 plus 1
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_monobit_integers(n):
    count = 1
    value = 1
    while value <= n:
        count += 1
        value = value * 2 + 1
    return count
`
