export function parseInput(text) {
  const words = JSON.parse(text)
  if (!Array.isArray(words) || words.length < 1 || words.length > 100 || words.some(w => typeof w !== 'string' || !/^[a-z]{1,12}$/.test(w))) throw new Error('Enter 1–100 lowercase words of 1–12 letters.')
  return words
}

const MORSE = ['.-', '-...', '-.-.', '-..', '.', '..-.', '--.', '....', '..', '.---', '-.-', '.-..', '--', '-.', '---', '.--.', '--.-', '.-.', '...', '-', '..-', '...-', '.--', '-..-', '-.--', '--..']

const JS_LINES = [
  'function uniqueMorseRepresentations(words) {',
  '  const seen = new Set() // distinct concatenations of Morse codes',
  '  for (const word of words) {',
  '    let code = \'\'',
  '    for (const ch of word) code += MORSE[ch.charCodeAt(0) - 97] // append each letter\'s code',
  '    seen.add(code)',
  '  }',
  '  return seen.size // return the number of distinct transformations',
  '}',
]
const PY_LINES = [
  'def unique_morse_representations(words):',
  '    seen = set()',
  '    for word in words:',
  '        code = \'\'.join(MORSE[ord(ch) - ord(\'a\')] for ch in word)',
  '        seen.add(code)',
  '    return len(seen)',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Each word becomes one string of dots and dashes. Two words are the same representation if their strings match.
export function buildTrace(words) {
  const seen = new Set()
  const rows = []
  const frames = [{ phase: 'start', index: -1, rows: [], distinct: 0, activeLine: L('const seen = new Set'), pythonLine: P('seen = set()'), message: 'Turn each word into dots and dashes, then count distinct strings.' }]
  words.forEach((word, i) => {
    const code = [...word].map(ch => MORSE[ch.charCodeAt(0) - 97]).join('')
    const fresh = !seen.has(code)
    seen.add(code)
    rows.push({ word, code, fresh })
    frames.push({ phase: fresh ? 'new' : 'repeat', index: i, rows: rows.map(r => ({ ...r })), distinct: seen.size, activeLine: L('seen.add(code)'), pythonLine: P('seen.add(code)'),
      message: fresh ? `"${word}" becomes ${code}: a new representation.` : `"${word}" becomes ${code}, which is already in the set.` })
  })
  const result = seen.size
  frames.push({ phase: 'done', index: words.length - 1, rows: rows.map(r => ({ ...r })), distinct: result, result, activeLine: L('return seen.size'), pythonLine: P('return len(seen)'), message: `${result} distinct representation${result === 1 ? '' : 's'}.` })
  return { input: words, result, frames }
}
