// LeetCode 1215: Stepping Numbers. Walk outward from each leading digit 1 to 9, changing the
// last digit by exactly one, and keep every walk value that falls inside [low, high].
const MAX_HIGH = 1000

export const phases = [
  { id: 'setup', label: 'Range', description: 'Read the inclusive range.' },
  { id: 'seed', label: 'Seed', description: 'Start a walk at a leading digit.' },
  { id: 'visit', label: 'Visit', description: 'Take the next number from the queue.' },
  { id: 'accept', label: 'Report', description: 'The number lies in the range.' },
  { id: 'extend', label: 'Extend', description: 'Append the neighbouring last digits.' },
  { id: 'done', label: 'Result', description: 'Sort the reported numbers.' },
]

export const code = `FUNCTION steppingNumbers(low, high)
    result ← empty list
    IF low is 0 THEN append 0 to result
    FOR seed from 1 to 9
        queue ← [seed]
        WHILE queue is not empty
            x ← pop front of queue
            IF x > high THEN skip x
            IF x ≥ low THEN append x to result
            d ← last digit of x
            IF d > 0 AND x*10 + d - 1 ≤ high THEN push x*10 + d - 1
            IF d < 9 AND x*10 + d + 1 ≤ high THEN push x*10 + d + 1
    sort result ascending
    RETURN result`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `from collections import deque


def stepping_numbers(low, high):
    result = []
    if low == 0:
        result.append(0)
    for seed in range(1, 10):
        queue = deque([seed])
        while queue:
            x = queue.popleft()
            if x > high:
                continue
            if x >= low:
                result.append(x)
            d = x % 10
            if d > 0 and x * 10 + d - 1 <= high:
                queue.append(x * 10 + d - 1)
            if d < 9 and x * 10 + d + 1 <= high:
                queue.append(x * 10 + d + 1)
    return sorted(result)


if __name__ == "__main__":
    import sys, json
    data = json.loads(sys.stdin.read())
    print(json.dumps(stepping_numbers(data["low"], data["high"])))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with low and high.')
  const { low, high } = input
  if (!Number.isInteger(low) || !Number.isInteger(high) || low < 0) throw new Error('low and high are nonnegative integers.')
  if (low > high) throw new Error('low must not exceed high.')
  if (high > MAX_HIGH) throw new Error(`The visualization caps high at ${MAX_HIGH}.`)
  return { low, high }
}

export function buildTrace({ low, high }) {
  const result = []
  const frames = []
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    seed: null, queue: [], current: null, pushed: [], result: result.slice(), ...extra,
  })

  emit('setup', 'result ← empty list', 'result = []', `Find stepping numbers from ${low} to ${high}.`)
  if (low === 0) {
    result.push(0)
    emit('setup', 'IF low is 0', 'if low == 0', '0 is a single digit, so it qualifies.')
  }
  for (let seed = 1; seed <= 9; seed += 1) {
    const queue = [seed]
    emit('seed', 'FOR seed from 1 to 9', 'for seed in range(1, 10)', `Start a walk at digit ${seed}.`, { seed, queue: queue.slice() })
    while (queue.length) {
      const x = queue.shift()
      emit('visit', 'x ← pop front', 'x = queue.popleft()', `Take ${x} from the front of the queue.`, { seed, queue: queue.slice(), current: x })
      if (x > high) {
        emit('visit', 'IF x > high', 'if x > high', `${x} is above ${high}; its extensions only grow, so skip it.`, { seed, queue: queue.slice(), current: x })
        continue
      }
      if (x >= low) {
        result.push(x)
        emit('accept', 'IF x ≥ low', 'if x >= low', `${x} is inside the range; report it.`, { seed, queue: queue.slice(), current: x })
      } else {
        emit('visit', 'IF x ≥ low', 'if x >= low', `${x} is below ${low}; keep walking without reporting it.`, { seed, queue: queue.slice(), current: x })
      }
      const d = x % 10
      const pushed = []
      if (d > 0 && x * 10 + d - 1 <= high) pushed.push(x * 10 + d - 1)
      if (d < 9 && x * 10 + d + 1 <= high) pushed.push(x * 10 + d + 1)
      for (const next of pushed) queue.push(next)
      emit('extend', 'd ← last digit of x', 'd = x % 10', `Last digit ${d}; neighbours ${d - 1} and ${d + 1} are allowed where they exist.`, { seed, queue: queue.slice(), current: x, pushed })
    }
  }
  result.sort((a, b) => a - b)
  emit('done', 'sort result ascending', 'return sorted(result)', `${result.length} stepping number${result.length === 1 ? '' : 's'} in the range.`, { result: result.slice() })
  return { input: { low, high }, result: result.slice(), frames }
}
