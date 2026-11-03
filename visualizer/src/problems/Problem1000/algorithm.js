export const phases = [
  { id: 'start', label: 'Start', description: 'Read the piles and the group size, then check whether the pile count can collapse to one pile.' },
  { id: 'inspect', label: 'Inspect interval', description: 'For this block, try every split into a left part that forms the remaining piles and a right part that forms one pile.' },
  { id: 'update', label: 'Store cost', description: 'Record the cheapest single-pile cost for the block, adding the block total when its last merge is possible.' },
  { id: 'done', label: 'Complete', description: 'Return the cost for the whole row, or -1 when the pile count cannot collapse.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"stones": [3, 1, 4], "k": 2}.')
  const { stones, k } = input
  if (!Array.isArray(stones) || stones.length < 1 || stones.length > 8 || !stones.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('stones is a list of 1 to 8 integers from 1 to 100.')
  if (!Number.isInteger(k) || k < 2 || k > 8) throw new Error('k is an integer from 2 to 8.')
  return { stones, k }
}

export function buildTrace({ stones, k }) {
  const n = stones.length
  const pre = [0]
  for (const v of stones) pre.push(pre[pre.length - 1] + v)
  const total = (i, j) => pre[j + 1] - pre[i]
  const piles = Array.from({ length: n }, () => Array.from({ length: n }, () => Array(k + 1).fill(Infinity)))
  const single = Array.from({ length: n }, () => Array(n).fill(null))
  for (let i = 0; i < n; i++) { piles[i][i][1] = 0; single[i][i] = 0 }
  const feasible = (n - 1) % (k - 1) === 0
  const snap = (i, j) => ({ single: single.map(row => [...row]), i, j, feasible })
  const frames = [{ phase: 'start', activeLine: L('if (n - 1) mod (k - 1) != 0'), pythonLine: P('if (n - 1) % (k - 1)'), snapshot: snap(null, null), message: `${n} piles, groups of ${k}. Each merge removes ${k - 1} piles, so the count must satisfy (n - 1) mod ${k - 1} = 0; it ${feasible ? 'does' : 'does not'}.` }]

  if (!feasible) {
    frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: P('return -1'), snapshot: snap(null, null), message: 'The pile count cannot collapse to one, so the answer is -1.' })
    return { input: { stones, k }, result: -1, frames }
  }

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      frames.push({ phase: 'inspect', activeLine: L('for each start i'), pythonLine: P('for i in range(n - length + 1)'), snapshot: snap(i, j), message: `Block ${i} to ${j} has ${len} piles. Try each split point for its cheapest way to form one pile.` })
      for (let p = 2; p <= Math.min(k, len); p++) {
        let best = Infinity
        for (let m = i; m < j; m++) best = Math.min(best, piles[i][m][p - 1] + piles[m + 1][j][1])
        piles[i][j][p] = best
      }
      if ((len - 1) % (k - 1) === 0 && piles[i][j][k] < Infinity) {
        single[i][j] = piles[i][j][k] + total(i, j)
        piles[i][j][1] = single[i][j]
        frames.push({ phase: 'update', activeLine: L('piles[i][j][1] = piles[i][j][k]'), pythonLine: P('piles[i][j][1] = piles[i][j][k]'), snapshot: snap(i, j), message: `Block ${i} to ${j} collapses to one pile at cost ${single[i][j]}: the cost of k piles plus their total ${total(i, j)}.` })
      } else {
        frames.push({ phase: 'update', activeLine: L('piles[i][j][1] = piles[i][j][k]'), pythonLine: P('piles[i][j][1] = piles[i][j][k]'), snapshot: snap(i, j), message: `Block ${i} to ${j} cannot end as a single pile, so only its multi-pile costs are kept.` })
      }
    }
  }
  const result = single[0][n - 1]
  frames.push({ phase: 'done', activeLine: L('return piles[0][n - 1][1]'), pythonLine: P('return piles[0][n - 1][1]'), snapshot: snap(0, n - 1), message: `The whole row costs ${result}.` })
  return { input: { stones, k }, result, frames }
}

export const code = `minimum merge cost (stones, k):
  n = number of piles
  if (n - 1) mod (k - 1) != 0: return -1
  build prefix sums of stones
  piles[i][i][1] = 0 for every pile
  for length from 2 to n:
    for each start i:
      j = i + length - 1
      for p from 2 to min(k, length):
        piles[i][j][p] = min over split m of piles[i][m][p - 1] + piles[m + 1][j][1]
      if (length - 1) mod (k - 1) == 0:
        piles[i][j][1] = piles[i][j][k] + sum of stones i..j
  return piles[0][n - 1][1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def merge_stones(stones, k):
    n = len(stones)
    if (n - 1) % (k - 1):
        return -1
    pre = [0]
    for v in stones:
        pre.append(pre[-1] + v)
    INF = float("inf")
    piles = [[[INF] * (k + 1) for _ in range(n)] for _ in range(n)]
    for i in range(n):
        piles[i][i][1] = 0
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            for p in range(2, min(k, length) + 1):
                piles[i][j][p] = min(piles[i][m][p - 1] + piles[m + 1][j][1] for m in range(i, j))
            if (length - 1) % (k - 1) == 0:
                piles[i][j][1] = piles[i][j][k] + pre[j + 1] - pre[i]
    return piles[0][n - 1][1]
`
