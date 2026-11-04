export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Number.isInteger(data.n)) throw new Error('Use {"n": n} with an integer n.')
  if (data.n < 1 || data.n > 1000000000) throw new Error('n is an integer from 1 to 1000000000.')
  return { n: data.n }
}

export function buildTrace(input) {
  let m = input.n
  const counts = new Map()
  const frames = [{ pythonLine: 2, phase: 'start', activeLine: L('let score be 0'), digit: null, counts: [], score: 0, message: `Count the digits of ${input.n}.` }]
  while (m > 0) {
    const d = m % 10
    counts.set(d, (counts.get(d) ?? 0) + 1)
    frames.push({ pythonLine: 6, phase: 'count', activeLine: L('add 1 to counts for d'), digit: d, counts: [...counts], score: 0, message: `Digit ${d} is seen ${counts.get(d)} time(s).` })
    m = Math.floor(m / 10)
  }
  let score = 0
  for (const [d, f] of counts) score += d * f
  frames.push({ pythonLine: 8, phase: 'done', activeLine: L('return score'), digit: null, counts: [...counts], score, message: `Score: ${score}.` })
  return { input, result: score, frames }
}

export const code = `function digitFrequencyScore(n) {
  // let score be 0
  let score = 0
  // let counts be an empty table of digit counts
  const counts = new Map()
  let m = n
  // while n is greater than 0
  while (m > 0) {
    // let d be n mod 10
    const d = m % 10
    // add 1 to counts for d
    counts.set(d, (counts.get(d) || 0) + 1)
    // remove the last digit of n
    m = Math.floor(m / 10)
  }
  // for each digit d in counts
  for (const [d, f] of counts) {
    // add d times counts of d to score
    score += d * f
  }
  // return score
  return score
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def digit_frequency_score(n):
    counts = {}
    m = n
    while m > 0:
        d = m % 10
        counts[d] = counts.get(d, 0) + 1
        m //= 10
    return sum(d * f for d, f in counts.items())
`
