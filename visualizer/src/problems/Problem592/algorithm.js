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

export const code = `def fractionAddition(expression):
    num, den = 0, 1
    for n, d in fractions(expression):
        num, den = num * d + n * den, den * d
        g = gcd(num, den)
        num, den = num // g, den // g
    return f"{num}/{den}"`.split('\n').map((text, index) => ({ line: index + 1, text }))
