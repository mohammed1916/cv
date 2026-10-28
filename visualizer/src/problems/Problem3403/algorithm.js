export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join() !== 'numFriends,word') throw new Error('Use a JSON object with exactly the keys word and numFriends.')
  const { word, numFriends } = input
  if (typeof word !== 'string' || word.length < 1 || word.length > 20) throw new Error('word must be a string of 1 to 20 letters.')
  if (!/^[a-z]+$/.test(word)) throw new Error('word may contain only lowercase letters a to z.')
  if (!Number.isInteger(numFriends) || numFriends < 1 || numFriends > word.length) throw new Error('numFriends must be an integer from 1 to the length of word.')
  return { word, numFriends }
}

export function buildTrace({ word, numFriends }) {
  if (numFriends === 1) {
    const only = [
      { phase: 'start', activeLine: L('if numFriends is 1'), start: -1, longest: word.length, piece: '', best: '', message: 'With one friend, the only piece is the whole word.' },
      { phase: 'done', activeLine: L('return the whole word'), start: -1, longest: word.length, piece: word, best: word, message: `Largest string in the box: ${word}.` },
    ]
    return { input: { word, numFriends }, result: word, frames: only }
  }
  const longest = word.length - numFriends + 1
  let best = ''
  const frames = [{ phase: 'start', activeLine: L('set longest to'), start: -1, longest, piece: '', best, message: `Each piece can be at most ${longest} letters long, because the other ${numFriends - 1} pieces need at least one letter each.` }]
  for (let i = 0; i < word.length; i++) {
    const piece = word.slice(i, i + longest)
    const larger = piece > best
    if (larger) best = piece
    frames.push({ phase: larger ? 'better' : 'window', activeLine: L('let piece be'), start: i, longest, piece, best, message: larger ? `${piece} from position ${i} is larger than the best so far, so it becomes the best.` : `${piece} from position ${i} is not larger than ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), start: -1, longest, piece: '', best, message: `Largest string in the box: ${best}.` })
  return { input: { word, numFriends }, result: best, frames }
}

export const code = `largest string from the box:
  if numFriends is 1 then return the whole word
  set longest to the word length minus numFriends plus 1
  set best to empty text
  for each start position i in the word
    let piece be the letters from i, up to longest letters
    if piece is larger than best then
      set best to piece
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_box_string(word, numFriends):
    if numFriends == 1:
        return word
    longest = len(word) - numFriends + 1
    best = ''
    for i in range(len(word)):
        piece = word[i:i + longest]
        if piece > best:
            best = piece
    return best
`
