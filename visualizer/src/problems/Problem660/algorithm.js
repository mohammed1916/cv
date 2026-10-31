export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Number.isInteger(spec.n) || spec.n < 1 || spec.n > 1000000) throw new Error('Enter an integer n from 1 to 1,000,000.')
  return spec
}

export function buildTrace(spec) {
  const { n } = spec
  const digits = []
  let x = n
  const frames = [{ phase: 'start', pythonLine: P('digits = []'), activeLine: L('set digits to'), digits: [], quotient: x, result: null, message: `Count in base 9, which uses the digits 0 to 8 and never a 9. Write ${n} in base 9.` }]
  while (x > 0) {
    digits.push(x % 9)
    frames.push({ phase: 'digit', pythonLine: P('digits.append(n % 9)'), activeLine: L('append n mod 9'), digits: [...digits], quotient: x, result: null, message: `${x} leaves remainder ${x % 9}: that is the next base-9 digit.` })
    x = Math.floor(x / 9)
    frames.push({ phase: 'divide', pythonLine: P('n = n // 9'), activeLine: L('set n to n divided'), digits: [...digits], quotient: x, result: null, message: x ? `Divide by 9: ${x} remains to be written.` : 'Nothing is left to write.' })
  }
  const result = Number(digits.slice().reverse().join(''))
  frames.push({ phase: 'done', pythonLine: P('return int('), activeLine: L('read digits in reverse'), digits: [...digits], quotient: 0, result, message: `Read the base-9 digits as base 10: ${result} is the ${n}-th integer without a 9.` })
  return { input: spec, result, frames }
}

export const code = `function newInteger(n):
  set digits to an empty list
  while n is greater than 0:
    append n mod 9 to digits
    set n to n divided by 9, rounded down
  read digits in reverse order as a base-10 number and return it`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def new_integer(n):
    digits = []
    while n > 0:
        digits.append(n % 9)
        n = n // 9
    return int(''.join(str(d) for d in reversed(digits)))
`
