export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw new Error('n must be an integer from 1 to 100000.')
  return { n }
}

export function buildTrace({ n }) {
  const digits = String(n).split('').map(Number)
  let reversed = 0
  let rest = n
  const frames = [{ phase: 'start', activeLine: L('set reversed to 0'), position: -1, reversed, message: `Reverse the digits of ${n}.` }]
  let position = digits.length - 1
  while (rest > 0) {
    const digit = rest % 10
    reversed = reversed * 10 + digit
    rest = Math.floor(rest / 10)
    frames.push({ phase: 'digit', activeLine: L('append the last digit'), position, reversed, message: `Append digit ${digit}. The reversed value is now ${reversed}.` })
    position -= 1
  }
  const result = Math.abs(n - reversed)
  frames.push({ phase: 'done', activeLine: L('return the absolute'), position: -1, reversed, message: `|${n} - ${reversed}| = ${result}.` })
  return { input: { n }, result, digits, frames }
}

export const code = `mirror distance of an integer n
read n from the input
set reversed to 0 and rest to n
while rest is above 0 do
  append the last digit of rest to the end of reversed
  remove the last digit from rest
return the absolute value of n minus reversed`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def mirror_distance(n):
    reversed_n = 0
    rest = n
    while rest > 0:
        reversed_n = reversed_n * 10 + rest % 10
        rest //= 10
    return abs(n - reversed_n)
`
