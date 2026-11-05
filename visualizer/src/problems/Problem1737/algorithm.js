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
  const frames = [{ phase: 'count', pythonLine: 8, activeLine: L('const countA = Array(26)'), boundary: null, best, message: `Making both strings one letter costs ${best} changes.` }]
  for (let boundary = 1; boundary < 26; boundary++) {
    const aHigh = sumOf(countA.slice(boundary))
    const bLow = sumOf(countB.slice(0, boundary))
    const bHigh = sumOf(countB.slice(boundary))
    const aLow = sumOf(countA.slice(0, boundary))
    const costAB = aHigh + bLow
    const costBA = bHigh + aLow
    best = Math.min(best, costAB, costBA)
    frames.push({ phase: 'boundary', pythonLine: 12, activeLine: L('for (let boundary = 1'), boundary, best, message: `Boundary ${String.fromCharCode(97 + boundary)}: a below and b at or above costs ${costAB}; b below and a at or above costs ${costBA}.` })
  }
  frames.push({ phase: 'done', pythonLine: 13, activeLine: L('return best'), boundary: null, best, message: `Fewest changes: ${best}.` })
  return { input, result: best, frames }
}

export const code = `function minChangesThreeRules(a, b) {
  const countA = Array(26).fill(0)
  const countB = Array(26).fill(0)
  for (const ch of a) countA[ch.charCodeAt(0) - 97] += 1
  for (const ch of b) countB[ch.charCodeAt(0) - 97] += 1
  const sum = (list, from, to) => list.slice(from, to).reduce((s, v) => s + v, 0)
  let best = a.length + b.length - Math.max(...countA.map((v, i) => v + countB[i]))
  for (let boundary = 1; boundary < 26; boundary++) {
    const costAB = sum(countA, boundary, 26) + sum(countB, 0, boundary)
    const costBA = sum(countB, boundary, 26) + sum(countA, 0, boundary)
    best = Math.min(best, costAB, costBA)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_changes_three_rules(a, b):
    count_a = [0] * 26
    count_b = [0] * 26
    for ch in a:
        count_a[ord(ch) - 97] += 1
    for ch in b:
        count_b[ord(ch) - 97] += 1
    best = len(a) + len(b) - max(x + y for x, y in zip(count_a, count_b))
    for boundary in range(1, 26):
        cost_ab = sum(count_a[boundary:]) + sum(count_b[:boundary])
        cost_ba = sum(count_b[boundary:]) + sum(count_a[:boundary])
        best = min(best, cost_ab, cost_ba)
    return best
`
