// LeetCode 2207: Maximize Number of Subsequences in a String.
// Adding one copy of pattern[0] at the start or pattern[1] at the end gives the most new subsequences, so the best
// extra count is max(count of pattern[0], count of pattern[1]) in the text. Count the existing subsequences first
// with one pass: each pattern[1] adds the number of pattern[0] seen before it.

const MAX_LEN = 12

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"text":"abdcdbc","pattern":"ac"}.') }
  if (!spec || typeof spec.text !== 'string' || typeof spec.pattern !== 'string') throw new Error('Give text and pattern strings.')
  if (!/^[a-z]+$/.test(spec.text) || spec.text.length < 1 || spec.text.length > MAX_LEN) throw new Error(`text is 1 to ${MAX_LEN} lowercase letters.`)
  if (!/^[a-z]{2}$/.test(spec.pattern)) throw new Error('pattern is exactly two lowercase letters.')
  return { text: spec.text, pattern: spec.pattern }
}

export const code = `FUNCTION maximumSubsequenceCount(text, pattern)
    p0 ← pattern[0], p1 ← pattern[1]
    seen0 ← 0
    pairs ← 0
    FOR each character c in text
        IF c = p1 THEN pairs ← pairs + seen0
        IF c = p0 THEN seen0 ← seen0 + 1
    total0 ← count of p0 in text
    total1 ← count of p1 in text
    RETURN pairs + max(total0, total1)`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximum_subsequence_count(text, pattern):
    p0, p1 = pattern[0], pattern[1]
    seen0 = 0
    pairs = 0
    for c in text:
        if c == p1:
            pairs += seen0
        if c == p0:
            seen0 += 1
    total0 = text.count(p0)
    total1 = text.count(p1)
    return pairs + max(total0, total1)
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'scan', label: 'Scan', description: 'Count the subsequences already in the text.' },
  { id: 'extra', label: 'Add one', description: 'Adding one letter at the start or end adds the most common one.' },
  { id: 'done', label: 'Result', description: 'The maximum number of pattern subsequences.' },
]

export function buildTrace({ text, pattern }) {
  const [p0, p1] = pattern
  let seen0 = 0
  let pairs = 0
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, text, pattern, seen0, pairs, ...extra })
  push('scan', -1, L('p0 ← pattern'), P('p0, p1 = pattern'), `Count "${pattern}" as a subsequence of "${text}".`)
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === p1) { pairs += seen0; push('scan', i, L('IF c = p1'), P('if c == p1'), `${c} at ${i} completes ${seen0} pair(s) with earlier ${p0}. Pairs ${pairs}.`, { added: seen0 }) }
    if (c === p0) { seen0 += 1; push('scan', i, L('IF c = p0'), P('if c == p0'), `${c} at ${i}: ${seen0} ${p0} seen so far.`, { added: 0 }) }
  }
  const total0 = text.split('').filter(c => c === p0).length
  const total1 = text.split('').filter(c => c === p1).length
  push('extra', -1, L('total0 ← count'), P('total0 = text.count'), `The text has ${total0} ${p0} and ${total1} ${p1}. Adding the more common letter adds ${Math.max(total0, total1)} subsequences.`, { total0, total1 })
  const result = pairs + Math.max(total0, total1)
  push('done', -1, L('RETURN pairs'), P('return pairs +'), `The maximum number of subsequences is ${result}.`, { result })
  return { input: { text, pattern }, result, frames }
}
