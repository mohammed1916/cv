export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 's') throw new Error('Use a JSON object with exactly one key, s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 2 || s.length > 40) throw new Error('s must be a string of 2 to 40 digits.')
  if (!/^[0-9]+$/.test(s)) throw new Error('s may contain only the digits 0 to 9.')
  return { s }
}

export function buildTrace({ s }) {
  const counts = Array(10).fill(0)
  for (const ch of s) counts[Number(ch)]++
  const frames = [{ phase: 'count', activeLine: L('count how many times'), start: -1, counts: [...counts], message: 'Count how many times each digit appears.' }]
  let result = ''
  for (let i = 0; i + 1 < s.length; i++) {
    const a = Number(s[i])
    const b = Number(s[i + 1])
    const ok = a !== b && counts[a] === a && counts[b] === b
    if (ok) {
      result = `${a}${b}`
      frames.push({ phase: 'found', activeLine: L('return a followed'), start: i, counts: [...counts], message: `Digits ${a} and ${b} differ, ${a} appears ${a} times and ${b} appears ${b} times. Return ${result}.` })
      break
    }
    frames.push({ phase: 'scan', activeLine: L('if a and b are different'), start: i, counts: [...counts], message: `Pair ${s[i]}${s[i + 1]} fails: ${a === b ? 'the digits are equal' : `${a} appears ${counts[a]} times and ${b} appears ${counts[b]} times`}.` })
  }
  if (!result) frames.push({ phase: 'none', activeLine: L('return empty text'), start: -1, counts: [...counts], message: 'No adjacent pair is valid, so the answer is empty text.' })
  return { input: { s }, result, frames }
}

export const code = `first valid adjacent pair:
  count how many times each digit appears in s
  for each start position i from the first to the second-to-last
    let a be the digit at i and b the digit at i plus 1
    if a and b are different and a appears exactly a times and b appears exactly b times then
      return a followed by b
  return empty text`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def valid_adjacent_pair(s):
    counts = [0] * 10
    for ch in s:
        counts[int(ch)] += 1
    for i in range(len(s) - 1):
        a, b = int(s[i]), int(s[i + 1])
        if a != b and counts[a] == a and counts[b] == b:
            return s[i] + s[i + 1]
    return ''
`
