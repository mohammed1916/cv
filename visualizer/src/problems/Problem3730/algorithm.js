// Maximum calories burnt from jumps.
// Start on the ground (height 0) and visit every block once, in any order. A jump from a to b earns (a - b)^2.
// Zigzag rule: after the ground, jump to the highest unvisited block, then the lowest, then the highest, and so on.
// This alternation maximises the sum of squared jumps; the test sweep checks it against every order on small inputs.

const CODE_TEXT = `FUNCTION maxCalories(heights)
    values ← heights sorted ascending
    lo ← 0; hi ← last index of values
    current ← 0; total ← 0; takeHighest ← TRUE
    WHILE lo ≤ hi
        IF takeHighest THEN next ← values[hi]; hi ← hi - 1
        ELSE next ← values[lo]; lo ← lo + 1
        total ← total + (current - next)^2
        current ← next
        takeHighest ← NOT takeHighest
    RETURN total`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `def max_calories(heights):
    values = sorted(heights)
    lo, hi = 0, len(values) - 1
    current, total, take_highest = 0, 0, True
    while lo <= hi:
        if take_highest:
            nxt = values[hi]
            hi -= 1
        else:
            nxt = values[lo]
            lo += 1
        total += (current - nxt) ** 2
        current = nxt
        take_highest = not take_highest
    return total


if __name__ == "__main__":
    import json
    import sys
    print(json.dumps(max_calories(json.loads(sys.stdin.read()))))
`

const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'sort', label: 'Sort', description: 'Order the blocks by height and mark both ends.' },
  { id: 'jump', label: 'Jump', description: 'Take the highest or lowest unvisited block and earn the squared drop.' },
  { id: 'done', label: 'Total', description: 'Report the maximum calories.' },
]

export function parseInput(text) {
  const heights = JSON.parse(text)
  if (!Array.isArray(heights) || heights.length < 1 || heights.length > 10) throw new Error('Use a list of 1 to 10 block heights.')
  if (!heights.every(h => Number.isInteger(h) && h >= 0 && h <= 50)) throw new Error('Each height is an integer from 0 to 50.')
  return heights
}

export function buildTrace(heights) {
  const values = [...heights].sort((a, b) => a - b)
  const frames = []
  let lo = 0
  let hi = values.length - 1
  let current = 0
  let total = 0
  let takeHighest = true
  const route = [0]
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message, values, lo, hi, current, total, route: [...route],
    takeHighest, picked: null, from: null, earned: null, ...extra,
  })
  push('sort', 'values ← heights sorted ascending', 'values = sorted(heights)', `Blocks sorted: ${values.join(', ')}. Start on the ground at 0.`)
  while (lo <= hi) {
    let next
    if (takeHighest) {
      next = values[hi]
      push('jump', 'IF takeHighest THEN', 'if take_highest', `Jump to the highest unvisited block ${next}.`, { picked: 'hi', from: current, earned: (current - next) ** 2 })
      hi -= 1
    } else {
      next = values[lo]
      push('jump', 'ELSE next ← values[lo]', 'nxt = values[lo]', `Jump to the lowest unvisited block ${next}.`, { picked: 'lo', from: current, earned: (current - next) ** 2 })
      lo += 1
    }
    total += (current - next) ** 2
    current = next
    route.push(next)
    takeHighest = !takeHighest
    push('jump', 'takeHighest ← NOT takeHighest', 'take_highest = not take_highest', `Landed on ${next}; running total ${total}.`, { picked: null, from: null, earned: null })
  }
  push('done', 'RETURN total', 'return total', `Maximum calories: ${total}.`, { lo, hi, picked: null })
  return { input: heights, result: total, frames }
}
