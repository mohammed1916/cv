export const code = [
  'total starts at zero',
  'for each digit d of n add the factorial of d',
  'sort the digits of total and the digits of n',
  'true when the two sorted digit strings match',
  'return the answer',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1

const FACT = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 999999999) throw new Error('n is an integer from 1 to 999999999.')
  return { n }
}

export function buildTrace({ n }) {
  const digits = String(n)
  const frames = []
  let total = 0
  const terms = []
  frames.push({ digits, terms: [], total, phase: 'setup', activeLine: L('total starts'), message: `Digits of ${n} are ${digits}.` })
  for (const ch of digits) {
    const d = Number(ch)
    total += FACT[d]
    terms.push([d, FACT[d]])
    frames.push({ digits, terms: [...terms], total, phase: 'digit', activeLine: L('for each digit'), message: `${d}! = ${FACT[d]}; running total ${total}.` })
  }
  const a = [...String(total)].sort().join('')
  const b = [...digits].sort().join('')
  const result = a === b
  frames.push({ digits, terms: [...terms], total, sortedTotal: a, sortedN: b, result, phase: 'compare', activeLine: L('true when'), message: `Sorted digits ${a} and ${b} ${result ? 'match' : 'differ'}.` })
  frames.push({ digits, terms: [...terms], total, sortedTotal: a, sortedN: b, result, phase: 'done', activeLine: L('return the answer'), message: result ? `${total} is a permutation of n, so the answer is true.` : 'No permutation of n can be digitorial.' })
  return { input: { n }, result, frames }
}

export const python = `from math import factorial

def check_digitorial_permutation(n):
    digits = str(n)
    total = 0
    for d in digits:
        total += factorial(int(d))
    return sorted(str(total)) == sorted(digits)`
