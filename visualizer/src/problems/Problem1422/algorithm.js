export const phases = [
  { id: 'setup', label: 'Setup', description: 'Count every one in the string. At the start the whole string is on the right side.' },
  { id: 'move', label: 'Move a character', description: 'Move the next character to the left part. A 0 adds a zero to the left; a 1 removes a one from the right.' },
  { id: 'score', label: 'Score split', description: 'The score of this split is the zeros on the left plus the ones on the right.' },
  { id: 'result', label: 'Result', description: 'Return the best score over all splits into two nonempty parts.' },
]

export const python = `def max_score(s):
    ones_right = s.count("1")
    zeros_left = 0
    best = 0
    for i in range(len(s) - 1):
        if s[i] == "0":
            zeros_left += 1
        else:
            ones_right -= 1
        best = max(best, zeros_left + ones_right)
    return best`

const pythonLines = python.split('\n')
export const code = pythonLines.map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = Object.fromEntries(pythonLines.map((_, index) => [index + 1, index + 1]))

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON string of 0 and 1 characters.') }
  if (typeof value !== 'string' || value.length < 2 || value.length > 500) throw new Error('Enter a JSON string of 2 to 500 characters.')
  if (!/^[01]+$/.test(value)) throw new Error('Only the characters 0 and 1 can appear.')
  return value
}

export function buildTrace(s) {
  const frames = []
  const onesTotal = [...s].filter(c => c === '1').length
  let zerosLeft = 0
  let onesRight = onesTotal
  let best = 0
  const push = (phase, activeLine, message, current = -1, score = null) => frames.push({
    phase, activeLine, message,
    snapshot: { current, zerosLeft, onesRight, best, score, total: onesTotal },
  })

  push('setup', 2, `The string has ${onesTotal} ones. Before any move, the left part is empty and all ones are on the right.`)
  for (let i = 0; i < s.length - 1; i++) {
    if (s[i] === '0') {
      zerosLeft += 1
      push('move', 7, `Position ${i + 1} is 0. The left part gains a zero: ${zerosLeft} zeros on the left.`, i)
    } else {
      onesRight -= 1
      push('move', 8, `Position ${i + 1} is 1. It leaves the right part, which now has ${onesRight} ones.`, i)
    }
    const score = zerosLeft + onesRight
    best = Math.max(best, score)
    push('score', 9, `Split after position ${i + 1}: ${zerosLeft} + ${onesRight} = ${score}. Best so far: ${best}.`, i, score)
  }

  push('result', 10, `Done: the best split scores ${best}.`, -1, best)
  return { input: s, result: best, frames }
}
