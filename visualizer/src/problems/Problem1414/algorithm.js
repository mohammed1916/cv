export const phases = [
  { id: 'start', label: 'Start', description: 'Build the Fibonacci values that do not exceed the target. Remaining starts as the whole target.' },
  { id: 'inspect', label: 'Largest fit', description: 'Pick the largest Fibonacci value that does not exceed what remains.' },
  { id: 'update', label: 'Subtract', description: 'Take that value away from the remainder and count it.' },
  { id: 'done', label: 'Complete', description: 'Every pick is needed, and the count of picks is the fewest possible.' },
]

export function parseInput(text) {
  const k = Number(text.trim())
  if (!Number.isInteger(k) || k < 1 || k > 1000000000) throw new Error('Enter an integer target from 1 to 1,000,000,000.')
  return k
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(k) {
  const fibs = [1, 2]
  while (fibs.at(-1) <= k) fibs.push(fibs.at(-1) + fibs.at(-2))
  const small = fibs.filter(f => f <= k)
  let remaining = k
  const picks = []
  const frames = [{
    phase: 'start', activeLine: L('const fibs'), pythonLine: P('fibs = [1, 2]'),
    snapshot: { remaining, picks: [], fibs: small, chosen: null },
    message: `Target ${k}. The Fibonacci values not above it are ${small.join(', ')}.`,
  }]
  while (remaining > 0) {
    const chosen = small.filter(f => f <= remaining).at(-1)
    frames.push({
      phase: 'inspect', activeLine: L('const chosen ='), pythonLine: P('f = max('),
      snapshot: { remaining, picks: [...picks], fibs: small, chosen },
      message: `Remaining ${remaining}: the largest Fibonacci value not above it is ${chosen}.`,
    })
    remaining -= chosen
    picks.push(chosen)
    frames.push({
      phase: 'update', activeLine: L('remaining -='), pythonLine: P('remaining -='),
      snapshot: { remaining, picks: [...picks], fibs: small, chosen },
      message: remaining ? `Take ${chosen}. ${remaining} is still to be made.` : `Take ${chosen}. The target is reached exactly.`,
    })
  }
  const result = picks.length
  frames.push({
    phase: 'done', activeLine: L('return picks.length'), pythonLine: P('return len(picks)'),
    snapshot: { remaining: 0, picks: [...picks], fibs: small, chosen: null },
    message: `${picks.join(' + ')} = ${k}, using ${result} Fibonacci number${result === 1 ? '' : 's'}.`,
  })
  return { input: k, result, frames }
}

export const code = `function findMinFibonacciNumbers(k) {
  const fibs = [1, 2]
  while (fibs.at(-1) <= k) fibs.push(fibs.at(-1) + fibs.at(-2))
  let remaining = k
  const picks = []
  while (remaining > 0) {
    const chosen = fibs.filter(f => f <= remaining).at(-1)
    picks.push(chosen)
    remaining -= chosen
  }
  return picks.length
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_fib_count(k):
    fibs = [1, 2]
    while fibs[-1] <= k:
        fibs.append(fibs[-1] + fibs[-2])
    remaining = k
    picks = []
    while remaining > 0:
        f = max(x for x in fibs if x <= remaining)
        picks.append(f)
        remaining -= f
    return len(picks)
`
