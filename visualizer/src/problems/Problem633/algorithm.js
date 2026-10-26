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

export const code = `def judgeSquareSum(c):
    a = 0
    while a * a <= c:
        b = isqrt(c - a * a)
        if b * b == c - a * a: return True
        a += 1
    return False`.split('\n').map((text, index) => ({ line: index + 1, text }))
