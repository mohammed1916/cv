export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.num) || !Number.isInteger(input.k)) throw new Error('Use an object with integers num and k.')
  if (input.num < 1 || input.num > 1000000000) throw new Error('num must be an integer from 1 to 1000000000.')
  if (input.k < 1 || input.k > String(input.num).length) throw new Error('k must be from 1 up to the number of digits in num.')
  return { num: input.num, k: input.k }
}

export function buildTrace({ num, k }) {
  const digits = String(num)
  const frames = []
  let beauty = 0
  frames.push({ phase: 'start', activeLine: L('set digits to'), left: 0, right: -1, part: null, divides: null, beauty, message: `The number has ${digits.length} digits. Windows of ${k} digits are checked.` })
  for (let start = 0; start + k <= digits.length; start++) {
    const part = Number(digits.slice(start, start + k))
    const divides = part !== 0 && num % part === 0
    if (divides) beauty++
    frames.push({ phase: 'window', activeLine: L('if the part is not 0'), left: start, right: start + k - 1, part, divides, beauty, message: part === 0 ? `The window reads ${digits.slice(start, start + k)}, which is 0, so it does not count.` : `The window reads ${part}. ${num} ${divides ? 'is divisible by it' : 'is not divisible by it'}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return beauty'), left: 0, right: digits.length - 1, part: null, divides: null, beauty, message: `K-beauty: ${beauty}.` })
  return { input: { num, k }, result: beauty, frames }
}

export const code = `find the k-beauty of a number (num, k):
  set digits to the decimal digits of num
  set beauty to 0
  for each start from 0 to the length of digits minus k
    set part to the number made by the k digits from start
    if the part is not 0 and num is divisible by part then add 1 to beauty
  return beauty`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def k_beauty(num, k):
    digits = str(num)
    beauty = 0
    for start in range(len(digits) - k + 1):
        part = int(digits[start:start + k])
        if part != 0 and num % part == 0:
            beauty += 1
    return beauty
`
