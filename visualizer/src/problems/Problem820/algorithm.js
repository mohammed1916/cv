export function parseInput(text) {
  const words = JSON.parse(text)
  if (!Array.isArray(words) || words.length < 1 || words.length > 2000 || words.some(w => typeof w !== 'string' || !/^[a-z]{1,7}$/.test(w))) throw new Error('Enter 1–2,000 lowercase words of 1–7 letters.')
  return words
}

const JS_LINES = [
  'function minimumLengthEncoding(words) {',
  '  const kept = new Set(words) // every distinct word starts as a reference',
  '  for (const w of words) {',
  '    for (let k = 1; k < w.length; k++) kept.delete(w.slice(k)) // a proper suffix of w is covered by w',
  '  }',
  '  let total = 0',
  '  for (const w of kept) total += w.length + 1 // each kept word costs its letters plus \'#\'',
  '  return total',
  '}',
]
const PY_LINES = [
  'def minimum_length_encoding(words):',
  '    kept = set(words)',
  '    for w in words:',
  '        for k in range(1, len(w)):',
  '            kept.discard(w[k:])',
  '    return sum(len(w) + 1 for w in kept)',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// A word is needed only if no other word ends with it. Removing every proper suffix of each word leaves exactly those.
export function buildTrace(words) {
  const kept = new Set(words)
  const frames = [{ phase: 'start', word: null, kept: [...kept], removed: [], total: 0, activeLine: L('const kept = new Set'), pythonLine: P('kept = set'), message: 'Every distinct word starts as a reference.' }]
  for (const w of words) {
    const removed = []
    for (let k = 1; k < w.length; k++) {
      const suffix = w.slice(k)
      if (kept.delete(suffix)) removed.push(suffix)
    }
    frames.push({ phase: removed.length ? 'cover' : 'scan', word: w, kept: [...kept], removed, total: 0, activeLine: L('a proper suffix of w'), pythonLine: P('kept.discard'),
      message: removed.length ? `"${w}" covers ${removed.map(s => `"${s}"`).join(', ')}, which no longer need their own references.` : `"${w}" covers no other word.` })
  }
  let total = 0
  for (const w of kept) total += w.length + 1
  frames.push({ phase: 'done', word: null, kept: [...kept], removed: [], total, result: total, activeLine: L('return total'), pythonLine: P('return sum'), message: `Kept ${kept.size} word${kept.size === 1 ? '' : 's'}; the encoding has length ${total}.` })
  return { input: words, result: total, frames }
}
