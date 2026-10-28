export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with a string s.')
  const { s } = data
  if (typeof s !== 'string' || !/^[a-z]{1,16}$/.test(s)) throw new Error('s must be 1 to 16 lowercase letters.')
  return { s }
}

export function buildTrace(input) {
  const s = input.s
  let pieces = 1
  let seen = new Set()
  let start = 0
  const frames = [{ phase: 'start', activeLine: L('set pieces to one'), index: -1, start: 0, pieces, seen: [], message: 'Start the first piece with no letters seen.' }]
  for (let i = 0; i < s.length; i++) {
    if (seen.has(s[i])) {
      pieces += 1
      seen = new Set()
      start = i
      frames.push({ phase: 'cut', activeLine: L('start a new piece'), index: i, start, pieces, seen: [], message: `${s[i]} repeats, so cut before it and start piece ${pieces}.` })
    }
    seen.add(s[i])
    frames.push({ phase: 'letter', activeLine: L('add the letter to seen'), index: i, start, pieces, seen: [...seen], message: `Add ${s[i]} to the current piece.` })
  }
  frames.push({ phase: 'done', activeLine: L('return pieces'), index: -1, start, pieces, seen: [...seen], message: `Minimum number of pieces: ${pieces}.` })
  return { input, result: pieces, frames }
}

export const code = `minimum number of pieces, each with distinct letters:
  set pieces to one and seen to an empty set
  for each letter in order
    if the letter is already in seen then
      start a new piece: add one to pieces and empty seen
    add the letter to seen
  return pieces`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def optimal_partition(s):
    pieces = 1
    seen = set()
    for c in s:
        if c in seen:
            pieces += 1
            seen = set()
        seen.add(c)
    return pieces
`
