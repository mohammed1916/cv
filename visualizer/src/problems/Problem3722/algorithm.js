const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 50 || !/^[a-z]+$/.test(s)) throw new Error('Use a JSON string of 1 to 50 lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  const n = s.length
  const frames = []
  let best = null
  const consider = (candidate, side, k) => {
    const improved = best === null || candidate < best
    if (improved) best = candidate
    frames.push({ pythonLine: PY('if best is None'), phase: 'try', activeLine: L('candidate'), k, side, candidate, best, improved,
      message: `${side === 'front' ? `Reverse the first ${k}` : `Reverse the last ${k}`} letters: ${candidate}${improved ? ' (new best)' : ''}.` })
  }
  for (let k = 1; k <= n; k++) {
    consider(s.slice(0, k).split('').reverse().join('') + s.slice(k), 'front', k)
    consider(s.slice(0, n - k) + s.slice(n - k).split('').reverse().join(''), 'back', k)
  }
  frames.push({ pythonLine: PY('return best'), phase: 'done', activeLine: L('return'), k: null, side: null, candidate: best, best, improved: false,
    message: `Smallest string after exactly one reversal: ${best}.` })
  return { input: { s }, result: best, frames }
}

export const code = [
  'smallest string after exactly one prefix or suffix reversal',
  '  best = none',
  '  for each k from 1 to n',
  '    candidate one reverses the first k letters',
  '    candidate two reverses the last k letters',
  '    keep the smallest candidate seen so far',
  '  return best',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def smallest_after_reverse(s):
    n = len(s)
    best = None
    for k in range(1, n + 1):
        front = s[:k][::-1] + s[k:]
        back = s[:n - k] + s[n - k:][::-1]
        for candidate in (front, back):
            if best is None or candidate < best:
                best = candidate
    return best
`
