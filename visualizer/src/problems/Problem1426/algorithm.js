export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty count and build a set of the values present in the array.' },
  { id: 'check', label: 'Check successor', description: 'For the current value, ask whether one more than it appears somewhere in the array.' },
  { id: 'count', label: 'Count element', description: 'The successor exists, so this occurrence adds one to the answer.' },
  { id: 'skip', label: 'Skip element', description: 'No successor is present, so this occurrence contributes nothing.' },
  { id: 'done', label: 'Complete', description: 'The count is the number of occurrences that have a successor.' },
]

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 30 || !values.every(v => Number.isInteger(v) && v >= 0 && v <= 99)) throw new Error('Use a JSON list of 1 to 30 integers from 0 to 99.')
  return values
}

export function buildTrace(values) {
  const present = new Set(values)
  let count = 0
  const snap = (current, extra = {}) => ({ current, present: [...present], count, ...extra })
  const frames = [{ phase: 'start', activeLine: L('present = set'), pythonLine: P('present = set'), snapshot: snap(null), message: `Collect the ${present.size} distinct values. A successor check is then a constant-time lookup.` }]
  values.forEach((x, i) => {
    const hit = present.has(x + 1)
    frames.push({ phase: 'check', activeLine: L('if x + 1 in present'), pythonLine: P('if x + 1 in present'), snapshot: snap(i, { value: x, successor: x + 1, hit }), message: `Occurrence ${i} holds ${x}; is ${x + 1} in the array? ${hit ? 'Yes.' : 'No.'}` })
    if (hit) {
      count += 1
      frames.push({ phase: 'count', activeLine: L('count = count + 1'), pythonLine: P('count += 1'), snapshot: snap(i, { value: x, successor: x + 1, hit, counted: true }), message: `Count occurrence ${i}. The running count is ${count}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if x + 1 in present'), pythonLine: P('if x + 1 in present'), snapshot: snap(i, { value: x, successor: x + 1, hit }), message: `Occurrence ${i} is skipped; the count stays ${count}.` })
    }
  })
  const result = count
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), snapshot: snap(null, { result }), message: `${result} occurrences have a successor in the array.` })
  return { input: values, result, frames }
}

export const code = `count elements (values):
  present = set of all values
  count = 0
  for each x in values:
    if x + 1 in present:
      count = count + 1
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_elements(arr):
    present = set(arr)
    count = 0
    for x in arr:
        if x + 1 in present:
            count += 1
    return count
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
