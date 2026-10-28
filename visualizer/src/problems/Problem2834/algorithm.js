const MOD = 1000000007

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use an object with n and target.')
  const { n, target } = value
  if (!Number.isInteger(n) || n < 1 || n > 20) throw new Error('n is an integer from 1 to 20.')
  if (!Number.isInteger(target) || target < 1 || target > 40) throw new Error('target is an integer from 1 to 40.')
  return { n, target }
}

export function buildTrace({ n, target }) {
  const chosen = []
  let sum = 0
  let candidate = 1
  const frames = [{ phase: 'start', activeLine: L('set chosen to an empty'), candidate: 0, chosen: [], sum: 0, message: `Pick ${n} distinct positive values so that no two of them add up to ${target}.` }]
  while (chosen.length < n) {
    if (chosen.includes(target - candidate)) {
      frames.push({ phase: 'skip', activeLine: L('if the partner'), candidate, chosen: [...chosen], sum, message: `${candidate} pairs with ${target - candidate}, which is already chosen. Skip it.` })
    } else {
      chosen.push(candidate)
      sum += candidate
      frames.push({ phase: 'take', activeLine: L('add the candidate'), candidate, chosen: [...chosen], sum, message: `Take ${candidate}. Sum is now ${sum}.` })
    }
    candidate++
  }
  const result = sum % MOD
  frames.push({ phase: 'done', activeLine: L('return the sum'), candidate, chosen: [...chosen], sum, message: `Minimum sum modulo 1000000007: ${result}.` })
  return { input: { n, target }, result, frames }
}

export const code = `minimum possible sum of a beautiful array of n distinct positive values:
  set chosen to an empty list
  set candidate to 1
  while the length of chosen is less than n do
    if the partner, target minus candidate, is already chosen then
      skip this candidate
    otherwise add the candidate to chosen
    increase candidate by 1
  return the sum of chosen modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_possible_sum(n, target):
    chosen = []
    candidate = 1
    while len(chosen) < n:
        if (target - candidate) not in chosen:
            chosen.append(candidate)
        candidate += 1
    return sum(chosen) % 1000000007
`
