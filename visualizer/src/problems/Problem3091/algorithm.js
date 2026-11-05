export function parseInput(text) {
  const k = JSON.parse(text)
  if (!Number.isInteger(k) || k < 1 || k > 200) throw new Error('Use an integer k from 1 to 200 in this trace.')
  return k
}

export function buildTrace(k) {
  const frames = []
  let best = k
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('let best = k'), x: null, copies: null, ops: null, best, message: `Start with best = ${k}, the cost of raising 1 to k.` })
  for (let x = 1; x <= k; x++) {
    const copies = Math.floor((k + x - 1) / x)
    const ops = (x - 1) + (copies - 1)
    frames.push({ pythonLine: 5, phase: 'candidate', activeLine: L('const ops ='), x, copies, ops, best, message: `Raise 1 to ${x} (${x - 1} ops), then make ${copies} copies (${copies - 1} ops).` })
    if (ops < best) {
      best = ops
      frames.push({ pythonLine: 7, phase: 'improve', activeLine: L('if (ops < best)'), x, copies, ops, best, message: `${ops} operations is better.` })
    }
  }
  frames.push({ pythonLine: 8, phase: 'done', activeLine: L('return best'), x: null, copies: null, ops: null, best, message: `Minimum operations: ${best}.` })
  return { input: k, result: best, frames }
}

export const code = `function minOperations(k) {
  let best = k
  for (let x = 1; x <= k; x++) {
    const copies = Math.ceil(k / x)
    const ops = (x - 1) + (copies - 1)
    if (ops < best) best = ops
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(k):
    best = k
    for x in range(1, k + 1):
        copies = (k + x - 1) // x
        ops = (x - 1) + (copies - 1)
        if ops < best:
            best = ops
    return best
`
