export function parseInput(text) {
  const words = JSON.parse(text)
  if (!Array.isArray(words) || words.length < 1 || words.length > 6 || !words.every(w => typeof w === 'string' && /^[a-z]{1,6}$/.test(w))) throw new Error('Use a JSON array of 1 to 6 lowercase words, each up to 6 letters.')
  return words
}

export function buildTrace(words) {
  const frames = []
  const counts = new Map()
  let total = 0
  for (const w of words) {
    total += w.length
    for (const ch of w) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  }
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('const counts = new Map()'), usedLen: 0, usedPairs: 0, pairs: null, total, best: 0, message: `${total} letters in total.` })
  let pairs = 0
  for (const c of counts.values()) pairs += Math.floor(c / 2)
  frames.push({ pythonLine: 8, phase: 'pairs', activeLine: L('let pairs = 0'), usedLen: 0, usedPairs: 0, pairs, total, best: 0, message: `${pairs} letter pairs are available.` })
  const lengths = words.map(w => w.length).sort((a, b) => a - b)
  let best = 0
  let usedLen = 0
  let usedPairs = 0
  for (const L_ of lengths) {
    usedLen += L_
    usedPairs += Math.floor(L_ / 2)
    if (usedLen > total || usedPairs > pairs) {
      frames.push({ pythonLine: 17, phase: 'stop', activeLine: L('if (usedLen > total || usedPairs > pairs)'), usedLen, usedPairs, pairs, total, best, message: `A word of length ${L_} does not fit: ${usedLen} letters or ${usedPairs} pairs are needed.` })
      break
    }
    best += 1
    frames.push({ pythonLine: 18, phase: 'take', activeLine: L('best += 1'), usedLen, usedPairs, pairs, total, best, message: `A word of length ${L_} fits; ${best} palindromes so far.` })
  }
  frames.push({ pythonLine: 19, phase: 'done', activeLine: L('return best'), usedLen, usedPairs, pairs, total, best, message: `${best} palindromes can be formed.` })
  return { input: words, result: best, frames }
}

export const code = `function maxPalindromes(words) {
  const counts = new Map()
  let total = 0
  for (const w of words) {
    total += w.length
    for (const ch of w) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  }
  let pairs = 0
  for (const c of counts.values()) pairs += Math.floor(c / 2)
  const lengths = words.map(w => w.length).sort((a, b) => a - b)
  let best = 0
  let usedLen = 0
  let usedPairs = 0
  for (const len of lengths) {
    usedLen += len
    usedPairs += Math.floor(len / 2)
    if (usedLen > total || usedPairs > pairs) break
    best += 1
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_palindromes(words):
    counts = {}
    total = 0
    for w in words:
        total += len(w)
        for ch in w:
            counts[ch] = counts.get(ch, 0) + 1
    pairs = sum(c // 2 for c in counts.values())
    lengths = sorted(len(w) for w in words)
    best = 0
    used_len = 0
    used_pairs = 0
    for L in lengths:
        used_len += L
        used_pairs += L // 2
        if used_len > total or used_pairs > pairs:
            break
        best += 1
    return best
`
