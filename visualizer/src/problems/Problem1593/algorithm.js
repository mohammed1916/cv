export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string') throw new Error('Use an object with a string "s".')
  const { s } = input
  if (s.length < 1 || s.length > 12) throw new Error('s holds 1 to 12 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s may contain only lowercase letters a to z.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const frames = [{ phase: 'start', activeLine: L('set best to zero'), start: 0, end: 0, piece: null, pieces: [], best: 0, message: 'Try every way to cut the text into pieces.' }]
  const used = new Set()
  const pieces = []
  let best = 0
  let bestPieces = []
  const split = start => {
    if (start === s.length) {
      if (pieces.length > best) { best = pieces.length; bestPieces = [...pieces] }
      frames.push({ phase: 'record', activeLine: L('keep the count if it beats best'), start: s.length, end: s.length, piece: null, pieces: [...pieces], best, message: `This split has ${pieces.length} unique piece(s).` })
      return
    }
    for (let end = start + 1; end <= s.length; end++) {
      const piece = s.slice(start, end)
      if (used.has(piece)) {
        frames.push({ phase: 'duplicate', activeLine: L('if the piece is already used'), start, end, piece, pieces: [...pieces], best, message: `"${piece}" is already used, so skip it.` })
        continue
      }
      used.add(piece)
      pieces.push(piece)
      frames.push({ phase: 'choose', activeLine: L('add the piece to the used set'), start, end, piece, pieces: [...pieces], best, message: `Take "${piece}" as piece ${pieces.length}.` })
      split(end)
      pieces.pop()
      used.delete(piece)
      frames.push({ phase: 'backtrack', activeLine: L('remove the piece from the used set'), start, end, piece, pieces: [...pieces], best, message: `Put "${piece}" back and try a longer piece.` })
    }
  }
  split(0)
  frames.push({ phase: 'done', activeLine: L('return best'), start: s.length, end: s.length, piece: null, pieces: bestPieces, best, message: `The maximum number of unique pieces is ${best}.` })
  return { input, result: best, frames, bestPieces }
}

export const code = `largest number of unique pieces when splitting the text
  set best to zero
  call split from position zero with no pieces counted
  return best
split from a start position with a count of pieces
  if the start is at the end of the text then
    keep the count if it beats best and stop
  for each end position after the start
    the piece is the text from start to end
    if the piece is already used then skip it
    otherwise add the piece to the used set
      split from end with one more piece
      remove the piece from the used set`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_unique_split(s):
    best = 0
    seen = set()

    def split(start, count):
        nonlocal best
        if start == len(s):
            best = max(best, count)
            return
        for end in range(start + 1, len(s) + 1):
            piece = s[start:end]
            if piece in seen:
                continue
            seen.add(piece)
            split(end, count + 1)
            seen.remove(piece)

    split(0, 0)
    return best
`
