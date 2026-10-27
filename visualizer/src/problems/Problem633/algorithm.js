export function parseInput(text) {
  const c = JSON.parse(text)
  if (!Number.isInteger(c) || c < 0 || c > 2147483647) throw new Error('Enter an integer c from 0 to 2,147,483,647.')
  return c
}

export function buildTrace(c) {
  const frames = [{ phase: 'start', a: 0, b: null, c, activeLine: 2, message: `Look for a and b with a² + b² = ${c}.` }]
  let found = null
  for (let a = 0; a * a <= c && !found; a++) {
    const rest = c - a * a
    const b = Math.round(Math.sqrt(rest))
    const isSquare = b * b === rest
    frames.push({ phase: 'try', a, b, rest, isSquare, c, activeLine: 4, message: `a = ${a}: remainder ${rest} ${isSquare ? `= ${b}², a match` : 'is not a perfect square'}.` })
    if (isSquare) found = [a, b]
  }
  const result = found !== null
  frames.push({ phase: 'done', a: found ? found[0] : null, b: found ? found[1] : null, c, result, activeLine: 7, message: result ? `${c} = ${found[0]}² + ${found[1]}².` : `${c} is not a sum of two squares.` })
  return { input: c, result, frames }
}

export const code = `set left to 0 and right to the integer square root of c
while left is at most right
  compute sum as left squared plus right squared
  if sum equals c, return true
  if sum is less than c, increase left by one
  otherwise decrease right by one
return false`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The sequence-family trace reports activeLine 1 (setup), 3 (compare), 5 (return).
export const LINE_MAP = { 1: 1, 3: 3, 5: 7 }

// A true result returns from inside the loop, so the final frame highlights line 4.
export function familyLine(frame) {
  if (frame.phase === 'done' && frame.result === true) return 4
  return LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `from math import isqrt

def judge_square_sum(c):
    left = 0
    right = isqrt(c)
    while left <= right:
        total = left * left + right * right
        if total == c:
            return True
        if total < c:
            left += 1
        else:
            right -= 1
    return False`
