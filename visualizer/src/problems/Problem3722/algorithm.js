
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
    frames.push({ pythonLine: P('if best is None'), phase: 'try', activeLine: L('const front'), k, side, candidate, best, improved,
      message: `${side === 'front' ? `Reverse the first ${k}` : `Reverse the last ${k}`} letters: ${candidate}${improved ? ' (new best)' : ''}.` })
  }
  for (let k = 1; k <= n; k++) {
    consider(s.slice(0, k).split('').reverse().join('') + s.slice(k), 'front', k)
    consider(s.slice(0, n - k) + s.slice(n - k).split('').reverse().join(''), 'back', k)
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), k: null, side: null, candidate: best, best, improved: false,
    message: `Smallest string after exactly one reversal: ${best}.` })
  return { input: { s }, result: best, frames }
}

export const code = `function smallestAfterReverse(s) {
  const n = s.length
  let best = null
  for (let k = 1; k <= n; k++) {
    const front = [...s.slice(0, k)].reverse().join('') + s.slice(k)
    const back = s.slice(0, n - k) + [...s.slice(n - k)].reverse().join('')
    for (const candidate of [front, back]) {
      if (best === null || candidate < best) best = candidate
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

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
