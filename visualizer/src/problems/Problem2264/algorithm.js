export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 'num') throw new Error('Use a JSON object with exactly one key, num.')
  const { num } = input
  if (typeof num !== 'string' || num.length < 3 || num.length > 30) throw new Error('num must be a string of 3 to 30 digits.')
  if (!/^[0-9]+$/.test(num)) throw new Error('num may contain only the digits 0 to 9.')
  return { num }
}

export function buildTrace({ num }) {
  let best = ''
  const frames = [{ phase: 'start', activeLine: L('set best to empty'), start: -1, piece: '', best, message: 'No good integer has been found yet.' }]
  for (let i = 0; i + 3 <= num.length; i++) {
    const piece = num.slice(i, i + 3)
    const same = piece[0] === piece[1] && piece[1] === piece[2]
    if (same && (best === '' || piece > best)) {
      best = piece
      frames.push({ phase: 'found', activeLine: L('piece is larger than best'), start: i, piece, best, message: `${piece} at position ${i} is all one digit and is the largest so far.` })
    } else {
      frames.push({ phase: 'scan', activeLine: L('if the three digits are the same'), start: i, piece, best, message: same ? `${piece} is all one digit but not larger than ${best}.` : `${piece} is not all one digit.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), start: -1, piece: '', best, message: best ? `Largest good integer: ${best}.` : 'No three equal digits in a row, so the answer is empty text.' })
  return { input: { num }, result: best, frames }
}

export const code = `largest three-same-digit number:
  set best to empty text
  for each start position i from the first to three before the end
    let piece be the three digits starting at i
    if the three digits are the same then
      if best is empty or piece is larger than best then
        set best to piece
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_good_integer(num):
    best = ''
    for i in range(len(num) - 2):
        piece = num[i:i + 3]
        if piece[0] == piece[1] == piece[2]:
            if best == '' or piece > best:
                best = piece
    return best
`
