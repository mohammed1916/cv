export const MAX_LENGTH = 40

export const phases = [
  { id: 'start', label: 'Start', description: 'Only the empty root exists.' },
  { id: 'scan', label: 'Scan', description: 'Add the next character to the current piece.' },
  { id: 'walk', label: 'Seen', description: 'That piece was kept before, so keep growing.' },
  { id: 'create', label: 'New', description: 'That piece is new, so add its node.' },
  { id: 'cut', label: 'Cut', description: 'Keep the piece and restart at the root.' },
  { id: 'done', label: 'Result', description: 'A piece still unfinished at the end is dropped.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > MAX_LENGTH) throw new Error(`s has 1 to ${MAX_LENGTH} characters.`)
  if (!/^[a-z]+$/.test(s)) throw new Error('s uses lowercase English letters only.')
  return { s }
}

export const code = `cut s into pieces that differ from all earlier pieces
  start with a trie holding only the root
  stand at the root, with no pieces and the piece starting at 0
  for each index i with character c
    if the current node has an edge for c
      follow it, because this piece was kept before
    otherwise
      add a node for c below the current node
      keep s from the piece start through i
      go back to the root
      start the next piece at i + 1
  return the kept pieces, ignoring any unfinished tail`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def partition_string(s):
    root = {}
    node = root
    pieces = []
    start = 0
    for i, c in enumerate(s):
        if c in node:
            node = node[c]
        else:
            node[c] = {}
            pieces.append(s[start:i + 1])
            node = root
            start = i + 1
    return pieces
`

export function buildTrace({ s }) {
  const frames = []
  const nodes = [{ id: 0, parent: null, char: '', prefix: '' }]
  const edges = new Map()
  const pieces = []
  let current = 0
  let start = 0
  const emit = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, at: -1, start, activeNode: current, newNode: null,
    nodes: nodes.map(node => ({ ...node })), pieces: pieces.map(piece => ({ ...piece })), tail: null, ...extra,
  })
  emit('start', L('holding only the root'), 5, 'The trie stores every kept piece, one edge per character. Nothing is kept yet.')
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    const piece = s.slice(start, i + 1)
    const key = `${current}:${c}`
    emit('scan', L('for each index'), 6, `Current piece grows to "${piece}". Is there an edge for ${c} from here?`, { at: i })
    if (edges.has(key)) {
      current = edges.get(key)
      emit('walk', L('follow it'), 8, `"${piece}" was kept before, so it cannot be cut here. Keep growing.`, { at: i })
    } else {
      const id = nodes.length
      nodes.push({ id, parent: current, char: c, prefix: piece, role: 'created' })
      edges.set(key, id)
      emit('create', L('add a node'), 10, `No edge for ${c}, so "${piece}" is new. Add its node.`, { at: i, newNode: id })
      nodes[id] = { id, parent: nodes[id].parent, char: c, prefix: piece }
      pieces.push({ text: piece, from: start, to: i })
      emit('cut', L('keep s from'), 11, `Keep "${piece}", covering indices ${start} to ${i}.`, { at: i })
      current = 0
      start = i + 1
      emit('cut', L('start the next piece'), 13, i + 1 < s.length ? `Back to the root; the next piece starts at index ${i + 1}.` : 'Back to the root; the string is used up.', { at: i })
    }
  }
  const tail = start < s.length ? { text: s.slice(start), from: start, to: s.length - 1 } : null
  const result = pieces.map(piece => piece.text)
  emit('done', L('return the kept pieces'), 14, tail
    ? `The string ended with "${tail.text}" still matching an earlier piece. It never became unique, so it is dropped. Return ${result.length} pieces.`
    : `The string ended exactly on a cut. Return ${result.length} pieces.`, { tail })
  return { input: { s }, result, frames }
}
