export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.count) || input.count < 0 || input.count > 15) {
    throw new Error('Use an object with count, an integer from 0 to 15.')
  }
  return { count: input.count }
}

export const code = `generate the first count Fibonacci numbers
set a to 0 and b to 1
repeat count times
  yield a
  move a and b forward so that b becomes a plus b`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ count }) {
  const frames = []
  let a = 0
  let b = 1
  const yielded = []
  frames.push({ phase: 'init', activeLine: L('set a to 0'), a, b, yielded: [], message: 'Start with a = 0 and b = 1.' })
  for (let i = 0; i < count; i++) {
    yielded.push(a)
    frames.push({ phase: 'yield', activeLine: L('yield a'), a, b, yielded: [...yielded], message: `Yield ${a}.` })
    ;[a, b] = [b, a + b]
    frames.push({ phase: 'advance', activeLine: L('move a and b'), a, b, yielded: [...yielded], message: `Now a = ${a} and b = ${b}.` })
  }
  frames.push({ phase: 'done', activeLine: L('repeat count times'), a, b, yielded: [...yielded], message: 'The generator is exhausted.' })
  return { input: { count }, result: yielded, frames }
}
