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

export const code = `count valid words for each puzzle(words, puzzles):
  set counts to an empty table keyed by letter-set mask
  for each word, add one to the count for the mask of its letters
  set answer to an empty list
  for each puzzle:
    set total to 0
    for each subset of the puzzle's other six letters:
      set mask to the subset plus the puzzle's first letter
      add the count stored for mask to total
    append total to answer
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ words, puzzles }) {
  const counts = new Map()
  for (const word of words) counts.set(maskOf(word), (counts.get(maskOf(word)) ?? 0) + 1)
  const frames = [{ phase: 'start', activeLine: L('set counts'), puzzle: -1, subset: null, total: 0, answer: [], message: `Grouped ${words.length} words into ${counts.size} distinct letter sets.` }]
  const answer = []
  puzzles.forEach((puzzle, index) => {
    const first = bit(puzzle[0])
    const rest = [...puzzle.slice(1)].map(bit)
    let total = 0
    frames.push({ phase: 'puzzle', activeLine: L('for each puzzle'), puzzle: index, subset: null, total: 0, answer: [...answer], message: `Puzzle ${puzzle}: a valid word must contain ${puzzle[0]}.` })
    for (let s = 0; s < 1 << rest.length; s++) {
      let mask = first
      rest.forEach((b, i) => { if ((s >> i) & 1) mask |= b })
      const count = counts.get(mask) ?? 0
      total += count
      frames.push({ phase: 'subset', activeLine: L('add the count stored'), puzzle: index, subset: mask, total, answer: [...answer], message: `Letter set ${lettersOf(mask)}: ${count} word(s) match, total ${total}.` })
    }
    answer.push(total)
  })
  frames.push({ phase: 'done', activeLine: L('return answer'), puzzle: -1, subset: null, total: 0, answer: [...answer], message: `Counts for each puzzle: ${answer.join(', ')}.` })
  return { input: { words, puzzles }, words, puzzles, result: answer, frames }
}

export const python = `def count_valid_words(words, puzzles):
    counts = {}
    for word in words:
        mask = 0
        for ch in word:
            mask |= 1 << (ord(ch) - 97)
        counts[mask] = counts.get(mask, 0) + 1
    answer = []
    for puzzle in puzzles:
        first = 1 << (ord(puzzle[0]) - 97)
        rest = [1 << (ord(ch) - 97) for ch in puzzle[1:]]
        total = 0
        for subset in range(1 << len(rest)):
            mask = first
            for i, bit in enumerate(rest):
                if (subset >> i) & 1:
                    mask |= bit
            total += counts.get(mask, 0)
        answer.append(total)
    return answer
`
