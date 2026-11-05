const LETTERS = 'abcdefghijklmnopqrstuvwxyz'
const MAX_WORDS = 12
const MAX_PUZZLES = 6

export function parseInput(text) {
  const data = JSON.parse(text)
  const words = data?.words
  const puzzles = data?.puzzles
  if (!Array.isArray(words) || words.length < 1 || words.length > MAX_WORDS) throw new Error(`words must list 1 to ${MAX_WORDS} entries.`)
  if (!Array.isArray(puzzles) || puzzles.length < 1 || puzzles.length > MAX_PUZZLES) throw new Error(`puzzles must list 1 to ${MAX_PUZZLES} entries.`)
  for (const w of words) {
    if (typeof w !== 'string' || w.length < 1 || w.length > 8 || ![...w].every(ch => LETTERS.includes(ch))) throw new Error('Each word is 1 to 8 lowercase letters.')
  }
  for (const p of puzzles) {
    if (typeof p !== 'string' || p.length !== 7 || ![...p].every(ch => LETTERS.includes(ch)) || new Set(p).size !== 7) throw new Error('Each puzzle is 7 distinct lowercase letters.')
  }
  return { words, puzzles }
}

const bit = ch => 1 << (ch.charCodeAt(0) - 97)
const maskOf = word => [...word].reduce((mask, ch) => mask | bit(ch), 0)
const lettersOf = mask => [...LETTERS].filter((_, i) => (mask >> i) & 1).join('')

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function countValidWords(words, puzzles) {', 'def count_valid_words(words, puzzles):'],
  ['  const counts = new Map()', '    counts = {}'],
  ['  for (const word of words) {', '    for word in words:'],
  ['    let mask = 0', '        mask = 0'],
  ['    for (const ch of word) mask |= 1 << (ch.charCodeAt(0) - 97)', '        for ch in word: mask |= 1 << (ord(ch) - 97)'],
  ['    counts.set(mask, (counts.get(mask) ?? 0) + 1)', '        counts[mask] = counts.get(mask, 0) + 1'],
  ['  }', ''],
  ['  const answer = []', '    answer = []'],
  ['  for (const puzzle of puzzles) {', '    for puzzle in puzzles:'],
  ['    const first = 1 << (puzzle.charCodeAt(0) - 97)', '        first = 1 << (ord(puzzle[0]) - 97)'],
  ['    const rest = [...puzzle.slice(1)].map(bit)', '        rest = [1 << (ord(ch) - 97) for ch in puzzle[1:]]'],
  ['    let total = 0', '        total = 0'],
  ['    for (let s = 0; s < 1 << rest.length; s++) {', '        for subset in range(1 << len(rest)):'],
  ['      let mask = first', '            mask = first'],
  ['      for (let i = 0; i < rest.length; i++) if ((s >> i) & 1) mask |= rest[i]', '            for i, b in enumerate(rest):'],
  ['      // bit i of the subset says whether rest[i] is used', '                if (subset >> i) & 1: mask |= b'],
  ['      total += counts.get(mask) ?? 0', '            total += counts.get(mask, 0)'],
  ['    }', ''],
  ['    answer.push(total)', '        answer.append(total)'],
  ['  }', ''],
  ['  return answer', '    return answer'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ words, puzzles }) {
  const counts = new Map()
  for (const word of words) counts.set(maskOf(word), (counts.get(maskOf(word)) ?? 0) + 1)
  const frames = [{ phase: 'start', pythonLine: P('counts = {}'), activeLine: L('const counts'), puzzle: -1, subset: null, total: 0, answer: [], message: `Grouped ${words.length} words into ${counts.size} distinct letter sets.` }]
  const answer = []
  puzzles.forEach((puzzle, index) => {
    const first = bit(puzzle[0])
    const rest = [...puzzle.slice(1)].map(bit)
    let total = 0
    frames.push({ phase: 'puzzle', pythonLine: P('for puzzle in puzzles'), activeLine: L('for (const puzzle of puzzles)'), puzzle: index, subset: null, total: 0, answer: [...answer], message: `Puzzle ${puzzle}: a valid word must contain ${puzzle[0]}.` })
    for (let s = 0; s < 1 << rest.length; s++) {
      let mask = first
      rest.forEach((b, i) => { if ((s >> i) & 1) mask |= b })
      const count = counts.get(mask) ?? 0
      total += count
      frames.push({ phase: 'subset', pythonLine: P('total += counts.get(mask, 0)'), activeLine: L('total += counts.get(mask)'), puzzle: index, subset: mask, total, answer: [...answer], message: `Letter set ${lettersOf(mask)}: ${count} word(s) match, total ${total}.` })
    }
    answer.push(total)
  })
  frames.push({ phase: 'done', pythonLine: P('return answer'), activeLine: L('return answer'), puzzle: -1, subset: null, total: 0, answer: [...answer], message: `Counts for each puzzle: ${answer.join(', ')}.` })
  return { input: { words, puzzles }, words, puzzles, result: answer, frames }
}
