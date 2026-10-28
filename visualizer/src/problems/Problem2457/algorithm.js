export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with n and target.')
  const { n, target } = data
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('n is an integer from 1 to 1000.')
  if (!Number.isInteger(target) || target < 1 || target > 30) throw new Error('target is an integer from 1 to 30.')
  return { n, target }
}

const digitSum = v => String(v).split('').reduce((a, c) => a + Number(c), 0)

export function buildTrace(input) {
  const { n, target } = input
  const frames = [{ phase: 'start', activeLine: L('if the digit sum of n is at most target'), candidate: n, sum: digitSum(n), index: -1, message: `Digit sum of ${n} is ${digitSum(n)} against target ${target}.` }]
  if (digitSum(n) <= target) {
    frames.push({ phase: 'done', activeLine: L('return zero'), candidate: n, sum: digitSum(n), index: -1, message: 'The number is already beautiful, so no addition is needed.' })
    return { input, result: 0, frames }
  }
  let p = 10
  for (;;) {
    const m = Math.ceil(n / p) * p
    const sum = digitSum(m)
    frames.push({ phase: 'try', activeLine: L('round n up to a multiple of p'), candidate: m, sum, index: -1, message: `Round up to a multiple of ${p}: ${m}, digit sum ${sum}.` })
    if (sum <= target) {
      const result = m - n
      frames.push({ phase: 'done', activeLine: L('return m minus n'), candidate: m, sum, index: -1, message: `Smallest addition: ${result} (${n} becomes ${m}).` })
      return { input, result, frames }
    }
    p *= 10
  }
}

export const code = `smallest non-negative addition that makes the digit sum at most target:
  if the digit sum of n is at most target then return zero
  set p to ten
  repeat
    round n up to a multiple of p, calling the result m
    if the digit sum of m is at most target then return m minus n
    multiply p by ten`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_addition_beautiful(n, target):
    def digit_sum(v):
        return sum(int(c) for c in str(v))

    if digit_sum(n) <= target:
        return 0
    p = 10
    while True:
        m = (n + p - 1) // p * p
        if digit_sum(m) <= target:
            return m - n
        p *= 10
`
