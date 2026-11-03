export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and s.')
  const { n, s } = input
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('n is an integer from 1 to 10.')
  if (!Number.isInteger(s) || s < 0 || s > 90) throw new Error('s is an integer from 0 to 90.')
  return { n, s }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

export function buildTrace({ n, s }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)

  if (s > 9 * n) {
    frames.push({ phase: 'check', activeLine: L('then go to the impossible'), pythonLine: P('if s > 9 * n'), digits: [], remaining: s, at: -1, message: `${s} is more than 9 times ${n}, so no integer with ${n} digits can reach that sum.` })
    frames.push({ phase: 'done', activeLine: L('impossible result: return -1'), pythonLine: P('return -1'), digits: [], remaining: s, at: -1, result: -1, message: 'No integer fits, so the answer is -1.' })
    return { input: { n, s }, result: -1, frames }
  }

  const digits = []
  let remaining = s
  frames.push({ phase: 'start', activeLine: L('remaining = s'), pythonLine: P('remaining = s'), digits: [], remaining, at: -1, message: `Spend the digit sum ${s} from the left, nine at a time.` })
  for (let i = 0; i < n; i++) {
    const d = Math.min(9, remaining)
    digits.push(d)
    remaining -= d
    frames.push({ phase: 'place', activeLine: L('place the largest digit'), pythonLine: P('digit = min(9, remaining)'), digits: [...digits], remaining, at: i, message: `Position ${i + 1} takes ${d}; ${remaining} is left for the positions after it.` })
  }
  const result = Number(digits.join(''))
  frames.push({ phase: 'done', activeLine: L('return the digits'), pythonLine: P('return int('), digits: [...digits], remaining, at: -1, result, message: `The digits read left to right form ${result}.` })
  return { input: { n, s }, result, frames }
}

export const code = `largest integer with at most n digits and digit sum s
if s is greater than 9 times n then go to the impossible result
remaining = s
for each position from the leftmost digit
  place the largest digit that is at most 9 and at most remaining
  subtract the placed digit from remaining
return the digits read as one integer
impossible result: return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def largest_with_digit_sum(n, s):
    if s > 9 * n:
        return -1
    remaining = s
    digits = []
    for _ in range(n):
        digit = min(9, remaining)
        digits.append(digit)
        remaining -= digit
    return int(''.join(str(d) for d in digits))
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
