export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.tiles !== 'string') throw new Error('Use an object with a string "tiles".')
  const { tiles } = input
  if (tiles.length < 1 || tiles.length > 7) throw new Error('tiles holds 1 to 7 uppercase letters.')
  if (!/^[A-Z]+$/.test(tiles)) throw new Error('tiles may contain only uppercase letters A to Z.')
  return { tiles }
}

export function buildTrace(input) {
  const { tiles } = input
  const counts = new Map()
  for (const letter of tiles) counts.set(letter, (counts.get(letter) || 0) + 1)
  const letters = [...counts.keys()].sort()
  const frames = [{ phase: 'start', activeLine: L('count the tiles of each letter'), letter: null, word: '', total: 0, message: 'Count the tiles of each letter, then build sequences from them.' }]
  const word = []
  let total = 0
  const build = () => {
    for (const letter of letters) {
      if (counts.get(letter) === 0) continue
      counts.set(letter, counts.get(letter) - 1)
      word.push(letter)
      total++
      frames.push({ phase: 'use', activeLine: L('add one to the count'), letter, word: word.join(''), total, message: `Use ${letter}: "${word.join('')}" is one more sequence.` })
      build()
      word.pop()
      counts.set(letter, counts.get(letter) + 1)
      frames.push({ phase: 'back', activeLine: L('put the tile back'), letter, word: word.join(''), total, message: `Put ${letter} back and try the next letter.` })
    }
  }
  build()
  frames.push({ phase: 'done', activeLine: L('return the number of sequences'), letter: null, word: '', total, message: `${total} non-empty sequences can be made.` })
  return { input, result: total, frames }
}

export const code = `count the distinct non-empty sequences that can be made from the tiles
  count the tiles of each letter
  call build with an empty sequence
  return the number of sequences
build the sequence
  for each letter that still has a tile
    use one tile of that letter, extend the sequence and add one to the count
    call build again
    put the tile back`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_tile_possibilities(tiles):
    counts = {}
    for letter in tiles:
        counts[letter] = counts.get(letter, 0) + 1
    total = 0

    def build():
        nonlocal total
        for letter in sorted(counts):
            if counts[letter] == 0:
                continue
            counts[letter] -= 1
            total += 1
            build()
            counts[letter] += 1

    build()
    return total
`
