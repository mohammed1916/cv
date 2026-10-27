export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.n)) throw new Error('Use an object such as {"n":5}.')
  const { n } = data
  if (n < 1 || n > 1000) throw new Error('n is an integer from 1 to 1000.')
  return { n }
}

export function buildTrace({ n }) {
  let candidate = 1
  const frames = [{ phase: 'start', activeLine: L('set candidate to 1'), candidate, message: `Find the smallest all-ones number that is at least ${n}.` }]
  while (candidate < n) {
    candidate = candidate * 2 + 1
    frames.push({ phase: 'grow', activeLine: L('set candidate to candidate times 2 plus 1'), candidate, message: `${candidate - 1 === 0 ? '' : ''}Candidate is now ${candidate} (binary ${candidate.toString(2)}).${candidate < n ? ' Still below n, so grow it again.' : ' It reaches n.'}` })
  }
  frames.push({ phase: 'done', activeLine: L('return candidate'), candidate, message: `Smallest number with all set bits that is at least ${n}: ${candidate}.` })
  return { input: { n }, result: candidate, frames }
}

export const code = `smallest number with all set bits at least n:
  set candidate to 1
  while candidate is less than n do
    set candidate to candidate times 2 plus 1
  return candidate`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_all_ones(n):
    candidate = 1
    while candidate < n:
        candidate = candidate * 2 + 1
    return candidate
`
