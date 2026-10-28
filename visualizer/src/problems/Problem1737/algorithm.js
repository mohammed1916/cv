export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use an object with string keys a and b.')
  const { a, b } = obj
  for (const s of [a, b]) {
    if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[a-z]+$/.test(s)) throw new Error('a and b are lowercase strings of 1 to 20 letters.')
  }
  return { a, b }
}

const letterIndex = ch => ch.charCodeAt(0) - 97
const sumOf = list => list.reduce((s, v) => s + v, 0)

export function buildTrace(input) {
  const { a, b } = input
  const countA = Array(26).fill(0)
  const countB = Array(26).fill(0)
  for (const ch of a) countA[letterIndex(ch)] += 1
  for (const ch of b) countB[letterIndex(ch)] += 1
  let best = a.length + b.length - Math.max(...countA.map((v, i) => v + countB[i]))
  const frames = [{ phase: 'count', activeLine: L('count the letters'), boundary: null, best, message: `Making both strings one letter costs ${best} changes.` }]
  for (let boundary = 1; boundary < 26; boundary++) {
    const aHigh = sumOf(countA.slice(boundary))
    const bLow = sumOf(countB.slice(0, boundary))
    const bHigh = sumOf(countB.slice(boundary))
    const aLow = sumOf(countA.slice(0, boundary))
    const costAB = aHigh + bLow
    const costBA = bHigh + aLow
    best = Math.min(best, costAB, costBA)
    frames.push({ phase: 'boundary', activeLine: L('for each boundary'), boundary, best, message: `Boundary ${String.fromCharCode(97 + boundary)}: a below and b at or above costs ${costAB}; b below and a at or above costs ${costBA}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), boundary: null, best, message: `Fewest changes: ${best}.` })
  return { input, result: best, frames }
}

export const code = `change the fewest letters to satisfy one of three rules
  count the letters in a and in b
  set best to the cost of making both strings one letter
  for each boundary letter from b to z
    set cost1 to changes that put a below the boundary and b at or above it
    set cost2 to changes that put b below the boundary and a at or above it
    if cost1 or cost2 is below best then
      set best to the smaller of them
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_changes(a, b):
    count_a = [0] * 26
    count_b = [0] * 26
    for ch in a:
        count_a[ord(ch) - 97] += 1
    for ch in b:
        count_b[ord(ch) - 97] += 1
    best = len(a) + len(b) - max(count_a[c] + count_b[c] for c in range(26))
    for boundary in range(1, 26):
        a_high = sum(count_a[boundary:])
        b_low = sum(count_b[:boundary])
        b_high = sum(count_b[boundary:])
        a_low = sum(count_a[:boundary])
        best = min(best, a_high + b_low, b_high + a_low)
    return best
`
