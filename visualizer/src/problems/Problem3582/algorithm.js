export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 'caption') throw new Error('Use a JSON object with exactly one key, caption.')
  const { caption } = input
  if (typeof caption !== 'string' || caption.length > 150) throw new Error('caption must be a string of at most 150 characters.')
  if (!/^[A-Za-z ]*$/.test(caption)) throw new Error('caption may contain only letters and spaces.')
  return { caption }
}

export function buildTrace({ caption }) {
  const words = caption.trim().split(/\s+/).filter(Boolean)
  const frames = [{ phase: 'start', activeLine: L('split caption'), index: -1, piece: '', tag: '', message: `The caption has ${words.length} words.` }]
  let tag = ''
  words.forEach((word, index) => {
    const piece = index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase()
    tag += piece
    frames.push({ phase: 'word', activeLine: L(index === 0 ? 'append the word in lowercase' : 'append the word with'), index, piece, tag, message: `Word ${index + 1} "${word}" contributes "${piece}".` })
  })
  const full = `#${tag}`
  const result = full.slice(0, 100)
  frames.push({ phase: 'done', activeLine: L('return tag'), index: -1, piece: '', tag: result, message: full.length > 100 ? `The tag is cut to 100 characters: ${result}.` : `Tag: ${result}.` })
  return { input: { caption }, result, frames }
}

export const code = `tag for a video caption:
  split caption into words at spaces, ignoring empty pieces
  set tag to empty text
  for each word, counting from the first word
    if this is the first word then
      append the word in lowercase to tag
    otherwise
      append the word with its first letter capital and the rest lowercase
  put a # in front of tag
  keep the first 100 characters
  return tag`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def generate_tag(caption):
    words = caption.split()
    tag = ''
    for index, word in enumerate(words):
        if index == 0:
            tag += word.lower()
        else:
            tag += word[0].upper() + word[1:].lower()
    tag = ('#' + tag)[:100]
    return tag
`
