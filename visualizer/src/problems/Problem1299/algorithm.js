export const phases = [
  { id: 'start', label: 'Start', description: 'Begin from the right end, where the greatest value to the right is undefined.' },
  { id: 'scan', label: 'Read value', description: 'Read the value at the current position, moving right to left.' },
  { id: 'set', label: 'Replace', description: 'Write the greatest value seen to the right into this position.' },
  { id: 'update', label: 'Update maximum', description: 'Fold the original value into the running maximum for the positions still to the left.' },
  { id: 'done', label: 'Complete', description: 'Every position has been replaced.' },
]

export const examples = [
  { label: 'Mixed heights', input: '[17,4,9,2,6]' },
  { label: 'Ascending', input: '[1,3,5,7]' },
  { label: 'Single value', input: '[8]' },
]

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 30) throw new Error('Use a JSON array of 1 to 30 integers, such as [17, 4, 9].')
  if (!arr.every(v => Number.isInteger(v) && v >= 1 && v <= 100000)) throw new Error('Every value must be integers from 1 to 100000.')
  return arr
}

export function buildTrace(arr) {
  const out = [...arr]
  let best = null
  const snap = (index, current, filled) => ({ index, current, best: best ?? -1, filled: [...filled] })
  const filled = Array(arr.length).fill(false)
  const frames = [{ phase: 'start', activeLine: L('let best = null'), pythonLine: P('best = None'), snapshot: snap(null, null, filled),
    message: `Walk from the right end of ${arr.length} values. Nothing lies to the right of the last value, so it becomes -1.` }]
  for (let i = arr.length - 1; i >= 0; i--) {
    const current = arr[i]
    frames.push({ phase: 'scan', activeLine: L('for (let i = arr.length - 1'), pythonLine: P('for i in range'), snapshot: snap(i, current, filled),
      message: `Position ${i} holds ${current}. The greatest value to its right so far is ${best ?? -1}.` })
    out[i] = best ?? -1
    filled[i] = true
    frames.push({ phase: 'set', activeLine: L('out[i] = best'), pythonLine: P('out[i] = -1'), snapshot: snap(i, current, filled),
      message: `Write ${best ?? -1} into position ${i}.` })
    best = best === null ? current : Math.max(best, current)
    frames.push({ phase: 'update', activeLine: L('best = best === null'), pythonLine: P('best = current if'), snapshot: snap(i, current, filled),
      message: `${current} becomes the running maximum for the positions to the left, so best is now ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return out'), pythonLine: P('return out'), snapshot: snap(null, null, filled),
    message: `Return ${JSON.stringify(out)}.`, result: out })
  return { input: arr, result: out, frames }
}

export const code = `function replaceElements(arr) {
  const out = [...arr]
  let best = null
  for (let i = arr.length - 1; i >= 0; i--) {
    const current = arr[i]
    out[i] = best ?? -1
    best = best === null ? current : Math.max(best, current)
  }
  return out
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def replace_elements(arr):
    out = list(arr)
    best = None
    for i in range(len(arr) - 1, -1, -1):
        current = arr[i]
        out[i] = -1 if best is None else best
        best = current if best is None else max(best, current)
    return out
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
