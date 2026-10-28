export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.s !== 'string' || typeof data.pattern !== 'string') throw new Error('Use an object with strings s and pattern, for example {"s":"abcdefg","pattern":"bcdffg"}.')
  if (data.s.length < 2 || data.s.length > 40) throw new Error('s must have 2 to 40 characters.')
  if (data.pattern.length < 1 || data.pattern.length >= data.s.length) throw new Error('pattern must be non-empty and shorter than s.')
  if (!/^[a-z]+$/.test(data.s) || !/^[a-z]+$/.test(data.pattern)) throw new Error('Use lowercase letters only.')
  return { s: data.s, pattern: data.pattern }
}

export function buildTrace(input) {
  const { s, pattern } = input
  const m = pattern.length
  const frames = [{ phase: 'start', activeLine: L('for each start index'), start: -1, length: m, mismatches: 0, result: null, message: `Try every window of length ${m} in s. A window qualifies if it differs from pattern in at most one place.` }]
  for (let i = 0; i + m <= s.length; i++) {
    let mismatches = 0
    frames.push({ phase: 'window', activeLine: L('set mismatches to 0'), start: i, length: m, mismatches, result: null, message: `Window starts at ${i}.` })
    for (let j = 0; j < m; j++) {
      if (s[i + j] !== pattern[j]) mismatches += 1
      if (mismatches > 1) break
    }
    if (mismatches > 1) {
      frames.push({ phase: 'reject', activeLine: L('stop this start index'), start: i, length: m, mismatches, result: null, message: `Window ${i} has more than one mismatch, so it is rejected.` })
      continue
    }
    frames.push({ phase: 'match', activeLine: L('return i'), start: i, length: m, mismatches, result: i, message: `Window ${i} has ${mismatches} mismatch${mismatches === 1 ? '' : 'es'}, so the answer is ${i}.` })
    return { input, result: i, frames }
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), start: -1, length: m, mismatches: 0, result: -1, message: 'No window qualifies, so the answer is -1.' })
  return { input, result: -1, frames }
}

export const code = `first almost equal occurrence (s, pattern)
  for each start index i from 0 to len(s) minus len(pattern)
    set mismatches to 0
    for each position j in pattern
      if s at i plus j differs from pattern at j then
        add 1 to mismatches
      if mismatches is greater than 1 then
        stop this start index
    if mismatches is at most 1 then
      return i
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def first_almost_equal(s, pattern):
    m = len(pattern)
    for i in range(len(s) - m + 1):
        mismatches = 0
        for j in range(m):
            if s[i + j] != pattern[j]:
                mismatches += 1
            if mismatches > 1:
                break
        if mismatches <= 1:
            return i
    return -1
`
