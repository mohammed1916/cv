// LeetCode 2847: Smallest Number With Given Digit Product (draft rules).
// Return the smallest positive integer whose decimal digits multiply to n, as a string, or "-1" when impossible.
// Greedy: peel off factors 9 down to 2; the fewest digits sorted ascending give the smallest number.
// Assumed sentinel: "-1" for impossible inputs.

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw new Error('Use a positive integer n up to 100000.')
  return n
}

const CODE_TEXT = [
  'smallest number whose digits multiply to n',
  '  digits ← empty list',
  '  FOR d from 9 down to 2',
  '    WHILE n is divisible by d',
  '      append d to digits; n ← n / d',
  '  IF n is not 1 THEN return "-1"',
  '  IF digits is empty THEN return "1"',
  '  sort digits in ascending order',
  '  return the digits joined as one string',
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

const PYTHON_TEXT = `def smallest_with_digit_product(n):
    digits = []
    for d in range(9, 1, -1):
        while n % d == 0:
            digits.append(d)
            n //= d
    if n != 1:
        return "-1"
    if not digits:
        return "1"
    digits.sort()
    return "".join(str(d) for d in digits)
`

export const python = PYTHON_TEXT

const P = s => {
  const index = PYTHON_TEXT.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'divide', label: 'Peel factors', description: 'Divide out the largest digit factor first.' },
  { id: 'check', label: 'Leftover', description: 'Check whether anything is left over.' },
  { id: 'sort', label: 'Sort', description: 'Arrange the digits smallest first.' },
  { id: 'done', label: 'Result', description: 'Report the number or -1.' },
]

export function buildTrace(n0) {
  const frames = []
  let n = n0
  const digits = []
  const snap = extra => ({ remaining: n, digits: [...digits], ...extra })
  frames.push(snap({ phase: 'divide', activeLine: L('digits ← empty list'), pythonLine: P('digits = []'), divisor: null, message: `Start with n = ${n0}.` }))
  for (let d = 9; d >= 2; d--) {
    frames.push(snap({ phase: 'divide', divisor: d, activeLine: L('FOR d from 9 down to 2'), pythonLine: P('for d in range(9, 1, -1)'), message: `Try digit ${d}.` }))
    while (n % d === 0) {
      digits.push(d)
      n /= d
      frames.push(snap({ phase: 'divide', divisor: d, activeLine: L('append d to digits'), pythonLine: P('digits.append(d)'), message: `${d} divides evenly; remaining ${n}.` }))
    }
  }
  if (n !== 1) {
    frames.push(snap({ phase: 'check', divisor: null, activeLine: L('IF n is not 1'), pythonLine: P('if n != 1:'), ok: false, message: `${n} has a prime factor above 7, so no digit set works.` }))
    frames.push(snap({ phase: 'done', divisor: null, activeLine: L('return "-1"'), pythonLine: P('return "-1"'), ok: false, result: '-1', message: 'Impossible: the answer is -1.' }))
    return { input: n0, result: '-1', frames }
  }
  if (digits.length === 0) {
    frames.push(snap({ phase: 'check', divisor: null, activeLine: L('IF digits is empty'), pythonLine: P('if not digits:'), ok: true, message: 'The input is 1, so the answer is 1.' }))
    frames.push(snap({ phase: 'done', divisor: null, activeLine: L('return "1"'), pythonLine: P('return "1"'), ok: true, result: '1', message: 'Answer: 1.' }))
    return { input: n0, result: '1', frames }
  }
  frames.push(snap({ phase: 'check', divisor: null, activeLine: L('IF n is not 1'), pythonLine: P('if n != 1:'), ok: true, message: 'Nothing is left over; the digits are complete.' }))
  digits.sort((a, b) => a - b)
  frames.push(snap({ phase: 'sort', divisor: null, activeLine: L('sort digits'), pythonLine: P('digits.sort()'), ok: true, message: `Sorted digits: ${digits.join(' ')}.` }))
  const result = digits.join('')
  frames.push(snap({ phase: 'done', divisor: null, activeLine: L('return the digits joined'), pythonLine: P('return "".join'), ok: true, result, message: `Answer: ${result}.` }))
  return { input: n0, result, frames }
}
