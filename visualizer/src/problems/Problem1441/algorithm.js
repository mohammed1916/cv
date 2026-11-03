export const phases = [
  { id: 'advance', label: 'Next target value', description: 'Look at the next value the target needs.' },
  { id: 'skip', label: 'Skip value', description: 'Push and pop a value that the target does not use.' },
  { id: 'take', label: 'Keep value', description: 'Push the value and leave it on the stack.' },
  { id: 'answer', label: 'Answer', description: 'Once the last target value is kept, the operation list is complete.' },
]

const PYTHON = `def build_with_stack(target, n):
    ops = []
    cur = 1
    for v in target:
        while cur < v:
            ops.append("Push")
            ops.append("Pop")
            cur += 1
        ops.append("Push")
        cur = v + 1
    return ops`

export const python = PYTHON
export const code = PYTHON.split('\n').map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))
const lineAt = marker => code.find(({ text }) => text.includes(marker)).line

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.target) || !Number.isInteger(data.n)) {
    throw new Error('Enter an object like {"target": [1,3], "n": 3}.')
  }
  if (data.n < 1 || data.n > 100) throw new Error('n must be between 1 and 100.')
  if (data.target.length < 1 || data.target.length > data.n) throw new Error('target needs between 1 and n values.')
  data.target.forEach((v, i) => {
    if (!Number.isInteger(v) || v < 1 || v > data.n) throw new Error(`target[${i}] must be an integer from 1 to ${data.n}.`)
    if (i > 0 && v <= data.target[i - 1]) throw new Error('target must be strictly increasing.')
  })
  return { target: data.target, n: data.n }
}

/** Numbers 1..n are read in order: each one is pushed, and popped again if the target skips it. */
export function buildTrace({ target, n }) {
  const frames = []
  const ops = []
  const stack = []
  let cur = 1
  const snap = (index, skipped = null) => ({ target, n, index, stack: [...stack], next: cur, ops: [...ops], skipped })

  frames.push({ phase: 'advance', activeLine: lineAt('ops = []'), message: `The stream will read 1 to ${n}. The target is [${target.join(', ')}].`, snapshot: snap(null) })
  target.forEach((v, index) => {
    frames.push({ phase: 'advance', activeLine: lineAt('for v in target'), message: `The target needs ${v} next. The stream is at ${cur}.`, snapshot: snap(index) })
    while (cur < v) {
      ops.push('Push', 'Pop')
      frames.push({ phase: 'skip', activeLine: lineAt('ops.append("Push")'), message: `${cur} is not in the target, so push it and pop it again.`, snapshot: snap(index, cur) })
      cur += 1
      frames.push({ phase: 'skip', activeLine: lineAt('cur += 1'), message: `Stream advances to ${cur}.`, snapshot: snap(index, null) })
    }
    ops.push('Push')
    stack.push(v)
    cur = v + 1
    frames.push({ phase: 'take', activeLine: lineAt('cur = v + 1'), message: `Push ${v} and keep it. The stack is now [${stack.join(', ')}].`, snapshot: snap(index) })
  })
  frames.push({ phase: 'answer', activeLine: lineAt('return ops'), message: `Operations: ${ops.join(', ')}.`, snapshot: snap(null) })
  return { input: { target, n }, result: [...ops], frames }
}
