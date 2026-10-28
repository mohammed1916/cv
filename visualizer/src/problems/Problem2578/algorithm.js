export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with num (a digit string).')
  const { num } = data
  if (typeof num !== 'string' || !/^[1-9][0-9]{1,7}$/.test(num)) throw new Error('num must be 2 to 8 digits with no leading zero.')
  return { num }
}

export function buildTrace(input) {
  const digits = input.num.split('').sort()
  let first = ''
  let second = ''
  const frames = [{ phase: 'start', activeLine: L('sort the digits'), digits: [...digits], first, second, message: `Sorted digits: ${digits.join('')}. Deal them out alternately.` }]
  digits.forEach((d, i) => {
    if (i % 2 === 0) first += d
    else second += d
    frames.push({ phase: 'deal', activeLine: L(i % 2 === 0 ? 'add the digit to the first number' : 'add the digit to the second number'), digits: [...digits], index: i, first, second, message: `Digit ${d} goes to ${i % 2 === 0 ? 'the first' : 'the second'} number.` })
  })
  const result = Number(first) + Number(second)
  frames.push({ phase: 'done', activeLine: L('return the sum'), digits: [...digits], index: -1, first, second, message: `${first} + ${second} = ${result}.` })
  return { input, result, frames }
}

export const code = `minimum sum of two numbers made from the digits of num:
  sort the digits from smallest to largest
  set first and second to empty
  for each digit in sorted order, alternating between the two numbers
    if the digit goes to the first number then add the digit to the first number
    otherwise add the digit to the second number
  return the sum of first and second`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_split_sum(num):
    digits = sorted(num)
    first = ''.join(digits[0::2])
    second = ''.join(digits[1::2])
    return int(first) + int(second)
`
