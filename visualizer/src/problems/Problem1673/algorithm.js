export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty stack. It keeps the candidate subsequence, smallest values toward the bottom.' },
  { id: 'scan', label: 'Read value', description: 'Read the next value from left to right.' },
  { id: 'pop', label: 'Pop larger', description: 'Remove stacked values that are larger than the new value, as long as enough values remain to still reach length k.' },
  { id: 'push', label: 'Push or skip', description: 'Push the new value if the stack has room for k values. Otherwise it is skipped.' },
  { id: 'done', label: 'Complete', description: 'The stack holds exactly k values, the lexicographically smallest choice.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"values": [3, 1, 2], "k": 2}.')
  const { values, k } = input
  if (!Array.isArray(values) || values.length < 1 || values.length > 40 || !values.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) throw new Error('values is a list of 1 to 40 integers from 0 to 1000.')
  if (!Number.isInteger(k) || k < 1 || k > values.length) throw new Error('k is an integer from 1 up to the number of values.')
  return { values, k }
}

// Pseudocode line numbers used by activeLine, and Python line numbers used by pythonLine.
const C = { start: 2, loop: 4, read: 5, pop: 6, popAct: 6, skip: 7, push: 7, done: 9 }
const PY = { start: 2, loop: 4, read: 4, pop: 5, popAct: 6, skip: 7, push: 8, done: 9 }

export function buildTrace({ values, k }) {
  const frames = []
  const stack = []
  const n = values.length
  const push = (phase, line, message, snapshot) => frames.push({ phase, activeLine: C[line], pythonLine: PY[line], snapshot, message })
  const snap = (index, extra = {}) => ({ index, value: index === null ? null : values[index], stack: [...stack], k, ...extra })

  push('start', 'start', `Choose ${k} of the ${n} values, keeping them in order and making the sequence as small as possible.`, snap(null))
  for (let i = 0; i < n; i++) {
    const x = values[i]
    push('scan', 'read', `Read ${x} at index ${i}.`, snap(i))
    while (stack.length && stack[stack.length - 1] > x && stack.length - 1 + (n - i) >= k) {
      const popped = stack.pop()
      push('pop', 'popAct', `${popped} is larger than ${x} and can be dropped. ${stack.length + (n - i)} values remain in play, enough for ${k}.`, snap(i, { popped }))
    }
    if (stack.length < k) {
      stack.push(x)
      push('push', 'push', `Push ${x}. The stack now has ${stack.length} of the ${k} values needed.`, snap(i, { pushed: true }))
    } else {
      push('push', 'skip', `The stack already holds ${k} values, so ${x} is skipped.`, snap(i, { pushed: false }))
    }
  }
  push('done', 'done', `Return [${stack.join(', ')}].`, snap(null))
  return { input: { values, k }, result: [...stack], frames }
}

export const code = [
  "function mostCompetitive(values, k) {",
  "  const stack = [];",
  "  const n = values.length;",
  "  for (let i = 0; i < n; i++) {",
  "    const x = values[i];",
  "    while (stack.length && stack[stack.length - 1] > x && stack.length - 1 + (n - i) >= k) stack.pop();",
  "    if (stack.length < k) stack.push(x);",
  "  }",
  "  return stack;",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def most_competitive(nums, k):
    stack = []
    n = len(nums)
    for i, x in enumerate(nums):
        while stack and stack[-1] > x and len(stack) - 1 + (n - i) >= k:
            stack.pop()
        if len(stack) < k:
            stack.append(x)
    return stack
`
