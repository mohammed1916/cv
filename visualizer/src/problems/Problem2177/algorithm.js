// LeetCode 2177: Find Three Consecutive Integers That Sum to a Given Number.
// Three consecutive integers x-1, x, x+1 sum to 3x, so the sum must be divisible by 3 and x = num / 3.

const MAX_NUM = 1000000

export function parseInput(text) {
  const value = Number(String(text).trim())
  if (!Number.isInteger(value) || value < 0 || value > MAX_NUM) throw new Error(`Use an integer from 0 to ${MAX_NUM}.`)
  return { num: value }
}

export const code = `FUNCTION sumOfThree(num)
    IF num mod 3 is not 0 THEN
        RETURN empty list
    x ← num / 3
    RETURN [x - 1, x, x + 1]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def sum_of_three(num):
    if num % 3 != 0:
        return []
    x = num // 3
    return [x - 1, x, x + 1]
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
  { id: 'check', label: 'Divisible?', description: 'The middle value is num / 3, so num must be a multiple of 3.' },
  { id: 'build', label: 'Build', description: 'Place the middle value and its neighbours.' },
  { id: 'done', label: 'Result', description: 'The three integers, or an empty list.' },
]

export function buildTrace({ num }) {
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index: -1, activeLine, pythonLine, message, num, ...extra })
  push('check', L('IF num mod 3'), P('if num % 3'), `Check ${num} mod 3 = ${num % 3}.`)
  let result = []
  if (num % 3 !== 0) {
    push('done', L('RETURN empty list'), P('return []'), `${num} is not a multiple of 3, so no three consecutive integers sum to it.`, { result })
  } else {
    const x = num / 3
    result = [x - 1, x, x + 1]
    push('build', L('x ← num / 3'), P('x = num // 3'), `The middle value is ${num} / 3 = ${x}.`, { x, result: [] })
    push('done', L('RETURN [x - 1'), P('return [x - 1'), `The integers are ${result.join(', ')}; their sum is ${result.reduce((a, b) => a + b, 0)}.`, { x, result })
  }
  return { input: { num }, result, frames }
}
