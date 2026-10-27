export function parseInput(text) {
  const expression = JSON.parse(text)
  if (typeof expression !== 'string' || !/^[+-]?\d+\/\d+([+-]\d+\/\d+)*$/.test(expression) || expression.length > 100) throw new Error('Enter a JSON string like "-1/2+1/2+1/3" with 1–10 fractions.')
  const parts = expression.match(/[+-]?\d+\/\d+/g)
  if (parts.length > 10) throw new Error('Use at most 10 fractions.')
  if (parts.some(p => Number(p.split('/')[1]) === 0 || Number(p.split('/')[1]) > 10)) throw new Error('Denominators must be from 1 to 10.')
  return parts.map(p => { const [n, d] = p.split('/'); return { n: Number(n), d: Number(d) } })
}

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))

export function buildTrace(fractions) {
  let num = 0, den = 1
  const frames = [{ phase: 'start', num, den, term: null, activeLine: 2, message: 'Start with the fraction 0/1.' }]
  for (const term of fractions) {
    const nextNum = num * term.d + term.n * den
    const nextDen = den * term.d
    const g = gcd(nextNum, nextDen) || 1
    num = nextNum / g; den = nextDen / g
    frames.push({ phase: 'add', num, den, term, activeLine: 4, message: `Add ${term.n}/${term.d}: result ${num}/${den} after reduction.` })
  }
  const result = den === 1 ? `${num}/1` : `${num}/${den}`
  frames.push({ phase: 'done', num, den, term: null, result, activeLine: 6, message: `Reduced result: ${result}.` })
  return { input: fractions, result, frames }
}

export const code = `start the fraction accumulator at zero over one
for each signed term in the expression, from left to right
  read its signed numerator and its positive denominator
  cross multiply to combine the term with the accumulator
  divide the numerator and the denominator by their greatest common divisor
return the accumulator as a numerator, a slash, and a denominator`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The family visualizer reports stage numbers: 1 setup, 4 reduce, 5 return.
export const LINE_MAP = { 1: 1, 4: 5, 5: 6 }

export const python = `def fraction_addition(expression):
    import re
    from math import gcd
    numerator, denominator = 0, 1
    for term in re.findall(r'[+-]?\\d+/\\d+', expression):
        top, bottom = map(int, term.split('/'))
        numerator, denominator = numerator * bottom + top * denominator, denominator * bottom
        divisor = gcd(abs(numerator), denominator)
        numerator //= divisor
        denominator //= divisor
    return f'{numerator}/{denominator}'`
