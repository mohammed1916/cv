export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.start !== 'string' || typeof obj.end !== 'string') throw new Error('Enter a JSON object like {"start":"RXXLRXRXL","end":"XRLXXRRLX"}.')
  const { start, end } = obj
  if (start.length < 1 || start.length > 60 || end.length !== start.length || !/^[LRX]+$/.test(start) || !/^[LRX]+$/.test(end)) throw new Error('start and end must be equal-length strings of 1-60 characters using only L, R and X (visualization cap: 60).')
  return { start, end }
}
export function buildTrace({ start, end }) {
  const n = start.length
  const frames = [{ phase: 'start', activeLine: 1, i: 0, j: 0, message: 'An R can only move right and an L only left, and they never cross. So the non-X letters must match in order, with each R no further right in start than in end, and each L no further left.' }]
  let i = 0, j = 0
  const done = (result, message, line) => { frames.push({ phase: 'done', activeLine: line, i, j, message }); return { input: { start, end }, result, frames } }
  for (;;) {
    while (i < n && start[i] === 'X') i++
    while (j < n && end[j] === 'X') j++
    frames.push({ phase: 'skip', activeLine: 4, i, j, message: `Skip X on both strings: pointer i = ${i}${i < n ? ` ('${start[i]}')` : ' (end)'}, j = ${j}${j < n ? ` ('${end[j]}')` : ' (end)'}.` })
    if (i === n || j === n) {
      const ok = i === n && j === n
      frames.push({ phase: 'compare', activeLine: 5, i, j, message: ok ? 'Both strings ran out of L/R letters together.' : 'One string has an extra L or R that the other lacks.' })
      return done(ok, ok ? 'Return True.' : 'Return False: letter counts differ.', 6)
    }
    if (start[i] !== end[j]) {
      frames.push({ phase: 'compare', activeLine: 7, i, j, message: `start[${i}] = '${start[i]}' but end[${j}] = '${end[j]}': the letter order differs, and L and R can never pass each other.` })
      return done(false, 'Return False.', 8)
    }
    if (start[i] === 'L' && i < j) {
      frames.push({ phase: 'compare', activeLine: 9, i, j, message: `This L must go from ${i} to ${j}, which is to the right. L only moves left, so this is impossible.` })
      return done(false, 'Return False.', 10)
    }
    if (start[i] === 'R' && i > j) {
      frames.push({ phase: 'compare', activeLine: 11, i, j, message: `This R must go from ${i} to ${j}, which is to the left. R only moves right, so this is impossible.` })
      return done(false, 'Return False.', 12)
    }
    frames.push({ phase: 'match', activeLine: 13, i, j, message: `'${start[i]}' at ${i} can reach ${j} (${start[i] === 'L' ? 'moving left or staying' : 'moving right or staying'}). Advance both pointers.` })
    i++
    j++
  }
}
export const code = `let n be the length of start, and set i = 0 and j = 0
loop forever
  while i < n and start[i] is X, increase i by 1
  while j < n and end[j] is X, increase j by 1
  if i equals n or j equals n then
    return True if i equals n and j equals n, else False
  if start[i] differs from end[j] then
    return False
  if start[i] is L and i is less than j then
    return False
  if start[i] is R and i is greater than j then
    return False
  increase i and j by 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def can_transform(start, end):
    n = len(start)
    i = j = 0
    while True:
        while i < n and start[i] == 'X':
            i += 1
        while j < n and end[j] == 'X':
            j += 1
        if i == n or j == n:
            return i == n and j == n
        if start[i] != end[j]:
            return False
        if start[i] == 'L' and i < j:
            return False
        if start[i] == 'R' and i > j:
            return False
        i += 1
        j += 1
`
