export const phases = [
  { id: 'start', label: 'Build array', description: 'The array holds the first n odd numbers. Every value should end up at the middle value n.' },
  { id: 'pair', label: 'Lower half', description: 'Each value in the lower half needs to rise to n. Its deficit is its cost, because each operation raises one value and lowers another.' },
  { id: 'add', label: 'Add deficit', description: 'Add this deficit to the running operation count.' },
  { id: 'done', label: 'Complete', description: 'The total deficit of the lower half equals the minimum number of operations.' },
]

export function parseInput(text) {
  const n = Number(text.trim())
  if (!/^\d+$/.test(text.trim()) || n < 1 || n > 100) throw new Error('Enter a single integer n from 1 to 100.')
  return n
}

export const code = [
  "function minOperations(n) {",
  "  const target = n",
  "  let ops = 0",
  "  for (let i = 0; i < Math.floor(n / 2); i++) {",
  "    ops += target - (2 * i + 1) }",
  "  return ops }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def min_operations(n):
    arr = [2 * i + 1 for i in range(n)]
    target = n
    ops = 0
    for i in range(n // 2):
        ops += target - arr[i]
    return ops
`
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(n) {
  const arr = Array.from({ length: n }, (_, i) => 2 * i + 1)
  const frames = []
  let ops = 0
  const snap = extra => ({ arr, target: n, ops, ...extra })
  frames.push({ phase: 'start', activeLine: L('let ops = 0'), pythonLine: P('arr = ['), snapshot: snap({ index: -1 }),
    message: `n = ${n}. The array is 1, 3, ..., ${2 * n - 1}, and every value must become ${n}, the middle value.` })
  for (let i = 0; i < Math.floor(n / 2); i++) {
    const need = n - arr[i]
    frames.push({ phase: 'pair', activeLine: L('for (let i = 0'), pythonLine: P('for i in range'), snapshot: snap({ index: i, need }),
      message: `Index ${i} holds ${arr[i]} and needs ${need} to reach ${n}. Each operation raises one value and lowers another, so this deficit is paid by lowering values above ${n}.` })
    ops += need
    frames.push({ phase: 'add', activeLine: L('ops +='), pythonLine: P('ops +='), snapshot: snap({ index: i, need }),
      message: `Add ${need}. The running total is ${ops}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return ops'), pythonLine: P('return ops'), snapshot: snap({ index: Math.floor(n / 2) }),
    message: `The lower half needs ${ops} operations in total. The upper half absorbs the same amount.` })
  return { input: n, result: ops, frames }
}
