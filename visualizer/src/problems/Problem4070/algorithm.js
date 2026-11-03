// The dial is a circle of ten digits, so the cost between two digits is the shorter way round.
// The dial starts at zero and each digit of the string is reached in turn; repeating a digit costs nothing.

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

export function parseInput(text) {
  const trimmed = text.trim()
  const s = /^".*"$/.test(trimmed) ? JSON.parse(trimmed) : trimmed
  if (typeof s !== 'string' || !/^\d{10}$/.test(s)) throw new Error('Enter exactly ten decimal digits, with or without quotes.')
  return s
}

export function circularCost(a, b) {
  const diff = Math.abs(a - b)
  return Math.min(diff, 10 - diff)
}

export function buildTrace(s) {
  const frames = []
  let current = 0
  let total = 0
  frames.push({
    phase: 'start', activeLine: L('current ← 0'), pythonLine: P('cur = 0'),
    index: -1, from: 0, to: null, steps: null, total, current, message: 'The pointer starts at 0 with no steps taken.',
  })
  for (let index = 0; index < s.length; index++) {
    const to = Number(s[index])
    const steps = circularCost(current, to)
    total += steps
    frames.push({
      phase: 'dial', activeLine: L('steps ← the shorter'), pythonLine: P('total += min(diff'),
      index, from: current, to, steps, total, current: to,
      message: `Turn from ${current} to ${to}: ${steps} step${steps === 1 ? '' : 's'} the short way round. Running total ${total}.`,
    })
    current = to
  }
  frames.push({
    phase: 'done', activeLine: L('RETURN total'), pythonLine: P('return total'),
    index: -1, from: current, to: null, steps: null, total, current, message: `Minimum total steps: ${total}.`,
  })
  return { input: s, result: total, frames }
}

export const code = `FUNCTION minRotations(s)
    current ← 0; total ← 0
    FOR each digit d in s
        diff ← absolute difference of current and d
        steps ← the shorter of diff and 10 − diff
        total ← total + steps
        current ← d
    RETURN total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_rotations(s):
    cur = 0
    total = 0
    for ch in s:
        d = int(ch)
        diff = abs(d - cur)
        total += min(diff, 10 - diff)
        cur = d
    return total


if __name__ == "__main__":
    import json
    import sys
    text = sys.stdin.read().strip()
    if text.startswith('"'):
        text = json.loads(text)
    print(min_rotations(text))
`
