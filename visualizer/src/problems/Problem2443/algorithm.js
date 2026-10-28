export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with num.')
  const { num } = input
  if (!Number.isInteger(num) || num < 0 || num > 1000) throw new Error('num must be an integer from 0 to 1000.')
  return { num }
}

const reverseDigits = x => {
  let reversed = 0
  let rest = x
  while (rest > 0) {
    reversed = reversed * 10 + (rest % 10)
    rest = Math.floor(rest / 10)
  }
  return reversed
}

export function buildTrace({ num }) {
  const frames = [{ phase: 'start', activeLine: L('try x from 0 up to num'), x: -1, checked: 0, message: `Look for x with x plus its reverse equal to ${num}.` }]
  let found = null
  let checked = 0
  for (let x = 0; x <= num && found === null; x++) {
    const reversed = reverseDigits(x)
    const sum = x + reversed
    checked += 1
    frames.push({ phase: 'try', activeLine: L('if x plus the reverse'), x, checked, message: `${x} + ${reversed} = ${sum}${sum === num ? ', which matches.' : '.'}` })
    if (sum === num) found = x
  }
  const result = found !== null
  frames.push({ phase: 'done', activeLine: L(result ? 'return true' : 'return false'), x: found ?? -1, checked, message: result ? `${found} works, so the answer is true.` : `No x works, so the answer is false.` })
  return { input: { num }, result, checked, frames }
}

export const code = `check whether num equals x plus the reverse of x for some x
read num from the input
try x from 0 up to num do
  reverse the digits of x
  if x plus the reverse of x equals num then return true
return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_of_number_and_reverse(num):
    for x in range(num + 1):
        reverse = 0
        rest = x
        while rest > 0:
            reverse = reverse * 10 + rest % 10
            rest //= 10
        if x + reverse == num:
            return True
    return False
`
