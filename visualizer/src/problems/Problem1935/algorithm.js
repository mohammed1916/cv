// LeetCode 1935: a word is typable when none of its letters is broken.
const SOURCE = [
  "function canBeTypedWords(text, brokenLetters) {",
  "  const broken = new Set(brokenLetters)",
  "  let typable = 0",
  "  for (const word of text.split(' ')) {",
  "    if (![...word].some(ch => broken.has(ch))) typable++",
  "  }",
  "  return typable",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def can_be_typed_words(text, broken_letters):
    broken = set(broken_letters)
    typable = 0
    for word in text.split(" "):
        if not any(ch in broken for ch in word):
            typable += 1
    return typable
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'check', label: 'Check words', description: 'Look for a broken letter in each word.' },
  { id: 'done', label: 'Result', description: 'Count the typable words.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"text":"tree sun","broken":"xq"}.') }
  const { text: words, broken } = input || {}
  if (typeof words !== 'string' || words.length === 0 || words.startsWith(' ') || words.endsWith(' ') || words.includes('  ')) throw new Error('text is words separated by single spaces.')
  if (words.split(' ').length > 10) throw new Error('Use at most 10 words for the visualization.')
  if (typeof broken !== 'string' || !/^[a-z]*$/.test(broken) || new Set(broken).size !== broken.length) throw new Error('broken lists distinct lowercase letters.')
  return { text: words, broken }
}

export function buildTrace({ text, broken }) {
  const set = new Set(broken)
  const words = text.split(' ')
  const frames = []
  let typable = 0
  const verdicts = []
  for (const word of words) {
    const bad = [...word].find(ch => set.has(ch))
    const ok = bad === undefined
    if (ok) typable++
    verdicts.push({ word, ok, bad: bad ?? null })
    frames.push({ phase: 'check', activeLine: L('for (const word of'), pythonLine: P('for word in'), message: ok ? `"${word}" has no broken letter.` : `"${word}" contains broken letter ${bad}.`, verdicts: [...verdicts], typable })
  }
  frames.push({ phase: 'done', activeLine: L('return typable'), pythonLine: P('return typable'), message: `${typable} word(s) can be typed.`, verdicts: [...verdicts], typable })
  return { input: { text, broken }, result: typable, frames }
}
