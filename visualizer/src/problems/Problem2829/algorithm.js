export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use an object with n and k.')
  const { n, k } = value
  if (!Number.isInteger(n) || n < 1 || n > 20) throw new Error('n is an integer from 1 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > 40) throw new Error('k is an integer from 1 to 40.')
  return { n, k }
}

export function buildTrace({ n, k }) {
  const chosen = []
  let sum = 0
  let candidate = 1
  const frames = [{ phase: 'start', activeLine: L('set chosen to an empty'), candidate: 0, chosen: [], sum: 0, message: `Pick ${n} distinct positive values so that no two of them add up to ${k}.` }]
  while (chosen.length < n) {
    if (chosen.includes(k - candidate)) {
      frames.push({ phase: 'skip', activeLine: L('if the partner'), candidate, chosen: [...chosen], sum, message: `${candidate} pairs with ${k - candidate}, which is already chosen. Skip it.` })
    } else {
      chosen.push(candidate)
      sum += candidate
      frames.push({ phase: 'take', activeLine: L('add the candidate'), candidate, chosen: [...chosen], sum, message: `Take ${candidate}. Sum is now ${sum}.` })
    }
    candidate++
  }
  frames.push({ phase: 'done', activeLine: L('return the sum'), candidate, chosen: [...chosen], sum, message: `Minimum sum: ${sum}.` })
  return { input: { n, k }, result: sum, frames }
}

export const code = `minimum sum of a k-avoiding array of n distinct positive values:
  set chosen to an empty list
  set candidate to 1
  while the length of chosen is less than n do
    if the partner, k minus candidate, is already chosen then
      skip this candidate
    otherwise add the candidate to chosen
    increase candidate by 1
  return the sum of chosen`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_sum_k_avoiding(n, k):
    chosen = []
    candidate = 1
    while len(chosen) < n:
        if (k - candidate) not in chosen:
            chosen.append(candidate)
        candidate += 1
    return sum(chosen)
`
