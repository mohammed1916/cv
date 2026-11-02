// Visualization caps: up to 12 integers from -99 to 99 and a chunk size from 1 to 12. The draft gives no verified bounds.
export const code = `function chunk(arr, size)
  set chunks to an empty list
  for start from 0 up to the length of arr, stepping by size
    take arr from start up to start plus size
    append that piece to chunks
  return chunks`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def chunk(arr, size):
    chunks = []
    for start in range(0, len(arr), size):
        piece = arr[start:start + size]
        chunks.append(piece)
    return chunks`

const L = (text) => {
  const index = code.findIndex((line) => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}

const PY_LINES = python.split('\n')
const PY = (text) => {
  const index = PY_LINES.findIndex((line) => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Chunks', description: 'Start with an empty list of chunks.' },
  { id: 'take', label: 'Take', description: 'Cut the next piece starting at this index.' },
  { id: 'add', label: 'Append', description: 'Append the piece to the result.' },
  { id: 'done', label: 'Result', description: 'Return every chunk in order.' },
]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || !Array.isArray(input.arr) || !Number.isInteger(input.size)) throw new Error('Use an object with arr and an integer size.')
  if (input.arr.length > 12) throw new Error('arr has at most 12 values in this visualization.')
  if (!input.arr.every((v) => Number.isInteger(v) && v >= -99 && v <= 99)) throw new Error('Each value is an integer from -99 to 99.')
  if (input.size < 1 || input.size > 12) throw new Error('size is an integer from 1 to 12 in this visualization.')
  return { arr: input.arr, size: input.size }
}

export function buildTrace({ arr, size }) {
  const frames = []
  const chunks = []
  frames.push({ phase: 'start', activeLine: L('set chunks to an empty list'), pythonLine: PY('chunks = []'), message: `Cut ${arr.length} value${arr.length === 1 ? '' : 's'} into pieces of ${size}.`, start: null, chunks: [] })
  for (let start = 0; start < arr.length; start += size) {
    const piece = arr.slice(start, start + size)
    frames.push({ phase: 'take', activeLine: L('take arr from start'), pythonLine: PY('piece = arr'), message: `Take [${piece.join(', ')}] from index ${start}.`, start, piece, chunks: chunks.slice() })
    chunks.push(piece)
    frames.push({ phase: 'add', activeLine: L('append that piece'), pythonLine: PY('chunks.append(piece)'), message: `Append piece ${chunks.length}; it has ${piece.length} value${piece.length === 1 ? '' : 's'}.`, start, piece, chunks: chunks.slice() })
  }
  frames.push({ phase: 'done', activeLine: L('return chunks'), pythonLine: PY('return chunks'), message: arr.length === 0 ? 'The input is empty, so the result is an empty list.' : `${chunks.length} chunk${chunks.length === 1 ? '' : 's'} returned in order.`, start: null, chunks: chunks.slice() })
  return { input: { arr, size }, result: chunks, frames }
}
