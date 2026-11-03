const BITS = /^[01]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with stream and pattern.')
  const { stream, pattern } = input
  if (typeof pattern !== 'string' || pattern.length < 1 || pattern.length > 12 || !BITS.test(pattern)) throw new Error('pattern is 1 to 12 binary digits.')
  if (typeof stream !== 'string' || stream.length < 1 || stream.length > 60 || !BITS.test(stream)) throw new Error('stream is 1 to 60 binary digits, the bits it yields in order.')
  if (!stream.includes(pattern)) throw new Error('The stream must contain the pattern.')
  return { stream, pattern }
}

export const code = `find the first start index of pattern in the bits from next()
  set m to the length of pattern
  set window to empty and index to minus one
  repeat
    bit = next() and index = index plus one
    append bit to window
    if window is longer than m then drop its oldest bit
    if window has length m then
      set matched to true
      for j from 0 to m minus 1
        if window[j] differs from pattern[j] then set matched to false and stop
      if matched then return index minus m plus 1`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const line = code.findIndex(c => c.text.includes(s))
  if (line < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return line + 1
}

export const python = `def find_pattern(next_bit, pattern):
    m = len(pattern)
    window = []
    index = -1
    while True:
        bit = next_bit()
        index += 1
        window.append(bit)
        if len(window) > m:
            window.pop(0)
        if len(window) == m:
            matched = True
            for j in range(m):
                if window[j] != pattern[j]:
                    matched = False
                    break
            if matched:
                return index - m + 1
`

const PY = python.split('\n')
const P = s => {
  const line = PY.findIndex(text => text.includes(s))
  if (line < 0) throw new Error(`Missing python line: ${s}`)
  return line + 1
}

export function buildTrace({ stream, pattern }) {
  const m = pattern.length
  const frames = []
  const read = []
  const window = []
  let pos = 0
  let index = -1
  let result = -1

  const emit = fields => {
    const start = window.length === m ? index - m + 1 : -1
    frames.push({ pattern, bits: read.join(''), index, window: window.join(''), start, j: -1, verdict: null, found: -1, ...fields })
  }

  emit({ phase: 'start', pythonLine: P('window = []'), activeLine: L('set window to empty'), message: `Look for ${pattern} (${m} bits) in the bits the stream yields.` })

  while (true) {
    if (pos >= stream.length) throw new Error('The stream ended before the pattern appeared.')
    const bit = stream[pos++]
    read.push(bit)
    index += 1
    emit({ phase: 'read', pythonLine: P('bit = next_bit()'), activeLine: L('bit = next()'), message: `next() yields ${bit} at position ${index}.` })

    window.push(bit)
    const shifted = window.length > m
    if (shifted) window.shift()
    emit({
      phase: 'slide',
      pythonLine: shifted ? P('window.pop(0)') : P('window.append(bit)'),
      activeLine: L('append bit to window'),
      message: shifted ? `The window keeps only the last ${m} bits: ${window.join('')}.` : `Window is ${window.join('')}.`,
    })
    if (window.length < m) continue

    emit({ phase: 'check', pythonLine: P('if len(window) == m:'), activeLine: L('if window has length m'), message: `Window ${window.join('')} has ${m} bits. Compare it with ${pattern}.` })
    let matched = true
    for (let j = 0; j < m; j++) {
      if (window[j] !== pattern[j]) {
        matched = false
        emit({ phase: 'mismatch', j, verdict: 'mismatch', pythonLine: P('matched = False'), activeLine: L('set matched to false and stop'), message: `window[${j}] = ${window[j]} differs from pattern[${j}] = ${pattern[j]}. Slide on.` })
        break
      }
      emit({ phase: 'compare', j, verdict: 'match', pythonLine: P('if window[j] != pattern[j]:'), activeLine: L('if window[j] differs'), message: `window[${j}] = ${window[j]} matches pattern[${j}].` })
    }
    if (matched) {
      result = index - m + 1
      emit({ phase: 'found', found: result, pythonLine: P('return index - m + 1'), activeLine: L('if matched then return'), message: `Every bit of the window matches, so the pattern starts at ${result}.` })
      break
    }
  }

  emit({ phase: 'done', found: result, pythonLine: P('return index - m + 1'), activeLine: L('if matched then return'), message: `Answer: ${result}.` })
  return { input: { stream, pattern }, result, frames }
}
