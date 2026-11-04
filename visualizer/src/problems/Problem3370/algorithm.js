export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.n)) throw new Error('Use an object such as {"n":5}.')
  const { n } = data
  if (n < 1 || n > 1000) throw new Error('n is an integer from 1 to 1000.')
  return { n }
}

const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function buildTrace({ n }) {
  let candidate = 1
  const frames = [{ pythonLine: PY('candidate = 1'), phase: 'start', activeLine: L('let candidate = 1'), candidate, message: `Find the smallest all-ones number that is at least ${n}.` }]
  while (candidate < n) {
    candidate = candidate * 2 + 1
    frames.push({ pythonLine: PY('candidate = candidate * 2'), phase: 'grow', activeLine: L('candidate = candidate * 2 + 1'), candidate, message: `${candidate - 1 === 0 ? '' : ''}Candidate is now ${candidate} (binary ${candidate.toString(2)}).${candidate < n ? ' Still below n, so grow it again.' : ' It reaches n.'}` })
  }
  frames.push({ pythonLine: PY('return candidate'), phase: 'done', activeLine: L('return candidate;'), candidate, message: `Smallest number with all set bits that is at least ${n}: ${candidate}.` })
  return { input: { n }, result: candidate, frames }
}

// Code panel: real JavaScript. Python below mirrors it line for line.
export const code = [
  "function smallestAllOnes(n) {",
  "  let candidate = 1;",
  "  while (candidate < n) {",
  "    candidate = candidate * 2 + 1;",
  "  }",
  "  return candidate;",
  "}",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_all_ones(n):
    candidate = 1
    while candidate < n:
        candidate = candidate * 2 + 1
    return candidate
`
