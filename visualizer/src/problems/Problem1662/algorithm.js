export const phases = [
  { id: 'start', label: 'Start', description: 'Read both arrays of chunks. Chunks only matter through the characters they spell in order.' },
  { id: 'pull', label: 'Pull next character', description: 'Advance one character along each array, moving to the next chunk when the current one is used up.' },
  { id: 'compare', label: 'Compare characters', description: 'Equivalent arrays give the same character at every position and end together.' },
  { id: 'done', label: 'Decide', description: 'Return true only when every position matched and both arrays ended together.' },
]

const codeText = `arrays equivalent (word1, word2):
  i = j = 0 (chunk and character in word1), k = m = 0 (in word2)
  while both arrays still have characters:
    pull the next character a from word1 and b from word2
    if a is not b: return false
  return both arrays are exhausted`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))

const pythonText = `def array_strings_are_equal(word1, word2):
    chars1 = "".join(word1)
    chars2 = "".join(word2)
    return chars1 == chars2
`

export const python = pythonText
const L = s => codeText.split('\n').findIndex(line => line.includes(s)) + 1
const P = s => pythonText.split('\n').findIndex(line => line.includes(s)) + 1

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
    phase: 'start', activeLine: L('arrays equivalent'), pythonLine: P('def array_strings'),
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
        phase: 'pull', activeLine: L('pull the next character'), pythonLine: P('chars2 ='),
        snapshot: { left: a, right: b, matched, mismatch: false },
        message: a === null ? 'word1 has run out while word2 still has characters.' : 'word2 has run out while word1 still has characters.',
      })
      frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return chars1 == chars2'), snapshot: { left: a, right: b, matched, mismatch: true }, message: 'The total lengths differ, so the arrays are not equivalent. Return false.' })
      return { input: { word1, word2 }, result: false, frames }
    }
    frames.push({
      phase: 'pull', activeLine: L('pull the next character'), pythonLine: P('chars1 ='),
      snapshot: { left: a, right: b, matched, mismatch: false },
      message: `word1 gives "${a.ch}" from chunk ${a.chunk}, word2 gives "${b.ch}" from chunk ${b.chunk}.`,
    })
    if (a.ch !== b.ch) {
      frames.push({
        phase: 'compare', activeLine: L('if a is not b'), pythonLine: P('return chars1 == chars2'),
        snapshot: { left: a, right: b, matched, mismatch: true },
        message: `"${a.ch}" and "${b.ch}" differ at position ${t}, so the arrays are not equivalent.`,
      })
      frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return chars1 == chars2'), snapshot: { left: a, right: b, matched, mismatch: true }, message: 'Return false.' })
      return { input: { word1, word2 }, result: false, frames }
    }
    matched += 1
    frames.push({
      phase: 'compare', activeLine: L('if a is not b'), pythonLine: P('return chars1 == chars2'),
      snapshot: { left: a, right: b, matched, mismatch: false },
      message: `Both spell "${a.ch}" at position ${t}. ${matched} characters match so far.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return both arrays are exhausted'), pythonLine: P('return chars1 == chars2'),
    snapshot: { left: null, right: null, matched, mismatch: false },
    message: `Both arrays are exhausted after ${matched} matching characters. Return true.`,
  })
  return { input: { word1, word2 }, result: true, frames }
}
