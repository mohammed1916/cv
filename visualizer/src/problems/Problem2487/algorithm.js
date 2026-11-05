export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.values)) throw new Error('Use an object with values.')
  const { values } = input
  if (values.length < 1 || values.length > 12) throw new Error('values has 1 to 12 nodes.')
  if (!values.every(x => Number.isInteger(x) && x >= 1 && x <= 20)) throw new Error('Each value is an integer from 1 to 20.')
  return { values }
}

export function buildTrace({ values }) {
  const stack = []
  const frames = []
  values.forEach((v, i) => {
    const removed = []
    while (stack.length && stack[stack.length - 1] < v) removed.push(stack.pop())
    stack.push(v)
    frames.push({ phase: 'scan', activeLine: CL('while (stack.length'), pythonLine: PL('while stack'), i, value: v, removed, kept: [...stack], message: removed.length ? `${v} is larger than ${removed.join(', ')} to their left, so ${removed.length === 1 ? 'that node is' : 'those nodes are'} removed.` : `${v} has no larger value on its left to remove; it is kept for now.` })
  })
  frames.push({ phase: 'done', activeLine: CL('return stack'), pythonLine: PL('return stack'), i: -1, value: null, removed: [], kept: [...stack], message: `Remaining list: ${stack.join(' -> ')}.` })
  return { input: { values }, result: stack, frames }
}

export const code = `function removeNodes(values) {
  const stack = [];
  for (const v of values) {
    while (stack.length && stack[stack.length - 1] < v) {
      stack.pop();
    }
    stack.push(v);
  }
  return stack;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def remove_nodes(values):
    stack = []
    for v in values:
        while stack and stack[-1] < v:
            stack.pop()
        stack.append(v)
    return stack
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
