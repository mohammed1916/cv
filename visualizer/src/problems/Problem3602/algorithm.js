const SYMBOLS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('n must be an integer from 1 to 1000.')
  return { n }
}

const convert = (value, base) => {
  if (value === 0) return '0'
  const digits = []
  let rest = value
  while (rest > 0) {
    digits.push(SYMBOLS[rest % base])
    rest = Math.floor(rest / base)
  }
  return digits.reverse().join('')
}

export function buildTrace({ n }) {
  const square = n * n
  const cube = n * n * n
  const frames = [{ phase: 'start', activeLine: L('set square to'), text: '', message: `Square ${n} to get ${square}, and cube it to get ${cube}.` }]
  const hex = convert(square, 16)
  frames.push({ phase: 'hex', activeLine: L('write square in hexadecimal'), text: hex, message: `${square} in hexadecimal is ${hex}.` })
  const base36 = convert(cube, 36)
  frames.push({ phase: 'base36', activeLine: L('write cube in base 36'), text: hex + base36, message: `${cube} in base 36 is ${base36}.` })
  const result = hex + base36
  frames.push({ phase: 'done', activeLine: L('return the concatenation'), text: result, message: `Joining the two strings gives ${result}.` })
  return { input: { n }, result, frames }
}

export const code = `concatenate the hexadecimal form of n squared with the base 36 form of n cubed
read n from the input
set square to n times n
set cube to n times n times n
write square in hexadecimal by repeated division by 16 using uppercase letters
write cube in base 36 by repeated division by 36 using digits and uppercase letters
return the concatenation of the two strings`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def hex_and_base36(n):
    symbols = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    def convert(value, base):
        if value == 0:
            return "0"
        digits = []
        while value > 0:
            digits.append(symbols[value % base])
            value //= base
        return "".join(reversed(digits))

    return convert(n * n, 16) + convert(n ** 3, 36)
`
