export const phases = [
  { id: 'setup', label: 'Setup', description: 'Read the array length and start the running total at zero.' },
  { id: 'scan', label: 'Each element', description: 'Visit every position and count the odd-length subarrays that contain it.' },
  { id: 'count', label: 'Count coverage', description: 'Choose how many starts and ends on each side give an odd length.' },
  { id: 'add', label: 'Add weight', description: 'Add the value times its coverage count to the total.' },
  { id: 'done', label: 'Result', description: 'Return the total.' },
]

export const code = [
  "function sumOddLengthSubarrays(arr) {",
  "  const n = arr.length;",
  "  let total = 0;",
  "  for (let i = 0; i < n; i++) {",
  "    const left = i + 1, right = n - i;",
  "    const odd = Math.floor((left * right + 1) / 2);",
  "    total += arr[i] * odd;",
  "  }",
  "  return total;",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def sumOddLengthSubarrays(arr):
    n = len(arr)
    total = 0
    for i, value in enumerate(arr):
        left, right = i + 1, n - i
        odd = (left * right + 1) // 2
        total += value * odd
    return total`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 7, 9: 8, 10: 8 }

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch (error) { throw new Error(`Input must be valid JSON: ${error.message}`) }
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [2, 1, 3]}.')
  const { arr } = input
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 30 || !arr.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) {
    throw new Error('arr is a list of 1 to 30 integers from -100 to 100.')
  }
  return { arr }
}

export function buildTrace({ arr }) {
  const n = arr.length
  let total = 0
  const frames = []
  const snap = extra => ({ i: -1, left: 0, right: 0, odd: 0, total, ...extra })
  frames.push({ phase: 'setup', activeLine: 2, message: `Array length ${n}. Total starts at 0.`, snapshot: snap() })
  frames.push({ phase: 'setup', activeLine: 4, message: 'Each position is weighted by how many odd-length subarrays cover it.', snapshot: snap() })
  for (let i = 0; i < n; i++) {
    const left = i + 1
    const right = n - i
    const odd = Math.floor((left * right + 1) / 2)
    frames.push({ phase: 'scan', activeLine: 5, message: `Position ${i} (value ${arr[i]}): ${left} choices for the start and ${right} for the end.`, snapshot: snap({ i, left, right }) })
    frames.push({ phase: 'count', activeLine: 6, message: `Of the ${left * right} start-end pairs covering ${i}, ${odd} give an odd length.`, snapshot: snap({ i, left, right, odd }) })
    total += arr[i] * odd
    frames.push({ phase: 'add', activeLine: 7, message: `Add ${arr[i]} x ${odd} = ${arr[i] * odd}; total is now ${total}.`, snapshot: snap({ i, left, right, odd }) })
  }
  frames.push({ phase: 'done', activeLine: 9, message: `Return ${total}.`, snapshot: snap({ total }) })
  return { input: { arr }, result: total, frames }
}
