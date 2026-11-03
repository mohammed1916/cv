// LeetCode 1243: Array Transformation. Each round reads the previous round and updates every
// interior element at once: a value strictly below both neighbours rises by one, a value strictly
// above both falls by one, and the endpoints never change. Stop when a round changes nothing.
const MAX_LENGTH = 12
const MAX_ABS = 100

export const phases = [
  { id: 'setup', label: 'Start', description: 'Read the array; endpoints stay fixed.' },
  { id: 'round', label: 'Round', description: 'Copy the previous round as the base.' },
  { id: 'rise', label: 'Rise', description: 'Below both neighbours: add one.' },
  { id: 'fall', label: 'Fall', description: 'Above both neighbours: subtract one.' },
  { id: 'hold', label: 'Hold', description: 'Neither rule applies; keep the value.' },
  { id: 'done', label: 'Stable', description: 'No change this round; report the array.' },
]

export const code = `FUNCTION transform(arr)
    current ← copy of arr
    LOOP
        next ← copy of current
        FOR i from 1 to length - 2
            IF current[i] < current[i-1] AND current[i] < current[i+1] THEN next[i] ← current[i] + 1
            ELSE IF current[i] > current[i-1] AND current[i] > current[i+1] THEN next[i] ← current[i] - 1
        IF next equals current THEN RETURN current
        current ← next`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def transform(arr):
    current = list(arr)
    while True:
        nxt = list(current)
        for i in range(1, len(current) - 1):
            if current[i] < current[i - 1] and current[i] < current[i + 1]:
                nxt[i] = current[i] + 1
            elif current[i] > current[i - 1] and current[i] > current[i + 1]:
                nxt[i] = current[i] - 1
        if nxt == current:
            return current
        current = nxt


if __name__ == "__main__":
    import sys, json
    print(json.dumps(transform(json.loads(sys.stdin.read()))))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const arr = typeof text === 'string' ? JSON.parse(text) : text
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > MAX_LENGTH) throw new Error(`Use an array of 1 to ${MAX_LENGTH} integers.`)
  if (!arr.every(value => Number.isInteger(value) && Math.abs(value) <= MAX_ABS)) throw new Error(`Each value is an integer between -${MAX_ABS} and ${MAX_ABS}.`)
  return arr
}

export function buildTrace(arr) {
  const frames = []
  const history = [arr.slice()]
  let current = arr.slice()
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    round: history.length - 1, history: history.map(row => row.slice()), i: -1, decision: null, ...extra,
  })
  emit('setup', 'current ← copy of arr', 'current = list(arr)', `${arr.length} values; the first and last never move.`)
  for (;;) {
    const next = current.slice()
    emit('round', 'next ← copy of current', 'nxt = list(current)', `Round ${history.length}: every change reads round ${history.length - 1}.`)
    for (let i = 1; i < current.length - 1; i += 1) {
      if (current[i] < current[i - 1] && current[i] < current[i + 1]) {
        next[i] = current[i] + 1
        emit('rise', 'THEN next[i] ← current[i] + 1', 'nxt[i] = current[i] + 1', `${current[i]} is below both neighbours ${current[i - 1]} and ${current[i + 1]}; rise to ${next[i]}.`, { i, decision: 'rise' })
      } else if (current[i] > current[i - 1] && current[i] > current[i + 1]) {
        next[i] = current[i] - 1
        emit('fall', 'THEN next[i] ← current[i] - 1', 'nxt[i] = current[i] - 1', `${current[i]} is above both neighbours ${current[i - 1]} and ${current[i + 1]}; fall to ${next[i]}.`, { i, decision: 'fall' })
      } else {
        emit('hold', 'ELSE IF current[i] > current[i-1]', 'elif current[i] > current[i - 1]', `${current[i]} sits between its neighbours; it holds.`, { i, decision: 'hold' })
      }
    }
    const changed = next.some((value, k) => value !== current[k])
    if (!changed) {
      history.push(next.slice())
      emit('done', 'IF next equals current THEN RETURN current', 'if nxt == current', 'Nothing changed in this round, so the array is stable.', { round: history.length - 1 })
      return { input: arr.slice(), result: current.slice(), frames }
    }
    current = next
    history.push(current.slice())
  }
}
