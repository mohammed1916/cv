const INF = 1e15

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n) || !Array.isArray(input.restrictions) || !Array.isArray(input.diff)) throw new Error('Use a JSON object with n, restrictions and diff.')
  const { n, restrictions, diff } = input
  if (n < 2 || n > 30) throw new Error('n must be an integer from 2 to 30 (visualization cap).')
  if (diff.length !== n - 1 || diff.some(d => !Number.isInteger(d) || d < 1 || d > 10)) throw new Error('diff needs n - 1 integers from 1 to 10.')
  if (restrictions.length < 1 || restrictions.length > n - 1) throw new Error('restrictions needs between 1 and n - 1 pairs.')
  const seen = new Set()
  for (const r of restrictions) {
    if (!Array.isArray(r) || r.length !== 2 || !Number.isInteger(r[0]) || !Number.isInteger(r[1])) throw new Error('Each restriction is a pair [idx, maxVal].')
    if (r[0] < 1 || r[0] >= n || r[1] < 1 || r[1] > 1000) throw new Error('idx must be from 1 to n - 1 and maxVal from 1 to 1000.')
    if (seen.has(r[0])) throw new Error('Each idx may appear only once.')
    seen.add(r[0])
  }
  return input
}

export function buildTrace(input) {
  const { n, restrictions, diff } = input
  const limit = Array(n).fill(INF)
  limit[0] = 0
  for (const [idx, maxVal] of restrictions) limit[idx] = maxVal
  const frames = [{ phase: 'start', activeLine: L('limit = infinity'), index: -1, limit: [...limit], message: 'Start with the caps: a[0] is 0, and restricted positions have their maxVal.' }]
  for (let i = 1; i < n; i++) {
    limit[i] = Math.min(limit[i], limit[i - 1] + diff[i - 1])
    frames.push({ phase: 'forward', activeLine: L('limit[i - 1] + diff[i - 1]'), index: i, limit: [...limit], message: `Cap ${i} from the left: at most ${limit[i]}.` })
  }
  for (let i = n - 2; i >= 0; i--) {
    limit[i] = Math.min(limit[i], limit[i + 1] + diff[i])
    frames.push({ phase: 'backward', activeLine: L('limit[i + 1] + diff[i]'), index: i, limit: [...limit], message: `Cap ${i} from the right: at most ${limit[i]}.` })
  }
  const result = Math.max(...limit)
  frames.push({ phase: 'done', activeLine: L('return the largest value in limit'), index: -1, limit: [...limit], message: `The largest achievable value is ${result}.` })
  return { input, result, frames }
}

export const code = `find maximum value in constrained sequence (n, restrictions, diff):
  limit = infinity for every index
  limit[0] = 0
  for each restriction [idx, maxVal] set limit[idx] to maxVal
  for i from 1 to n - 1
    limit[i] = the smaller of limit[i] and limit[i - 1] + diff[i - 1]
  for i from n - 2 down to 0
    limit[i] = the smaller of limit[i] and limit[i + 1] + diff[i]
  return the largest value in limit`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_maximum_value_in_a_constrained_sequence(n, restrictions, diff):
    INF = 10 ** 18
    limit = [INF] * n
    limit[0] = 0
    for idx, max_val in restrictions:
        limit[idx] = max_val
    for i in range(1, n):
        limit[i] = min(limit[i], limit[i - 1] + diff[i - 1])
    for i in range(n - 2, -1, -1):
        limit[i] = min(limit[i], limit[i + 1] + diff[i])
    return max(limit)
`
