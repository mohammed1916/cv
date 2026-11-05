const PL = s => python.split('\n').findIndex(line => line.trim() === s) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with num.')
  const { num } = input
  if (typeof num !== 'string' || num.length < 1 || num.length > 14 || !/^[0-9]+$/.test(num)) throw new Error('num is 1 to 14 digits.')
  if (num.length > 1 && num[0] === '0') throw new Error('num has no leading zero.')
  return { num }
}

export function buildTrace({ num }) {
  const n = num.length
  const frames = []
  let best = n
  frames.push({ pythonLine: PL('best = n'), phase: 'start', activeLine: L('let best = n'), pair: null, p: -1, q: -1, best, message: `Deleting every digit costs ${n}; start with that as the best.` })
  if (num.includes('0')) {
    best = n - 1
    frames.push({ pythonLine: PL('best = n - 1'), phase: 'zero', activeLine: L("includes('0')"), pair: null, p: -1, q: -1, best, message: `A zero exists: keep one 0 and delete the other ${n - 1} digits.` })
  }
  for (const pair of ['00', '25', '50', '75']) {
    const [a, b] = pair
    const p = num.lastIndexOf(b)
    if (p === -1) {
      frames.push({ pythonLine: PL('if p == -1:'), phase: 'pair', activeLine: L('lastIndexOf(b)'), pair, p, q: -1, best, message: `No ${b} in num; ${pair} is impossible.` })
      continue
    }
    const q = p > 0 ? num.lastIndexOf(a, p - 1) : -1
    if (q === -1) {
      frames.push({ pythonLine: PL('if q == -1:'), phase: 'pair', activeLine: L('lastIndexOf(b)'), pair, p, q, best, message: `No ${a} before position ${p}; ${pair} is impossible.` })
      continue
    }
    best = Math.min(best, n - 2 - q)
    frames.push({ pythonLine: PL('best = min(best, n - 2 - q)'), phase: 'found', activeLine: L('best = Math.min'), pair, p, q, best, message: `Keep ${a} at ${q} and ${b} at ${p}; ${n - 2 - q} deletions.` })
  }
  frames.push({ pythonLine: PL('return best'), phase: 'done', activeLine: L('return best'), pair: null, p: -1, q: -1, best, result: best, message: `The fewest deletions is ${best}.` })
  return { input: { num }, result: best, frames }
}

export const code = `const n = num.length
let best = n
if (num.includes('0')) best = n - 1
for (const [a, b] of ['00', '25', '50', '75']) {
  const p = num.lastIndexOf(b)
  if (p === -1) continue
  const q = p > 0 ? num.lastIndexOf(a, p - 1) : -1
  if (q === -1) continue
  best = Math.min(best, n - 2 - q)
}
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations_special(num):
    n = len(num)
    best = n
    if '0' in num:
        best = n - 1
    for pair in ('00', '25', '50', '75'):
        a, b = pair
        p = num.rfind(b)
        if p == -1:
            continue
        q = num.rfind(a, 0, p)
        if q == -1:
            continue
        best = min(best, n - 2 - q)
    return best
`
