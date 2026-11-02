const CODE_TEXT = `shortest way to form target from source
  set pieces to 0 and next to 0
  while next is less than the length of target
    start a new subsequence and count it
    walk through source once
      if the source letter equals target at next then advance next
    if no letter was matched in this pass then return -1
  return the number of pieces`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def shortest_way(source, target):
    pieces = 0
    next_index = 0
    while next_index < len(target):
        pieces += 1
        before = next_index
        for letter in source:
            if next_index < len(target) and letter == target[next_index]:
                next_index += 1
        if next_index == before:
            return -1
    return pieces


if __name__ == "__main__":
    print(shortest_way("abc", "abcbc"))
`

const PY_LINES = python.split('\n')
const L = text => {
  const index = code.findIndex(item => item.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY_LINES.findIndex(item => item.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const MAX_LENGTH = 12

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with source and target strings.')
  const { source, target } = input
  if (typeof source !== 'string' || source.length > MAX_LENGTH) throw new Error(`source is a string of at most ${MAX_LENGTH} characters.`)
  if (typeof target !== 'string' || target.length > MAX_LENGTH) throw new Error(`target is a string of at most ${MAX_LENGTH} characters.`)
  return { source, target }
}

export function buildTrace({ source, target }) {
  const frames = []
  const assign = new Array(target.length).fill(0)
  let pieces = 0
  let next = 0
  const state = (extra = {}) => ({ source, target, assign: assign.slice(), next, pieces, scan: -1, ...extra })
  const add = (phase, line, py, message, extra) => frames.push({ phase, activeLine: L(line), pythonLine: P(py), message, ...state(extra) })
  add('start', 'set pieces to 0', 'pieces = 0', 'Nothing is formed yet. Target position 0 is the next letter needed.', {})
  let result = null
  while (next < target.length) {
    pieces += 1
    const before = next
    add('piece', 'start a new subsequence', 'pieces += 1', `Piece ${pieces} starts at target position ${next} (needs "${target[next]}").`, {})
    for (let j = 0; j < source.length; j++) {
      if (next < target.length && source[j] === target[next]) {
        assign[next] = pieces
        add('take', 'advance next', 'next_index += 1', `source[${j}] = "${source[j]}" matches target[${next}]; piece ${pieces} takes it.`, { scan: j })
        next += 1
      } else {
        add('scan', 'if the source letter equals', 'if next_index < len(target) and letter', `source[${j}] = "${source[j]}" does not help piece ${pieces}.`, { scan: j })
      }
    }
    if (next === before) {
      add('stuck', 'return -1', 'return -1', `No letter matched in piece ${pieces}; target "${target[next]}" at position ${next} cannot be formed.`, {})
      result = -1
      break
    }
  }
  if (result === null) result = pieces
  add('done', 'return the number of pieces', 'return pieces', result === -1 ? 'The target cannot be formed.' : `${result} piece${result === 1 ? '' : 's'} form the target.`, { pieces: result === -1 ? pieces : result, next })
  return { input: { source, target }, result, frames }
}
