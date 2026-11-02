export function parseInput(text) {
  const value = JSON.parse(text)
  if (!Number.isInteger(value) || value < 10 || value > 1000000000) throw new Error('Use an integer n from 10 to 1000000000.')
  return value
}

export function buildTrace(n) {
  const digits = String(n).split('').map(Number)
  const frames = []
  let first = 0
  let second = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('start with the two largest'), index: -1, digit: null, first, second, message: 'No digit has been read yet.' })
  digits.forEach((d, index) => {
    if (d >= first) {
      second = first
      first = d
      frames.push({ pythonLine: 8, phase: 'top', activeLine: L('d becomes the largest'), index, digit: d, first, second, message: `${d} becomes the largest; the old largest becomes second.` })
    } else if (d > second) {
      second = d
      frames.push({ pythonLine: 10, phase: 'second', activeLine: L('d becomes the second largest'), index, digit: d, first, second, message: `${d} becomes the second largest.` })
    } else {
      frames.push({ pythonLine: 9, phase: 'skip', activeLine: L('otherwise nothing changes'), index, digit: d, first, second, message: `${d} is not above ${second}; keep ${first} and ${second}.` })
    }
  })
  const result = first * second
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return the product'), index: -1, digit: null, first, second, message: `${first} times ${second} is ${result}.` })
  return { input: n, result, frames }
}

export const code = `find the largest product of two digits at different positions of n
  start with the two largest digits seen as 0 and 0
  for each digit d of n
    if d is at least the largest digit then the old largest becomes second and d becomes the largest
    otherwise if d is larger than the second largest then d becomes the second largest
    otherwise nothing changes
  return the product of the largest and second largest`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_digit_product(n):
    first = 0
    second = 0
    for ch in str(n):
        d = int(ch)
        if d >= first:
            second = first
            first = d
        elif d > second:
            second = d
    return first * second
`
