export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[0-9]+$/.test(s)) throw new Error('s has 1 to 30 digits.')
  return { s }
}

export const code = `good indices of a digit string
  result = []
  for i from 0 to len(s) minus 1
    t = decimal text of i
    start = i minus len(t) plus 1
    if start is at least 0 and s from start through i equals t
      append i to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing pseudocode: ${s}`); return i + 1 }

export const python = `def good_indices(s):
    result = []
    for i in range(len(s)):
        t = str(i)
        start = i - len(t) + 1
        if start >= 0 and s[start:i + 1] == t:
            result.append(i)
    return result`
const PY = python.split('\n')
const Q = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing python: ${s}`); return i + 1 }

export function buildTrace({ s }) {
  const frames = []
  const result = []
  frames.push({ phase: 'start', index: -1, text: '', start: -1, window: null, ok: null, result: [], pythonLine: Q('result = []'), activeLine: L('result = []'), message: `Check each of the ${s.length} indices against its own decimal text.` })
  for (let i = 0; i < s.length; i++) {
    const t = String(i)
    const start = i - t.length + 1
    const window = start >= 0 ? s.slice(start, i + 1) : null
    const ok = start >= 0 && window === t
    frames.push({ phase: 'check', index: i, text: t, start, window, ok, result: [...result], pythonLine: Q('t = str(i)'), activeLine: L('t = decimal text'), message: start < 0 ? `${t} needs ${t.length} digit(s) ending at ${i}, which runs before the string starts.` : `Compare s[${start}..${i}] = "${window}" with "${t}": ${ok ? 'equal' : 'different'}.` })
    if (ok) {
      result.push(i)
      frames.push({ phase: 'match', index: i, text: t, start, window, ok, result: [...result], pythonLine: Q('result.append(i)'), activeLine: L('append i to result'), message: `Index ${i} is good.` })
    }
  }
  frames.push({ phase: 'done', index: -1, text: '', start: -1, window: null, ok: null, result: [...result], pythonLine: Q('return result'), activeLine: L('return result'), message: result.length ? `Good indices: ${result.join(', ')}.` : 'No index is good.' })
  return { input: { s }, result, frames }
}
