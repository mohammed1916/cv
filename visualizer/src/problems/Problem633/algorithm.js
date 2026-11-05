export function parseInput(text) {
  const c = JSON.parse(text)
  if (!Number.isInteger(c) || c < 0 || c > 2147483647) throw new Error('Enter an integer c from 0 to 2,147,483,647.')
  return c
}

// Two pointers over the squares 0², 1², …, floor(√c)². The sum only grows when left moves right and
// only shrinks when right moves left, so the pointers can never skip a valid pair.
export function buildTrace(c) {
  const top = Math.floor(Math.sqrt(c))
  let left = 0
  let right = top
  const frames = [{ phase: 'start', c, left, right, sum: null, result: null, activeLine: L('let left = 0'), pythonLine: P('left = 0'), message: `Put left on 0² and right on ${top}², the largest square not above ${c}.` }]
  let result = false
  while (left <= right) {
    const sum = left * left + right * right
    const hit = sum === c
    frames.push({ phase: 'inspect', c, left, right, sum, result: null, activeLine: L('const sum'), pythonLine: P('total = '), message: `${left}² + ${right}² = ${sum} compared with ${c}.` })
    if (hit) { result = true; break }
    if (sum < c) {
      left++
      frames.push({ phase: 'update', c, left, right, sum, result: null, activeLine: L('left++'), pythonLine: P('left += 1'), message: `${sum} is below ${c}: move left up to ${left}², which increases the sum.` })
    } else {
      right--
      frames.push({ phase: 'update', c, left, right, sum, result: null, activeLine: L('right--'), pythonLine: P('right -= 1'), message: `${sum} is above ${c}: move right down to ${right}², which decreases the sum.` })
    }
  }
  frames.push({ phase: 'done', c, left, right, sum: null, result, activeLine: L(result ? 'return true' : 'return false'), pythonLine: P(result ? 'return True' : 'return False'), message: result ? `${c} = ${left}² + ${right}².` : `The pointers crossed without a match, so ${c} is not a sum of two squares.` })
  return { input: c, result, frames }
}

const SOURCE = `function judgeSquareSum(c) {
  let left = 0
  let right = Math.floor(Math.sqrt(c))
  while (left <= right) {
    const sum = left * left + right * right
    if (sum === c) return true
    if (sum < c) left++
    else right--
  }
  return false
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
