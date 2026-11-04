const codeLines = `function mirrorDistance(s) {
  // count the frequency of every letter and digit in s
  const freq = new Map()
  for (const ch of s) freq.set(ch, (freq.get(ch) || 0) + 1)
  // a letter mirrors around the alphabet, a digit mirrors around 0 to 9
  const mirror = ch => {
    if (ch >= 'a' && ch <= 'z') return String.fromCharCode('a'.charCodeAt(0) + 25 - (ch.charCodeAt(0) - 97))
    return String.fromCharCode('0'.charCodeAt(0) + 9 - (ch.charCodeAt(0) - 48))
  }
  let total = 0
  const seen = new Set()
  // each mirror pair (c, m) is visited once
  for (const ch of new Set([...freq.keys(), ...[...freq.keys()].map(mirror)])) {
    const m = mirror(ch)
    const key = [ch, m].sort().join('')
    if (seen.has(key)) continue
    seen.add(key)
    // total += absolute difference of freq(c) and freq(m)
    total += Math.abs((freq.get(ch) || 0) - (freq.get(m) || 0))
  }
  // return total
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `def mirror(ch):
    if 'a' <= ch <= 'z':
        return chr(ord('a') + 25 - (ord(ch) - ord('a')))
    return chr(ord('0') + 9 - (ord(ch) - ord('0')))

def mirror_distance(s):
    freq = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    total = 0
    seen = set()
    for ch in set(freq) | set(mirror(c) for c in freq):
        m = mirror(ch)
        pair = tuple(sorted((ch, m)))
        if pair in seen:
            continue
        seen.add(pair)
        total += abs(freq.get(ch, 0) - freq.get(m, 0))
    return total`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

export function mirror(ch) {
  if (ch >= 'a' && ch <= 'z') return String.fromCharCode('a'.charCodeAt(0) + 25 - (ch.charCodeAt(0) - 97))
  return String.fromCharCode('0'.charCodeAt(0) + 9 - (ch.charCodeAt(0) - 48))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string') throw new Error('Use an object with s, a string of lowercase letters and digits.')
  const { s } = input
  if (s.length < 1 || s.length > 60) throw new Error('s has 1 to 60 characters in this visual.')
  if (!/^[a-z0-9]+$/.test(s)) throw new Error('s uses only lowercase letters and digits.')
  return { s }
}

export function buildTrace({ s }) {
  const freq = {}
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1
  const frames = [{ phase: 'count', activeLine: L('count the frequency'), pythonLine: P('freq[ch] ='), pair: null, freq: { ...freq }, total: 0,
    message: `Counted ${Object.keys(freq).length} distinct character${Object.keys(freq).length === 1 ? '' : 's'}.` }]
  const seen = new Set()
  let total = 0
  const chars = [...new Set([...Object.keys(freq), ...Object.keys(freq).map(mirror)])].sort()
  for (const ch of chars) {
    const m = mirror(ch)
    const key = [ch, m].sort().join('')
    if (seen.has(key)) continue
    seen.add(key)
    const diff = Math.abs((freq[ch] || 0) - (freq[m] || 0))
    total += diff
    frames.push({ phase: 'pair', activeLine: L('total += absolute'), pythonLine: P('total += abs'), pair: [ch, m], freq: { ...freq }, diff, total,
      message: `${ch} and ${m}: |${freq[ch] || 0} - ${freq[m] || 0}| = ${diff}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), pair: null, freq: { ...freq }, total,
    message: `Total distance: ${total}.` })
  return { input: { s }, result: total, frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
