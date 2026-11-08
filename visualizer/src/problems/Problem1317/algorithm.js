export const phases = [
  { id: 'start', label: 'Start', description: 'Look for a split n = a + b where neither part contains the digit 0.' },
  { id: 'try', label: 'Try a', description: 'Try a candidate a, which sets b = n - a.' },
  { id: 'reject', label: 'Contains zero', description: 'a or b has a 0 digit, so this split is not allowed.' },
  { id: 'accept', label: 'No-zero split', description: 'Neither a nor b contains a 0 digit, so this split is the answer.' },
  { id: 'done', label: 'Complete', description: 'Return the two no-zero integers.' },
]

export const examples = [
  { label: 'Zero in the tens', input: '{"n":1010}' },
  { label: 'Small value', input: '{"n":11}' },
  { label: 'Larger value', input: '{"n":3456}' },
    { label: "Smallest n", input: "{\"n\":2}" },
    { label: "Small power of two", input: "{\"n\":4}" },
    { label: "Largest n", input: "{\"n\":10000}" },
    { label: "Long run: generated n", input: "{\"n\":9079}" },
]

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a whole number n, or an object such as {"n":1010}.') }
  const n = typeof data === 'number' ? data : data && typeof data === 'object' ? data.n : undefined
  if (!Number.isInteger(n)) throw new Error('Use a whole number n, or an object such as {"n":1010}.')
  if (n < 2 || n > 10000) throw new Error('n must be from 2 to 10000 in this visualization.')
  return n
}

const hasZero = x => String(x).includes('0')

export function buildTrace(n) {
  const frames = [{ phase: 'start', activeLine: L('for (let a = 1'), pythonLine: P('for a in range'), snapshot: { n, a: null, b: null },
    message: `Find a + b = ${n} where neither a nor b contains the digit 0.` }]
  let answer = null
  for (let a = 1; a < n; a++) {
    const b = n - a
    frames.push({ phase: 'try', activeLine: L('const b = n - a'), pythonLine: P('b = n - a'), snapshot: { n, a, b },
      message: `Try a = ${a} and b = ${b}.` })
    if (!hasZero(a) && !hasZero(b)) {
      answer = [a, b]
      frames.push({ phase: 'accept', activeLine: L('return [a, b]'), pythonLine: P('return [a, b]'), snapshot: { n, a, b, ok: true },
        message: `${a} and ${b} have no 0 digit, so the split works.` })
      break
    }
    frames.push({ phase: 'reject', activeLine: L('if (!hasZero'), pythonLine: P('if "0" not in'), snapshot: { n, a, b, ok: false },
      message: `${hasZero(a) ? `${a} contains 0` : `${b} contains 0`}, so try the next a.` })
  }
  frames.push({ phase: 'done', activeLine: L('return [a, b]'), pythonLine: P('return [a, b]'), snapshot: { n, a: answer?.[0] ?? null, b: answer?.[1] ?? null },
    message: `Return [${answer.join(', ')}].`, result: answer })
  return { input: n, result: answer, frames }
}

export const code = `function getNoZeroIntegers(n) {
  for (let a = 1; a < n; a++) {
    const b = n - a
    if (!hasZero(a) && !hasZero(b)) return [a, b]
  }
  return []
}

function hasZero(x) {
  return String(x).includes('0')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def get_no_zero_integers(n):
    for a in range(1, n):
        b = n - a
        if "0" not in str(a) and "0" not in str(b):
            return [a, b]
    return []
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
