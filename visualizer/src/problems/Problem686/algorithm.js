export function parseInput(text) {
  const data = JSON.parse(text)
  const { a, b } = data ?? {}
  const lower = s => typeof s === 'string' && /^[a-z]{1,10000}$/.test(s)
  if (!lower(a) || !lower(b) || a.length > 200 || b.length > 200) throw new Error('a and b must be lowercase strings of up to 200 letters.')
  return { a, b }
}

// Repeat a until b could fit. If b is inside a^k, then k is at most ceil(|b| / |a|) + 1, so try that many copies.
export function buildTrace({ a, b }) {
  const limit = Math.ceil(b.length / a.length) + 1
  let repeated = ''
  let result = -1
  const frames = [{ phase: 'start', count: 0, text: '', at: -1, limit, activeLine: L('const limit = '), pythonLine: P('limit = '), message: `Try up to ${limit} copies of ${a}.` }]
  for (let count = 1; count <= limit; count++) {
    repeated += a
    const at = repeated.indexOf(b)
    frames.push({ phase: 'repeat', count, text: repeated, at, matchLength: b.length, limit, activeLine: L('repeated += a'), pythonLine: P('repeated += a'), message: `${count} cop${count === 1 ? 'y' : 'ies'}: ${at >= 0 ? `b starts at index ${at}.` : 'b is not inside yet.'}` })
    if (at >= 0) { result = count; break }
  }
  frames.push({ phase: 'done', count: result, text: repeated, at: -1, limit, result, activeLine: L('return -1'), pythonLine: P('return -1'), message: result === -1 ? 'No number of copies contains b.' : `${result} copies are needed.` })
  return { input: { a, b }, result, frames }
}

const SOURCE = `function repeatedStringMatch(a, b) {
  const limit = Math.ceil(b.length / a.length) + 1
  let repeated = ''
  for (let count = 1; count <= limit; count++) {
    repeated += a
    if (repeated.includes(b)) return count
  }
  return -1
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import math


def repeated_string_match(a, b):
    limit = math.ceil(len(b) / len(a)) + 1
    repeated = ''
    for count in range(1, limit + 1):
        repeated += a
        if b in repeated:
            return count
    return -1`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
