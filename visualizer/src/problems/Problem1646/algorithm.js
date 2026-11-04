export const phases = [
  { id: 'start', label: 'Base values', description: 'Place the two base values: index 0 holds 0 and index 1 holds 1.' },
  { id: 'inspect', label: 'Inspect index', description: 'Find the half index that the current position is built from.' },
  { id: 'update', label: 'Write value', description: 'Even positions copy their half; odd positions add the two half values around them.' },
  { id: 'done', label: 'Maximum', description: 'Return the largest value written through index n.' },
]

export const code = [
  "function getMaximumGenerated(n) {",
  "  if (n === 0) return 0;",
  "  const values = [0, 1];",
  "  let best = 1;",
  "  for (let i = 2; i <= n; i++) {",
  "    const half = Math.floor(i / 2);",
  "    const value = i % 2 === 0 ? values[half] : values[half] + values[half + 1];",
  "    values.push(value);",
  "    best = Math.max(best, value);",
  "  }",
  "  return best;",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def get_maximum_generated(n):
    if n == 0:
        return 0
    values = [0, 1]
    best = 1
    for i in range(2, n + 1):
        half = i // 2
        value = values[half] if i % 2 == 0 else values[half] + values[half + 1]
        values.append(value)
        best = max(best, value)
    return best
`

const pc = needle => code.findIndex(line => line.text.includes(needle)) + 1
const py = needle => python.split('\n').findIndex(line => line.includes(needle)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 9}.')
  const { n } = input
  if (!Number.isInteger(n) || n < 0 || n > 100) throw new Error('n is an integer from 0 to 100.')
  return { n }
}

export function buildTrace({ n }) {
  const values = n === 0 ? [0] : [0, 1]
  let best = n === 0 ? 0 : 1
  const frames = []
  const snap = (index, half, value) => ({ values: [...values], index, half, value, best })
  const push = (phase, pcNeedle, pyNeedle, message, snapshot) =>
    frames.push({ phase, activeLine: pc(pcNeedle), pythonLine: py(pyNeedle), message, snapshot })

  if (n === 0) {
    push('start', 'if (n === 0)', 'if n == 0', 'n is 0, so the only value is index 0, which holds 0.', snap(0, null, null))
    push('done', 'return best', 'return best', 'Return 0.', snap(null, null, null))
    return { input: { n }, result: 0, frames }
  }

  push('start', 'values = [0, 1]', 'values = [0, 1]', 'Base values: index 0 holds 0 and index 1 holds 1.', snap(1, null, null))
  for (let i = 2; i <= n; i++) {
    const half = Math.floor(i / 2)
    const even = i % 2 === 0
    const value = even ? values[half] : values[half] + values[half + 1]
    push('inspect', 'const half = Math.floor(i', 'half = i',
      even ? `Index ${i} is even, so it copies index ${half}.`
        : `Index ${i} is odd, so it adds indices ${half} and ${half + 1}.`, snap(i, half, null))
    values.push(value)
    if (value > best) best = value
    push('update', 'values.push(value)', 'values.append',
      `Index ${i} receives ${value}; the largest value so far is ${best}.`, snap(i, half, value))
  }
  push('done', 'return best', 'return best', `The largest value through index ${n} is ${best}.`, snap(null, null, null))
  return { input: { n }, result: best, frames }
}
