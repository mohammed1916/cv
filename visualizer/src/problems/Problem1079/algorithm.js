export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.tiles !== 'string') throw new Error('Use an object with a string "tiles".')
  const { tiles } = input
  if (tiles.length < 1 || tiles.length > 7) throw new Error('tiles holds 1 to 7 uppercase letters.')
  if (!/^[A-Z]+$/.test(tiles)) throw new Error('tiles may contain only uppercase letters A to Z.')
  return { tiles }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function numTilePossibilities(tiles) {', 'def num_tile_possibilities(tiles):'],
  ['  const counts = new Map()', '    counts = {}'],
  ['  for (const letter of tiles) counts.set(letter, (counts.get(letter) || 0) + 1)', '    for letter in tiles: counts[letter] = counts.get(letter, 0) + 1'],
  ['  let total = 0', '    total = 0'],
  ['  const build = () => {', '    def build():'],
  ['    // each call extends the sequence by one tile', '        nonlocal total'],
  ['    for (const letter of [...counts.keys()].sort()) {', '        for letter in sorted(counts):'],
  ['      if (counts.get(letter) === 0) continue', '            if counts[letter] == 0: continue'],
  ['      counts.set(letter, counts.get(letter) - 1)', '            counts[letter] -= 1'],
  ['      total++', '            total += 1'],
  ['      build()', '            build()'],
  ['      counts.set(letter, counts.get(letter) + 1)', '            counts[letter] += 1'],
  ['    }', ''],
  ['  }', ''],
  ['  build()', '    build()'],
  ['  return total', '    return total'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { tiles } = input
  const counts = new Map()
  for (const letter of tiles) counts.set(letter, (counts.get(letter) || 0) + 1)
  const letters = [...counts.keys()].sort()
  const frames = [{ phase: 'start', pythonLine: P('counts = {}'), activeLine: L('const counts'), letter: null, word: '', total: 0, message: 'Count the tiles of each letter, then build sequences from them.' }]
  const word = []
  let total = 0
  const build = () => {
    for (const letter of letters) {
      if (counts.get(letter) === 0) continue
      counts.set(letter, counts.get(letter) - 1)
      word.push(letter)
      total++
      frames.push({ phase: 'use', pythonLine: P('total += 1'), activeLine: L('total++'), letter, word: word.join(''), total, message: `Use ${letter}: "${word.join('')}" is one more sequence.` })
      build()
      word.pop()
      counts.set(letter, counts.get(letter) + 1)
      frames.push({ phase: 'back', pythonLine: P('counts[letter] += 1'), activeLine: L('counts.set(letter, counts.get(letter) + 1)'), letter, word: word.join(''), total, message: `Put ${letter} back and try the next letter.` })
    }
  }
  build()
  frames.push({ phase: 'done', pythonLine: P('return total'), activeLine: L('return total'), letter: null, word: '', total, message: `${total} non-empty sequences can be made.` })
  return { input, result: total, frames }
}
