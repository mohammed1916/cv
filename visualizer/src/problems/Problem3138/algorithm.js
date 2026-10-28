export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 2 || s.length > 16) throw new Error('Use a JSON string of 2 to 16 characters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use lowercase letters a to z only.')
  return s
}

const sortedLetters = text => [...text].sort().join('')

export function buildTrace(s) {
  const n = s.length
  const frames = [{ phase: 'start', activeLine: L('n = length'), k: null, from: -1, to: -1, message: `Check lengths that divide ${n}, from shortest to longest.` }]
  let answer = n
  for (let k = 1; k <= n; k++) {
    if (n % k !== 0) continue
    const first = sortedLetters(s.slice(0, k))
    frames.push({ phase: 'length', activeLine: L('first = sorted'), k, from: 0, to: k, message: `Length ${k} divides ${n}. The first block is "${s.slice(0, k)}".` })
    let ok = true
    for (let start = 0; start < n; start += k) {
      const block = s.slice(start, start + k)
      const match = sortedLetters(block) === first
      frames.push({ phase: 'block', activeLine: match ? L('for each block') : L('differ from first'), k, from: start, to: start + k, ok: match, message: match ? `Block "${block}" is an anagram of the first block.` : `Block "${block}" is not an anagram of "${s.slice(0, k)}".` })
      if (!match) {
        ok = false
        frames.push({ phase: 'block', activeLine: L('ok = false'), k, from: start, to: start + k, ok: false, message: `Length ${k} fails; try the next length.` })
        break
      }
    }
    if (ok) {
      answer = k
      frames.push({ phase: 'found', activeLine: L('return k'), k, from: -1, to: -1, message: `Every block is an anagram of the first, so the answer is ${k}.` })
      break
    }
  }
  if (answer === n && !frames.some(f => f.phase === 'found')) frames.push({ phase: 'done', activeLine: L('return n'), k: n, from: -1, to: -1, message: `Only the whole string works, so the answer is ${n}.` })
  return { input: s, result: answer, frames }
}

export const code = `shortest length of an anagram concatenation
  n = length of s
  for k from 1 to n
    if k does not divide n then skip to the next k
    first = sorted letters of the first k characters
    ok = true
    for each block of k characters in s
      if the sorted letters of the block differ from first then
        ok = false
        stop checking blocks
    if ok then
      return k
  return n`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_anagram_concatenation_length(s):
    n = len(s)
    for k in range(1, n + 1):
        if n % k != 0:
            continue
        first = sorted(s[:k])
        ok = True
        for start in range(0, n, k):
            if sorted(s[start:start + k]) != first:
                ok = False
                break
        if ok:
            return k
    return n
`
