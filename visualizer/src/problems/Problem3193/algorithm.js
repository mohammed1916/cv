export const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter an object with n and requirements.')
  const { n, requirements } = input
  if (!Number.isInteger(n) || n < 2 || n > 7) throw new Error('n is an integer from 2 to 7.')
  if (!Array.isArray(requirements) || requirements.length < 1 || requirements.length > 5) throw new Error('Enter 1 to 5 requirements as [end, count] pairs.')
  for (const r of requirements) {
    if (!Array.isArray(r) || r.length !== 2 || !Number.isInteger(r[0]) || !Number.isInteger(r[1])) throw new Error('Each requirement is [end, count] with integers.')
    if (r[0] < 0 || r[0] > n - 1) throw new Error('end must be between 0 and n - 1.')
    if (r[1] < 0 || r[1] > (r[0] * (r[0] + 1)) / 2) throw new Error('count must be between 0 and the most inversions a prefix can have.')
  }
  return { n, requirements }
}

export function buildTrace({ n, requirements }) {
  const need = new Map()
  let conflict = false
  for (const [end, cnt] of requirements) {
    if (need.has(end) && need.get(end) !== cnt) conflict = true
    need.set(end, cnt)
  }
  let ways = [1]
  const frames = [{ phase: 'start', index: null, row: ways.slice(), need: null, activeLine: L('set ways to [1]'), message: 'An empty prefix has one arrangement with zero inversions.' }]
  if (conflict) {
    frames.push({ phase: 'done', index: null, row: [], need: null, activeLine: L('return the sum'), message: 'Two requirements for the same prefix disagree, so no permutation qualifies.' })
    return { input: { n, requirements }, result: 0, frames }
  }
  for (let i = 0; i < n; i++) {
    const size = (i * (i + 1)) / 2 + 1
    const next = Array(size).fill(0)
    // Position i can add 0..i inversions (the number of earlier values larger than it).
    ways.forEach((w, j) => { for (let k = 0; k <= i; k++) next[j + k] = (next[j + k] + w) % MOD })
    const req = need.has(i) ? need.get(i) : null
    if (req !== null) for (let j = 0; j < size; j++) if (j !== req) next[j] = 0
    ways = next
    frames.push({ phase: 'position', index: i, row: ways.slice(), need: req, activeLine: L('zero every entry'), message: req === null ? `Position ${i} adds 0 to ${i} inversions.` : `Prefix ${i} must have exactly ${req} inversions: every other count is zeroed.` })
  }
  const result = ways.reduce((s, w) => (s + w) % MOD, 0)
  frames.push({ phase: 'done', index: null, row: ways.slice(), need: null, activeLine: L('return the sum'), message: `Total arrangements: ${result}.` })
  return { input: { n, requirements }, result, frames }
}

export const code = `count permutations of 0 to n-1 that meet every inversion requirement
  set ways to [1], the single arrangement of an empty prefix
  for each position i from 0 to n-1
    set next to zeros for the largest possible inversion count so far
    for each inversion count j with a nonzero entry in ways
      add ways[j] to next[j] through next[j + i]
    if position i has a required count then
      zero every entry of next except the required count
    set ways to next
  return the sum of ways`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_permutations(n, requirements):
    MOD = 1000000007
    need = {}
    for end, cnt in requirements:
        if end in need and need[end] != cnt:
            return 0
        need[end] = cnt
    ways = [1]
    for i in range(n):
        size = i * (i + 1) // 2 + 1
        nxt = [0] * size
        for j, w in enumerate(ways):
            for k in range(i + 1):
                nxt[j + k] = (nxt[j + k] + w) % MOD
        if i in need:
            nxt = [v if j == need[i] else 0 for j, v in enumerate(nxt)]
        ways = nxt
    return sum(ways) % MOD
`
