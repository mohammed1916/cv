// LeetCode 2169: Count Operations to Obtain Zero.
// Each operation subtracts the smaller value from the larger one. Stop as soon as one value is 0.

const MAX_VALUE = 60

export function parseInput(text) {
  let pair
  try { pair = JSON.parse(text) } catch { throw new Error('Use a JSON pair of non-negative integers, e.g. [5,4].') }
  if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 0)) throw new Error('Use exactly two non-negative integers.')
  if (pair.some(v => v > MAX_VALUE)) throw new Error(`Each value is at most ${MAX_VALUE}. The visualization caps values there so every subtraction can be shown.`)
  return { num1: pair[0], num2: pair[1] }
}

export const code = `FUNCTION countOperations(num1, num2)
    ans ← 0
    WHILE num1 is not 0 AND num2 is not 0
        IF num1 >= num2 THEN
            num1 ← num1 - num2
        ELSE
            num2 ← num2 - num1
        ans ← ans + 1
    RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_operations(num1, num2):
    ans = 0
    while num1 and num2:
        if num1 >= num2:
            num1 -= num2
        else:
            num2 -= num1
        ans += 1
    return ans
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Both values are present, so operations continue.' },
  { id: 'step', label: 'Subtract', description: 'Subtract the smaller value from the larger one.' },
  { id: 'done', label: 'Result', description: 'One value reached 0.' },
]

export function buildTrace({ num1, num2 }) {
  let a = num1
  let b = num2
  let ans = 0
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index: -1, activeLine, pythonLine, message, a, b, ans, ...extra })
  push('start', L('ans ← 0'), P('ans = 0'), `Start with ${a} and ${b}. Neither is 0, so the loop runs.`)
  while (a !== 0 && b !== 0) {
    const from = a >= b ? 'num1' : 'num2'
    if (a >= b) a -= b
    else b -= a
    ans += 1
    push('step', from === 'num1' ? L('num1 ← num1 - num2') : L('num2 ← num2 - num1'), from === 'num1' ? P('num1 -= num2') : P('num2 -= num1'),
      `${from} is the larger (or equal) value, so it loses the smaller one. Now ${a} and ${b}. Operations so far: ${ans}.`, { subtracted: from })
  }
  push('done', L('RETURN ans'), P('return ans'), `Operations: ${ans}. One value is now 0.`)
  return { input: { num1, num2 }, result: ans, frames }
}
