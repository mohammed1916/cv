export const phases = [
  { id: 'try', label: 'Try a split', description: 'Take a and b = n - a, then check both for a zero digit. Any zero digit rules the split out.' },
  { id: 'accept', label: 'Accept split', description: 'Both parts are positive and have no zero digit, so this split is the answer.' },
  { id: 'done', label: 'Complete', description: 'Return the first split that works.' },
]

export function parseInput(text) {
  const s = text.trim()
  if (!/^\d+$/.test(s)) throw new Error('Enter one whole number.')
  const n = Number(s)
  if (n < 2 || n > 10000) throw new Error('n is an integer from 2 to 10000.')
  return n
}

const hasZero = x => String(x).includes('0')

export function buildTrace(n) {
  const frames = []
  let answer = null
  for (let a = 1; a < n; a++) {
    const b = n - a
    if (hasZero(a) || hasZero(b)) {
      frames.push({ phase: 'try', activeLine: L('if has_zero'), pythonLine: P('if has_zero(a)'), snapshot: { n, a, b, zeroIn: hasZero(a) ? a : b },
        message: `Try ${a} + ${b}. ${hasZero(a) ? `${a}` : `${b}`} contains a zero digit, so reject it.` })
      continue
    }
    frames.push({ phase: 'try', activeLine: L('if has_zero'), pythonLine: P('if has_zero(a)'), snapshot: { n, a, b, zeroIn: null },
      message: `Try ${a} + ${b}. Neither ${a} nor ${b} contains a zero digit.` })
    answer = [a, b]
    frames.push({ phase: 'accept', activeLine: L('return [a, n - a]'), pythonLine: P('return [a'), snapshot: { n, a, b, zeroIn: null },
      message: `${a} and ${b} are both positive with no zero digit, and ${a} + ${b} = ${n}.` })
    break
  }
  frames.push({ phase: 'done', activeLine: L('return [a, n - a]'), pythonLine: P('return [a'), snapshot: { n, a: answer?.[0] ?? null, b: answer?.[1] ?? null, zeroIn: null },
    message: `The answer is [${answer.join(', ')}].` })
  return { input: n, result: answer, frames }
}

export const code = `no zero pair(n):
  for a from 1 to n - 1:
    b = n - a
    if has_zero(a) or has_zero(b): continue to the next a
    return [a, n - a]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def no_zero_integers(n):
    def has_zero(x):
        return '0' in str(x)
    for a in range(1, n):
        if has_zero(a) or has_zero(n - a):
            continue
        return [a, n - a]`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
