const PYTHON_SOURCE = `def count_digits_that_divide(num):
    count = 0
    rest = num
    while rest > 0:
        digit = rest % 10
        if digit != 0 and num % digit == 0:
            count += 1
        rest //= 10
    return count`

const PY = PYTHON_SOURCE.split('\n')
const py = (text) => {
  const index = PY.findIndex((line) => line.trim() === text)
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export const code = [
  { line: 1, text: 'function countDigitsThatDivide(num)' },
  { line: 2, text: 'count = 0 and rest = num' },
  { line: 3, text: 'while rest is greater than 0' },
  { line: 4, text: 'digit = rest mod 10' },
  { line: 5, text: 'if digit is not 0 and num mod digit is 0' },
  { line: 6, text: 'count = count + 1' },
  { line: 7, text: 'rest = rest integer-divided by 10' },
  { line: 8, text: 'return count' },
]

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, for example {"num": 121}')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with a num field')
  const { num } = data
  if (!Number.isInteger(num) || num < 1 || num > 1000000000) {
    throw new Error('num must be an integer from 1 to 10^9')
  }
  if (String(num).includes('0')) throw new Error('num must not contain the digit 0')
  return { num }
}

export function buildTrace(input) {
  const { num } = input
  const frames = []
  let count = 0
  let rest = num
  let digit = null
  let digitIndex = -1
  const digits = []
  for (let r = num; r > 0; r = Math.floor(r / 10)) digits.push(r % 10)
  const add = (fields) => frames.push({ num, count, rest, digit, digitIndex, digits: [...digits], result: null, ...fields })

  add({ phase: 'init', activeLine: 2, pythonLine: py('count = 0'), message: 'Start with no divisor digits counted.' })
  add({ phase: 'init', activeLine: 2, pythonLine: py('rest = num'), message: `Work on a copy of ${num}, reading digits from the right.` })

  while (rest > 0) {
    digitIndex += 1
    add({ phase: 'scan', activeLine: 3, pythonLine: py('while rest > 0:'), message: `${rest} is still positive, so read another digit.` })
    digit = rest % 10
    add({ phase: 'scan', activeLine: 4, pythonLine: py('digit = rest % 10'), message: `The last digit is ${digit}.` })
    const divides = digit !== 0 && num % digit === 0
    add({
      phase: 'check',
      activeLine: 5,
      pythonLine: py('if digit != 0 and num % digit == 0:'),
      message: divides ? `${num} divided by ${digit} leaves remainder 0, so this digit counts.` : `${num} is not divisible by ${digit}, so this digit does not count.`,
      result: divides,
    })
    if (divides) {
      count += 1
      add({ phase: 'update', activeLine: 6, pythonLine: py('count += 1'), message: `Count is now ${count}.` })
    }
    rest = Math.floor(rest / 10)
    add({ phase: 'update', activeLine: 7, pythonLine: py('rest //= 10'), message: `Drop the digit: rest becomes ${rest}.` })
  }

  digit = null
  add({ phase: 'done', activeLine: 8, pythonLine: py('return count'), message: `Return ${count} digits that divide ${num}.`, result: count })
  return { input, result: count, frames }
}
