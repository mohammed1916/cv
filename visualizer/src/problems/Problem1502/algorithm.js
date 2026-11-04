export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the values in the order given.' },
  { id: 'sort', label: 'Sort', description: 'Arranging the values in order is the only way to test equal gaps between neighbours.' },
  { id: 'compare', label: 'Compare gaps', description: 'Every neighbouring gap must equal the first gap.' },
  { id: 'done', label: 'Complete', description: 'Report whether the sorted values have one common gap.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [7, 1, 5, 9]}.')
  const { arr } = input
  if (!Array.isArray(arr) || arr.length < 2 || arr.length > 12 || !arr.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('arr is a list of 2 to 12 integers from -100 to 100.')
  return { arr }
}

export function buildTrace({ arr }) {
  const sorted = [...arr].sort((a, b) => a - b)
  const step = sorted[1] - sorted[0]
  const snap = (pos, gap, ok) => ({ sorted, pos, step, gap, ok })
  const frames = [{
    phase: 'start', activeLine: L('arr.sort((a, b) => a - b)'), pythonLine: P('arr = sorted(arr)'), snapshot: snap(null, null, null),
    message: `Values as given: ${arr.join(', ')}. Only their sorted order matters for the gaps.`,
  }, {
    phase: 'sort', activeLine: L('step = arr[1] - arr[0]'), pythonLine: P('step = arr[1] - arr[0]'), snapshot: snap(1, null, null),
    message: `Sorted: ${sorted.join(', ')}. The first gap is ${step}, so every gap must be ${step}.`,
  }]
  let result = true
  for (let i = 2; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1]
    const ok = gap === step
    frames.push({
      phase: 'compare', activeLine: L('if (arr[i] - arr[i - 1] !== step)'), pythonLine: P('if arr[i] - arr[i - 1] != step'), snapshot: snap(i, gap, ok),
      message: `Gap between ${sorted[i - 1]} and ${sorted[i]} is ${gap}. ${ok ? `That matches ${step}.` : `That is not ${step}, so the values cannot form a progression.`}`,
    })
    if (!ok) { result = false; break }
  }
  frames.push({
    phase: 'done', activeLine: L(result ? 'return true' : 'return false'), pythonLine: P(result ? 'return True' : 'return False'), snapshot: snap(null, null, result),
    message: result ? `Every gap is ${step}, so the values can be arranged as an arithmetic progression.` : 'At least one gap differs, so no arrangement works.',
  })
  return { input: { arr }, result, frames }
}

export const code = [
  "function canMakeProgression(arr) {",
  "  arr.sort((a, b) => a - b)",
  "  const step = arr[1] - arr[0]",
  "  for (let i = 2; i < arr.length; i++) {",
  "    if (arr[i] - arr[i - 1] !== step) return false }",
  "  return true }",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_make_progression(arr):
    arr = sorted(arr)
    step = arr[1] - arr[0]
    for i in range(2, len(arr)):
        if arr[i] - arr[i - 1] != step:
            return False
    return True
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
