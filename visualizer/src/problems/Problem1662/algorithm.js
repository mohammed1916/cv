export const phases = [
  { id: 'start', label: 'Start', description: 'Read both arrays of chunks. Chunks only matter through the characters they spell in order.' },
  { id: 'pull', label: 'Pull next character', description: 'Advance one character along each array, moving to the next chunk when the current one is used up.' },
  { id: 'compare', label: 'Compare characters', description: 'Equivalent arrays give the same character at every position and end together.' },
  { id: 'done', label: 'Decide', description: 'Return true only when every position matched and both arrays ended together.' },
]

export const code = [
  "function arrayStringsAreEqual(word1, word2) {",
  "  let i = 0, j = 0;",
  "  let k = 0, m = 0;",
  "  while (i < word1.length && j < word2.length) {",
  "    const a = word1[i][k];",
  "    const b = word2[j][m];",
  "    if (a !== b) return false;",
  "    k++; m++;",
  "    if (k === word1[i].length) { i++; k = 0; }",
  "    if (m === word2[j].length) { j++; m = 0; }",
  "  }",
  "  return i === word1.length && j === word2.length;",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def array_strings_are_equal(word1, word2):
    i = j = 0
    k = m = 0
    while i < len(word1) and j < len(word2):
        a = word1[i][k]
        b = word2[j][m]
        if a != b:
            return False
        k += 1
        m += 1
        if k == len(word1[i]):
            i += 1
            k = 0
        if m == len(word2[j]):
            j += 1
            m = 0
    return i == len(word1) and j == len(word2)
`

const PY = python.split('\n')
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => PY.findIndex(line => line.includes(s)) + 1


export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"word1": ["ab", "c"], "word2": ["a", "bc"]}.')
  const { word1, word2 } = input
  const valid = list => Array.isArray(list) && list.length >= 1 && list.length <= 6
    && list.every(word => typeof word === 'string' && /^[a-z]{1,8}$/.test(word))
    && list.join('').length <= 30
  if (!valid(word1)) throw new Error('word1 is 1 to 6 chunks of 1 to 8 lowercase letters, 30 letters at most.')
  if (!valid(word2)) throw new Error('word2 is 1 to 6 chunks of 1 to 8 lowercase letters, 30 letters at most.')
  return { word1, word2 }
}

// Each character remembers its chunk and its position inside that chunk.
function characterStream(chunks) {
  return chunks.flatMap((chunk, chunkIndex) => [...chunk].map((ch, pos) => ({ ch, chunk: chunkIndex, pos })))
}

export function buildTrace({ word1, word2 }) {
  const s1 = characterStream(word1)
  const s2 = characterStream(word2)
  const frames = [{
    phase: 'start', activeLine: L('function arrayStringsAreEqual'), pythonLine: P('def array_strings'),
    snapshot: { left: null, right: null, matched: 0, mismatch: false },
    message: `word1 spells ${s1.length} characters and word2 spells ${s2.length}. Compare them in order.`,
  }]

  let matched = 0
  const steps = Math.max(s1.length, s2.length)
  for (let t = 0; t < steps; t++) {
    const a = s1[t] ?? null
    const b = s2[t] ?? null
    if (a === null || b === null) {
      frames.push({
        phase: 'pull', activeLine: L('const a = word1[i][k]'), pythonLine: P('a = word1[i][k]'),
        snapshot: { left: a, right: b, matched, mismatch: false },
        message: a === null ? 'word1 has run out while word2 still has characters.' : 'word2 has run out while word1 still has characters.',
      })
      frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return i == len(word1)'), snapshot: { left: a, right: b, matched, mismatch: true }, message: 'The total lengths differ, so the arrays are not equivalent. Return false.' })
      return { input: { word1, word2 }, result: false, frames }
    }
    frames.push({
      phase: 'pull', activeLine: L('const a = word1[i][k]'), pythonLine: P('k = m = 0'),
      snapshot: { left: a, right: b, matched, mismatch: false },
      message: `word1 gives "${a.ch}" from chunk ${a.chunk}, word2 gives "${b.ch}" from chunk ${b.chunk}.`,
    })
    if (a.ch !== b.ch) {
      frames.push({
        phase: 'compare', activeLine: L('if (a !== b)'), pythonLine: P('return i == len(word1)'),
        snapshot: { left: a, right: b, matched, mismatch: true },
        message: `"${a.ch}" and "${b.ch}" differ at position ${t}, so the arrays are not equivalent.`,
      })
      frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return i == len(word1)'), snapshot: { left: a, right: b, matched, mismatch: true }, message: 'Return false.' })
      return { input: { word1, word2 }, result: false, frames }
    }
    matched += 1
    frames.push({
      phase: 'compare', activeLine: L('if (a !== b)'), pythonLine: P('return i == len(word1)'),
      snapshot: { left: a, right: b, matched, mismatch: false },
      message: `Both spell "${a.ch}" at position ${t}. ${matched} characters match so far.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return i === word1.length'), pythonLine: P('return i == len(word1)'),
    snapshot: { left: null, right: null, matched, mismatch: false },
    message: `Both arrays are exhausted after ${matched} matching characters. Return true.`,
  })
  return { input: { word1, word2 }, result: true, frames }
}
