export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join() !== 's1,s2,x') throw new Error('Use a JSON object with keys s1, s2 and x.')
  const { s1, s2, x } = input
  if (typeof s1 !== 'string' || typeof s2 !== 'string' || !/^[01]{1,12}$/.test(s1) || !/^[01]{1,12}$/.test(s2)) throw new Error('s1 and s2 must be binary strings of 1 to 12 digits.')
  if (s1.length !== s2.length) throw new Error('s1 and s2 must have the same length.')
  if (!Number.isInteger(x) || x < 1 || x > 20) throw new Error('x must be an integer from 1 to 20.')
  return { s1, s2, x }
}

export function buildTrace(input) {
  const { s1, s2, x } = input
  const n = s1.length
  const diff = [...s1].map((c, j) => (c !== s2[j] ? 1 : 0))
  const marked = diff.reduce((p, q) => p + q, 0)
  const frames = [{ phase: 'mark', activeLine: L('mark each position'), index: -1, table: [], result: null, message: `Mark the positions where the strings differ: ${marked} in total.` }]
  if (marked % 2 === 1) {
    frames.push({ phase: 'done', activeLine: L('return minus one'), index: -1, table: [], result: -1, message: 'An odd number of mismatches cannot be fixed by flips in pairs, so the answer is -1.' })
    return { input: { s1, s2, x }, result: -1, frames }
  }
  // table maps "carry out of this position" (0 or 1, meaning a flip is still open) to the cheapest value.
  // Values are doubled so that an adjacent flip costs 2 and a pair flip costs x.
  let table = new Map([[0, 0]])
  const history = []
  for (let j = 0; j < n; j++) {
    const next = new Map()
    const choices = j === n - 1 ? [0] : [0, 1]
    for (const [prev, val] of table) {
      for (const c of choices) {
        const r = (diff[j] + prev + c) % 2
        const v = val + 2 * c + x * r
        if (!next.has(c) || v < next.get(c)) next.set(c, v)
      }
    }
    table = next
    history.push([next.get(0) ?? null, next.get(1) ?? null])
    frames.push({ phase: 'position', activeLine: L('for each carry before'), index: j, table: history.map(row => [...row]), result: null, message: `Position ${j} (${diff[j] ? 'differs' : 'matches'}): cheapest values with the carry open or closed are shown.` })
  }
  const result = table.get(0) / 2
  frames.push({ phase: 'done', activeLine: L('divided by two'), index: -1, table: history.map(row => [...row]), result, message: `Cheapest cost is ${result}.` })
  return { input: { s1, s2, x }, result, frames }
}

export const code = `Minimum cost to make two binary strings equal
mark each position where s1 and s2 differ
if the number of marked positions is odd then return minus one
set the table to hold carry zero with value zero
for each position j from left to right
  set the next table to empty
  for each carry before with value V in the table
    for each carry after c in zero and one, only zero at the last position
      set r to one if the mark at j plus the carry before plus c is odd, otherwise zero
      record V plus two times c plus x times r under c, keeping the smaller value
  set the table to the next table
return the value under carry zero divided by two`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_cost_to_equal(s1, s2, x):
    n = len(s1)
    d = [int(a != b) for a, b in zip(s1, s2)]
    if sum(d) % 2:
        return -1
    INF = float('inf')
    dp = {0: 0}
    for j in range(n):
        nxt = {}
        choices = (0,) if j == n - 1 else (0, 1)
        for prev, val in dp.items():
            for c in choices:
                r = (d[j] + prev + c) % 2
                v = val + 2 * c + x * r
                if v < nxt.get(c, INF):
                    nxt[c] = v
        dp = nxt
    return dp[0] // 2
`
