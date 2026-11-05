export const phases = [
  { id: 'start', label: 'Start', description: 'Scan left to right, remembering the values already seen.' },
  { id: 'check', label: 'Check against seen', description: 'For the current value x, look for an earlier value equal to 2x, or an earlier value equal to x / 2.' },
  { id: 'found', label: 'Pair found', description: 'An earlier value and this value form a pair where one is double the other.' },
  { id: 'remember', label: 'Remember', description: 'No pair yet; add x to the seen set and continue.' },
  { id: 'done', label: 'Complete', description: 'Return whether a pair was found.' },
]

export const examples = [
  { label: 'Double present', input: '[10,2,5,3]' },
  { label: 'Halves only', input: '[3,1,7,11]' },
  { label: 'Zero pair', input: '[0,0]' },
]

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values)) throw new Error('Use a JSON array of integers, such as [10,2,5,3].')
  if (values.length < 2 || values.length > 500) throw new Error('The array needs 2 to 500 values.')
  if (!values.every(Number.isInteger)) throw new Error('Every value must be an integer; 2.5 is not allowed.')
  if (values.some(v => v < -1000 || v > 1000)) throw new Error('Every value must be from -1000 to 1000.')
  return values
}

export function buildTrace(values) {
  const seen = []
  const snap = (index, extra = {}) => ({ index, seen: [...seen], ...extra })
  const frames = [{ phase: 'start', activeLine: L('const seen = new Set()'), pythonLine: P('seen = set()'), snapshot: snap(-1),
    message: 'Scan the values from left to right; each value is checked against those already seen.' }]
  let found = false
  for (let i = 0; i < values.length && !found; i++) {
    const x = values[i]
    frames.push({ phase: 'check', activeLine: L('for (const x of arr)'), pythonLine: P('for x in arr'), snapshot: snap(i, { x }),
      message: `Check ${x}: is ${2 * x} seen (its double), or ${x % 2 === 0 ? `${x / 2} (its half)` : 'no half exists because it is odd'}?` })
    if (seen.includes(2 * x) || (x % 2 === 0 && seen.includes(x / 2))) {
      found = true
      frames.push({ phase: 'found', activeLine: L('return true'), pythonLine: P('return True'), snapshot: snap(i, { x, found: true }),
        message: `${x} pairs with an earlier value, so one value is double the other.` })
    } else {
      seen.push(x)
      frames.push({ phase: 'remember', activeLine: L('seen.add(x)'), pythonLine: P('seen.add(x)'), snapshot: snap(i, { x }),
        message: `No pair for ${x}; remember it.` })
    }
  }
  if (!found) frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return False'), snapshot: snap(-1, { found }),
    message: 'No pair exists. Return false.', result: found })
  return { input: values, result: found, frames }
}

export const code = `function checkIfExist(arr) {
  const seen = new Set()
  for (const x of arr) {
    if (seen.has(2 * x) || (x % 2 === 0 && seen.has(x / 2))) return true
    seen.add(x)
  }
  return false
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def check_if_exist(arr):
    seen = set()
    for x in arr:
        if 2 * x in seen or (x % 2 == 0 and x // 2 in seen):
            return True
        seen.add(x)
    return False
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
