export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Number.isInteger(spec.n) || spec.n < 1 || spec.n > 1000000) throw new Error('Enter an integer n from 1 to 1,000,000.')
  return spec
}

export function buildTrace(spec) {
  const { n } = spec
  const digits = []
  let x = n
  const frames = [{ phase: 'start', activeLine: L('digits = []'), digits: [], quotient: x, result: null, message: `Count in base 9, which uses the digits 0 to 8 and never a 9. Write ${n} in base 9.` }]
  while (x > 0) {
    digits.push(x % 9)
    frames.push({ phase: 'digit', activeLine: L('digits.append'), digits: [...digits], quotient: x, result: null, message: `${x} leaves remainder ${x % 9}: that is the next base-9 digit.` })
    x = Math.floor(x / 9)
    frames.push({ phase: 'divide', activeLine: L('n = n // 9'), digits: [...digits], quotient: x, result: null, message: x ? `Divide by 9: ${x} remains to be written.` : 'Nothing is left to write.' })
  }
  const result = Number(digits.slice().reverse().join(''))
  frames.push({ phase: 'done', activeLine: L('return int('), digits: [...digits], quotient: 0, result, message: `Read the base-9 digits as base 10: ${result} is the ${n}-th integer without a 9.` })
  return { input: spec, result, frames }
}

export const code = `def newInteger(n):
    digits = []
    while n > 0:
        digits.append(n % 9)
        n = n // 9
    return int(''.join(map(str, reversed(digits))))`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
