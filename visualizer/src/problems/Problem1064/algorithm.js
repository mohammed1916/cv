export const phases = [
  { id: 'start', label: 'Start', description: 'Set the search window to every index.' },
  { id: 'probe', label: 'Probe middle', description: 'Compare the middle value with its index.' },
  { id: 'earlier', label: 'Keep earlier', description: 'A fixed index was found, so search the left side for an earlier one.' },
  { id: 'move', label: 'Move window', description: 'Discard the half that cannot contain a fixed index.' },
  { id: 'done', label: 'Complete', description: 'Return the smallest fixed index, or -1 when none exists.' },
]

export const code = `function fixedIndex(values) {
  let lo = 0
  let hi = values.length - 1
  let answer = -1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const gap = values[mid] - mid
    if (gap === 0) {
      answer = mid
      hi = mid - 1
    } else if (gap < 0) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def fixed_index(values):
    lo, hi, answer = 0, len(values) - 1, -1
    while lo <= hi:
        mid = (lo + hi) // 2
        gap = values[mid] - mid
        if gap == 0:
            answer = mid
            hi = mid - 1
        elif gap < 0:
            lo = mid + 1
        else:
            hi = mid - 1
    return answer
`

const codeLine = key => code.findIndex(line => line.text.includes(key)) + 1
const pythonLine = key => python.split('\n').findIndex(line => line.includes(key)) + 1

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 30) throw new Error('Use a JSON array of 1 to 30 integers.')
  if (!values.every(v => Number.isInteger(v) && v >= -50 && v <= 50)) throw new Error('Values must be integers from -50 to 50.')
  for (let i = 1; i < values.length; i++) {
    if (values[i] <= values[i - 1]) throw new Error('Values must be strictly increasing.')
  }
  return values
}

export function buildTrace(values) {
  const frames = []
  let lo = 0
  let hi = values.length - 1
  let answer = -1
  const push = (phase, key, message, mid = null, pyKey = key) => frames.push({
    phase,
    activeLine: codeLine(key),
    pythonLine: pythonLine(pyKey),
    message,
    state: { values, lo, hi, mid, answer },
  })

  push('start', 'let lo = 0', `Search indices ${lo} to ${hi}.`, null, 'lo, hi, answer')
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const gap = values[mid] - mid
    push('probe', 'const mid = Math.floor', `Index ${mid} holds ${values[mid]}, so value minus index is ${gap}.`, mid, 'mid = (lo + hi)')
    if (gap === 0) {
      answer = mid
      hi = mid - 1
      push('earlier', 'answer = mid', `Index ${mid} is fixed. Record it and look left for an earlier one.`, mid)
    } else if (gap < 0) {
      lo = mid + 1
      push('move', 'lo = mid + 1', `The gap is negative, so no index at or left of ${mid} can be fixed. Move lo right.`, mid)
    } else {
      hi = mid - 1
      push('move', 'hi = mid - 1', `The gap is positive, so no index at or right of ${mid} can be fixed. Move hi left.`, mid)
    }
  }
  push('done', 'return answer', answer === -1 ? 'No index is fixed, so the answer is -1.' : `The smallest fixed index is ${answer}.`)
  return { input: values, result: answer, frames }
}
