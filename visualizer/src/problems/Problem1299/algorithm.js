export const phases = [
  { id: 'start', label: 'Empty suffix', description: 'Nothing lies to the right of the last position, so there is no maximum yet and its replacement is -1.' },
  { id: 'scan', label: 'Read element', description: 'Move leftward and read the current element before it is overwritten.' },
  { id: 'write', label: 'Write maximum', description: 'Store the greatest value seen strictly to the right in this position, or -1 when there is none.' },
  { id: 'update', label: 'Update maximum', description: 'Include the element just read in the running maximum for positions further left.' },
  { id: 'done', label: 'Complete', description: 'Every position now holds the greatest value strictly to its right.' },
]

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 30 || !arr.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('Enter a JSON array of 1 to 30 integers from -100 to 100.')
  return arr
}

export function buildTrace(input) {
  const arr = [...input]
  const frames = []
  const frame = (phase, line, message, snapshot, pyLine = line) => frames.push({ phase, activeLine: L(line), pythonLine: P(pyLine), snapshot, message })
  let best = null // greatest value to the right; null while the suffix is empty
  frame('start', 'best = none', 'Begin from the right end. Nothing is to the right of the last element, so there is no maximum yet.', { arr: [...arr], index: null, best, current: null }, 'best = None')
  for (let i = arr.length - 1; i >= 0; i--) {
    const current = arr[i]
    frame('scan', 'current = arr[i]', `Position ${i} holds ${current}. Its replacement is the greatest value to its right so far.`, { arr: [...arr], index: i, best, current })
    arr[i] = best === null ? -1 : best
    frame('write', 'arr[i] =', `Write ${arr[i]} into position ${i}.`, { arr: [...arr], index: i, best, current })
    best = best === null ? current : Math.max(best, current)
    frame('update', 'best = current if', `The running maximum for positions further left is now ${best}.`, { arr: [...arr], index: i, best, current })
  }
  frame('done', 'return arr', `Result: [${arr.join(', ')}].`, { arr: [...arr], index: null, best, current: null }, 'return arr')
  return { input: [...input], result: arr, frames }
}

export const code = `replace greatest right (arr):
  best = none
  for i from last index down to 0:
    current = arr[i]
    arr[i] = -1 if best is none else best
    best = current if best is none else max(best, current)
  return arr`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def replace_greatest_right(arr):
    best = None
    for i in range(len(arr) - 1, -1, -1):
        current = arr[i]
        arr[i] = -1 if best is None else best
        best = current if best is None else max(best, current)
    return arr`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
