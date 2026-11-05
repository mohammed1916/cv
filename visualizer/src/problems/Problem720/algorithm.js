// The input box takes an object with words, as the trie-family visualizer does.
export function parseInput(text) {
  const words = JSON.parse(text)?.words
  if (!Array.isArray(words) || words.length < 1 || words.length > 1000 || words.some(w => typeof w !== 'string' || !/^[a-z]{1,30}$/.test(w))) throw new Error('Enter a JSON array of 1–1,000 lowercase words of 1–30 letters.')
  return words
}

const JS_LINES = [
  'function longestWord(words) {',
  '  const built = new Set([\'\']) // every word that can be built so far; the empty prefix is a start',
  '  const sorted = [...words].sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0)) // shorter first, then alphabetical',
  '  let best = \'\'',
  '  for (const word of sorted) {',
  '    const buildable = built.has(word.slice(0, -1)) // every shorter prefix must be a buildable word',
  '    if (buildable) {',
  '      built.add(word)',
  '      if (word.length > best.length) best = word // a shorter-first scan keeps the smallest tie',
  '    }',
  '  }',
  '  return best // return best',
  '}',
]
const PY_LINES = [
  'def longest_word(words):',
  '    built = {\'\'}',
  '    best = \'\'',
  '    for word in sorted(words, key=lambda w: (len(w), w)):',
  '        if word[:-1] in built:',
  '            built.add(word)',
  '            if len(word) > len(best):',
  '                best = word',
  '    return best',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Words are checked shortest first. A word is buildable when the word minus its last letter is already buildable.
export function buildTrace(words) {
  const sorted = [...new Set(words)].sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0))
  const built = new Set([''])
  let best = ''
  const rows = []
  const frames = [{ phase: 'start', current: null, rows: [], best, activeLine: L('const built'), pythonLine: P("built = {''}"), message: 'The empty prefix counts as built, so every single letter word can start a chain.' }]
  for (const word of sorted) {
    const parent = word.slice(0, -1)
    const buildable = built.has(parent)
    if (buildable) { built.add(word); if (word.length > best.length) best = word }
    rows.push({ word, parent: parent === '' ? '(empty)' : parent, buildable })
    frames.push({ phase: buildable ? 'build' : 'skip', current: word, rows: rows.map(r => ({ ...r })), best,
      activeLine: L(buildable ? 'built.add(word)' : 'const buildable'), pythonLine: P(buildable ? 'built.add(word)' : 'if word[:-1] in built'),
      message: buildable ? `"${word}" can be built: "${parent || 'nothing'}" is buildable, so "${word}" joins the set.` : `"${word}" cannot be built, because "${parent}" is not in the buildable set.` })
  }
  frames.push({ phase: 'done', current: null, rows: rows.map(r => ({ ...r })), best, result: best, activeLine: L('return best'), pythonLine: P('return best'), message: best ? `Longest buildable word: "${best}".` : 'No word can be built one letter at a time, so the answer is the empty string.' })
  return { input: words, result: best, frames }
}
