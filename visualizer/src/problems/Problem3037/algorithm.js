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
  build the failure table fail, where fail[i] is the longest proper border of pattern[0..i]
  fail[0] = 0 and k = 0
  for i from 1 to m minus 1
    while k > 0 and pattern[i] differs from pattern[k] do k = fail[k minus 1]
    if pattern[i] equals pattern[k] then k = k plus one
    fail[i] = k
  set state to 0 and index to minus one
  repeat
    bit = next() and index = index plus one
    while state > 0 and bit differs from pattern[state] do state = fail[state minus 1]
    if bit equals pattern[state] then state = state plus one
    if state equals m then return index minus m plus 1`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const line = code.findIndex(c => c.text.includes(s))
  if (line < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return line + 1
}

export const python = `def find_pattern(next_bit, pattern):
    m = len(pattern)
    fail = [0] * m
    k = 0
    for i in range(1, m):
        while k > 0 and pattern[i] != pattern[k]:
            k = fail[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        fail[i] = k
    state = 0
    index = -1
    while True:
        bit = next_bit()
        index += 1
        while state > 0 and bit != pattern[state]:
            state = fail[state - 1]
        if bit == pattern[state]:
            state += 1
        if state == m:
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
  const fail = Array.from({ length: m }, () => null)
  let pos = 0
  let index = -1
  let state = 0
  let result = -1
  let k = 0
  let tableI = -1

  const emit = fields => frames.push({
    pattern, bits: read.join(''), index, state, fail: fail.slice(), i: tableI, k, found: result, ...fields,
  })

  fail[0] = 0
  emit({ phase: 'table', i: 0, k: 0, pythonLine: P('fail = [0] * m'), activeLine: L('fail[0] = 0'), message: 'fail[0] is 0: a single bit has no shorter border.' })

  for (let i = 1; i < m; i++) {
    tableI = i
    emit({ phase: 'table', pythonLine: P('for i in range(1, m):'), activeLine: L('for i from 1'), message: `Extend the border ending at pattern[${i}] = ${pattern[i]}.` })
    while (k > 0 && pattern[i] !== pattern[k]) {
      k = fail[k - 1]
      emit({ phase: 'table', pythonLine: P('k = fail[k - 1]'), activeLine: L('k = fail[k minus 1]'), message: `pattern[${i}] does not extend the border; fall back to length ${k}.` })
    }
    if (pattern[i] === pattern[k]) {
      k += 1
      emit({ phase: 'table', pythonLine: P('if pattern[i] == pattern[k]:'), activeLine: L('if pattern[i] equals pattern[k]'), message: `pattern[${i}] extends the border to length ${k}.` })
    }
    fail[i] = k
    emit({ phase: 'table', pythonLine: P('fail[i] = k'), activeLine: L('fail[i] = k'), message: `fail[${i}] = ${k}.` })
  }
  tableI = -1
  k = 0

  emit({ phase: 'start', pythonLine: P('index = -1'), activeLine: L('set state to 0'), message: `Table ready. Read the stream one bit at a time, looking for ${pattern}.` })

  while (true) {
    if (pos >= stream.length) throw new Error('The stream ended before the pattern appeared.')
    const bit = stream[pos++]
    read.push(bit)
    index += 1
    emit({ phase: 'read', pythonLine: P('bit = next_bit()'), activeLine: L('bit = next()'), message: `next() yields ${bit} at position ${index}.` })

    while (state > 0 && bit !== pattern[state]) {
      state = fail[state - 1]
      emit({ phase: 'fall', pythonLine: P('state = fail[state - 1]'), activeLine: L('state = fail[state minus 1]'), message: `${bit} breaks the match; fall back to state ${state} without rereading bits.` })
    }
    if (bit === pattern[state]) {
      state += 1
      emit({ phase: 'advance', pythonLine: P('state += 1'), activeLine: L('if bit equals pattern[state]'), message: `${bit} extends the match to ${state} of ${m} bits.` })
    } else {
      emit({ phase: 'miss', pythonLine: P('if bit == pattern[state]:'), activeLine: L('if bit equals pattern[state]'), message: `${bit} starts no prefix of ${pattern}; state stays 0.` })
    }
    if (state === m) {
      result = index - m + 1
      emit({ phase: 'found', found: result, pythonLine: P('return index - m + 1'), activeLine: L('if state equals m'), message: `The whole pattern is matched, so it starts at ${result}.` })
      break
    }
  }

  emit({ phase: 'done', found: result, pythonLine: P('return index - m + 1'), activeLine: L('if state equals m'), message: `Answer: ${result}.` })
  return { input: { stream, pattern }, result, frames }
}
