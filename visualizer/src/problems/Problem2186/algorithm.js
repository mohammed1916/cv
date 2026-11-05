// LeetCode 2186: Minimum Number of Steps to Make Two Strings Anagram II.
// One step adds one letter to either string. Each letter must end with the same count in both strings, so every
// letter contributes the absolute difference of its counts.

const MAX_LEN = 16

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"s":"leetcode","t":"coats"}.') }
  if (!spec || typeof spec.s !== 'string' || typeof spec.t !== 'string') throw new Error('Give strings s and t.')
  if (!/^[a-z]+$/.test(spec.s) || !/^[a-z]+$/.test(spec.t)) throw new Error('Use lowercase letters only.')
  if (spec.s.length < 1 || spec.t.length < 1 || spec.s.length > MAX_LEN || spec.t.length > MAX_LEN) throw new Error(`Each string has 1 to ${MAX_LEN} letters.`)
  return { s: spec.s, t: spec.t }
}

export const code = `FUNCTION minSteps(s, t)
    cs ← letter counts of s
    ct ← letter counts of t
    steps ← 0
    FOR each letter c from a to z
        steps ← steps + |cs[c] - ct[c]|
    RETURN steps`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_steps(s, t):
    cs = [0] * 26
    ct = [0] * 26
    for ch in s:
        cs[ord(ch) - ord("a")] += 1
    for ch in t:
        ct[ord(ch) - ord("a")] += 1
    steps = 0
    for c in range(26):
        steps += abs(cs[c] - ct[c])
    return steps
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
  { id: 'count', label: 'Count', description: 'Count each letter in both strings.' },
  { id: 'letter', label: 'Compare', description: 'For each letter, the gap between the counts is the steps it needs.' },
  { id: 'done', label: 'Result', description: 'The total gap over all letters.' },
]

export function buildTrace({ s, t }) {
  const cs = Array(26).fill(0)
  const ct = Array(26).fill(0)
  for (const ch of s) cs[ch.charCodeAt(0) - 97] += 1
  for (const ch of t) ct[ch.charCodeAt(0) - 97] += 1
  const frames = []
  let steps = 0
  const push = (phase, letter, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, letter, index: letter, activeLine, pythonLine, message, s, t, cs: cs.slice(), ct: ct.slice(), steps, ...extra })
  push('count', -1, L('cs ← letter counts'), P('cs = [0] * 26'), `Counts for "${s}" and "${t}" are ready.`)
  for (let c = 0; c < 26; c++) {
    const gap = Math.abs(cs[c] - ct[c])
    steps += gap
    if (cs[c] === 0 && ct[c] === 0) continue
    push('letter', c, L('steps ← steps +'), P('steps += abs'),
      `${String.fromCharCode(97 + c)}: ${cs[c]} in s and ${ct[c]} in t, a gap of ${gap}. Steps ${steps}.`, { gap })
  }
  push('done', -1, L('RETURN steps'), P('return steps'), `${steps} steps make the two strings anagrams.`)
  return { input: { s, t }, result: steps, frames }
}
