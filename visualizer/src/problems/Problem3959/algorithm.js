export const code = `set squares and digits to zero
for each decimal digit d of n
  add d times d to squares
  add d to digits
return whether squares minus digits is at least fifty`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def check_good_integer(n):
    squares = 0
    digits = 0
    for ch in str(n):
        d = int(ch)
        squares += d * d
        digits += d
    return squares - digits >= 50
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

export function parseInput(text) {
  const trimmed = text.trim()
  if (!/^\d+$/.test(trimmed)) throw new Error('Enter one positive integer.')
  const n = Number(trimmed)
  if (n < 1 || n > 1000000000) throw new Error('n is between 1 and 1000000000.')
  return n
}

export function buildTrace(n) {
  const frames = []
  let squares = 0
  let digits = 0
  const digitText = String(n)
  frames.push({ phase: 'start', activeLine: L('set squares and digits to zero'), pythonLine: P('squares = 0'), digit: null, squares, digits, index: -1, message: `Read ${digitText} digit by digit.` })
  for (let i = 0; i < digitText.length; i++) {
    const d = Number(digitText[i])
    squares += d * d
    digits += d
    frames.push({ phase: 'digit', activeLine: L('add d times d to squares'), pythonLine: P('squares += d * d'), digit: d, squares, digits, index: i, message: `Digit ${d} adds ${d * d} to the squares and ${d} to the digit sum.` })
  }
  const difference = squares - digits
  const good = difference >= 50
  frames.push({ phase: 'done', activeLine: L('return whether squares minus digits'), pythonLine: P('return squares - digits'), digit: null, squares, digits, index: -1, difference, good, message: `${squares} minus ${digits} is ${difference}, ${good ? 'at least' : 'below'} fifty.` })
  return { input: n, result: good, frames }
}
