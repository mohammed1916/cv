export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty stack of leaf values that never increases from bottom to top.' },
  { id: 'scan', label: 'Read leaf', description: 'Compare the next leaf with the stack top.' },
  { id: 'combine', label: 'Join smaller leaf', description: 'A smaller middle leaf joins the cheaper of its two neighbours, giving one nonleaf of cost middle times neighbour.' },
  { id: 'finish', label: 'Join remaining pairs', description: 'After the scan, the stack has no smaller middle leaf left, so adjacent pairs are joined.' },
  { id: 'done', label: 'Answer', description: 'Return the minimum total cost of the nonleaf nodes.' },
]

export function parseInput(text) {
  const leaves = JSON.parse(text)
  if (!Array.isArray(leaves) || leaves.length < 2 || leaves.length > 30) throw new Error('Enter a JSON array of 2 to 30 leaf values.')
  if (!leaves.every(v => Number.isInteger(v) && v >= 1 && v <= 40)) throw new Error('Each leaf value must be an integer from 1 to 40.')
  return leaves
}

export const code = `function mctFromLeafValues(arr) {
  const stack = []
  let total = 0
  for (const x of arr) {
    while (stack.length && stack[stack.length - 1] <= x) {
      const mid = stack.pop()
      total += mid * (stack.length ? Math.min(stack[stack.length - 1], x) : x)
    }
    stack.push(x)
  }
  for (let i = 0; i < stack.length - 1; i++) total += stack[i] * stack[i + 1]
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const PYMAP = { 2: 2, 4: 4, 7: 7, 9: 8, 11: 10, 12: 11 }

export const python = `def mct_from_leaf_values(arr):
    stack = []
    total = 0
    for x in arr:
        while stack and stack[-1] <= x:
            mid = stack.pop()
            total += mid * (min(stack[-1], x) if stack else x)
        stack.append(x)
    for i in range(len(stack) - 1):
        total += stack[i] * stack[i + 1]
    return total`

export function buildTrace(input) {
  const arr = input
  const frames = []
  const frame = (phase, line, message, snapshot) => frames.push({ phase, activeLine: line, pythonLine: PYMAP[line], message, snapshot })
  const stack = []
  let total = 0

  frame('start', 2, 'Start with an empty stack and total cost 0. The stack stays decreasing, so each leaf is compared with the top.', { leaves: arr, index: -1, stack: [], total, dropped: [] })
  arr.forEach((x, index) => {
    frame('scan', 4, `Read leaf ${x}. Compare it with the stack top${stack.length ? ` (${stack[stack.length - 1]})` : ' (none)'}.`, { leaves: arr, index, stack: [...stack], total, dropped: [] })
    while (stack.length && stack[stack.length - 1] <= x) {
      const mid = stack.pop()
      const neighbour = stack.length ? Math.min(stack[stack.length - 1], x) : x
      total += mid * neighbour
      frame('combine', 7, `${mid} is no larger than ${x}, so it is the middle of a nonleaf of cost ${mid} × ${neighbour} = ${mid * neighbour}. Total is ${total}.`, { leaves: arr, index, stack: [...stack], total, dropped: [mid], mid, neighbour })
    }
    stack.push(x)
    frame('scan', 9, `Push ${x}. The stack is now ${stack.join(', ')}.`, { leaves: arr, index, stack: [...stack], total, dropped: [] })
  })

  for (let i = 0; i < stack.length - 1; i++) {
    total += stack[i] * stack[i + 1]
    frame('finish', 11, `The stack pair ${stack[i]} and ${stack[i + 1]} is joined, adding ${stack[i] * stack[i + 1]}. Total is ${total}.`, { leaves: arr, index: arr.length, stack: [...stack], total, dropped: [] })
  }
  frame('done', 12, `The minimum total nonleaf cost is ${total}.`, { leaves: arr, index: arr.length, stack: [...stack], total, dropped: [] })
  return { input, result: total, frames }
}
