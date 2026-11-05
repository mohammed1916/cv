export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('Enter an integer n from 1 to 1,000.')
  return n
}

// Copy-all then paste multiplies the length. Pasting d times after one copy adds d·(multiplier), so a
// factor d costs d operations. Divide out the smallest factor repeatedly; the total is the answer.
export function buildTrace(n) {
  let rest = n
  let steps = 0
  const frames = [{ phase: 'start', rest, steps, factor: null, activeLine: L('let rest = n'), pythonLine: P('rest = n'), message: `Start with ${n} characters and no operations.` }]
  for (let d = 2; d <= rest; d++) {
    while (rest % d === 0) {
      steps += d
      rest /= d
      frames.push({ phase: 'factor', rest, steps, factor: d, activeLine: L('steps += d'), pythonLine: P('steps += d'), message: `${d} divides the length: one copy and ${d - 1} pastes cost ${d} operations and leave ${rest} groups to finish.` })
    }
  }
  const result = steps
  frames.push({ phase: 'done', rest: 1, steps, factor: null, result, activeLine: L('return steps'), pythonLine: P('return steps'), message: `Minimum operations: ${result}.` })
  return { input: n, result, frames }
}

const SOURCE = `function minSteps(n) {
  let rest = n
  let steps = 0
  for (let d = 2; d <= rest; d++) {
    while (rest % d === 0) {
      steps += d
      rest /= d
    }
  }
  return steps
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_steps(n):
    rest = n
    steps = 0
    d = 2
    while d <= rest:
        while rest % d == 0:
            steps += d
            rest //= d
        d += 1
    return steps`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
