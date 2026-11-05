// LeetCode 2180: Count Integers With Even Digit Sum.
// Walk every integer from 1 to num, add its digits, and count the ones whose digit sum is even.

const MAX_NUM = 80

export function parseInput(text) {
  const value = Number(String(text).trim())
  if (!Number.isInteger(value) || value < 1 || value > MAX_NUM) throw new Error(`Use an integer from 1 to ${MAX_NUM}. The visualization caps the range there.`)
  return { num: value }
}

export const code = `FUNCTION countEven(num)
    ans ← 0
    FOR x from 1 to num
        total ← sum of the digits of x
        IF total mod 2 = 0 THEN
            ans ← ans + 1
    RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_even(num):
    ans = 0
    for x in range(1, num + 1):
        total = sum(int(d) for d in str(x))
        if total % 2 == 0:
            ans += 1
    return ans
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
  { id: 'start', label: 'Start', description: 'Nothing counted yet.' },
  { id: 'scan', label: 'Scan', description: 'Each integer from 1 to num has its digits added.' },
  { id: 'done', label: 'Result', description: 'How many had an even digit sum.' },
]

export function buildTrace({ num }) {
  let ans = 0
  const frames = []
  const push = (phase, x, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index: x, x, activeLine, pythonLine, message, num, ans, ...extra })
  push('start', -1, L('ans ← 0'), P('ans = 0'), `Check the integers 1 to ${num}.`)
  for (let x = 1; x <= num; x++) {
    const digits = String(x).split('').map(Number)
    const total = digits.reduce((a, b) => a + b, 0)
    const even = total % 2 === 0
    if (even) ans += 1
    push('scan', x, L('total ← sum'), P('total = sum'),
      `${x}: digits ${digits.join(' + ')} = ${total}, which is ${even ? 'even, so it counts' : 'odd'}. Count ${ans}.`,
      { digits, total, even })
  }
  push('done', -1, L('RETURN ans'), P('return ans'), `${ans} integers from 1 to ${num} have an even digit sum.`)
  return { input: { num }, result: ans, frames }
}
