export function parseInput(text) {
  const d = JSON.parse(text)
  if (!d || !Array.isArray(d.A) || !Array.isArray(d.B)) throw new Error('Enter JSON like {"A": [[1,0],[0,1]], "B": [[0,1],[1,0]]}.')
  const n = d.A.length
  const square = m => Array.isArray(m) && m.length === n && m.every(r => Array.isArray(r) && r.length === n && r.every(v => v === 0 || v === 1))
  if (n < 1 || n > 8 || !square(d.A) || !square(d.B)) throw new Error('A and B must be square 0/1 matrices of the same size, 1 to 8 (visualization cap).')
  return { A: d.A.map(r => [...r]), B: d.B.map(r => [...r]) }
}
export function buildTrace({ A, B }) {
  const n = A.length
  const onesA = [], onesB = []
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { if (A[i][j]) onesA.push([i, j]); if (B[i][j]) onesB.push([i, j]) }
  const votes = new Map()
  const pairs = []
  let best = 0, bestKey = null
  const frames = [{ phase: 'start', pair: -1, best: 0, bestKey: null, activeLine: 5, message: `A has ${onesA.length} one(s), B has ${onesB.length}. Sliding A by (dr, dc) overlaps a pair of 1s exactly when their offset equals that shift.` }]
  for (const [ai, aj] of onesA) for (const [bi, bj] of onesB) {
    const key = `${bi - ai},${bj - aj}`
    const c = (votes.get(key) || 0) + 1
    votes.set(key, c)
    pairs.push(key)
    if (c > best) { best = c; bestKey = key }
    frames.push({ phase: 'vote', pair: pairs.length - 1, a: [ai, aj], b: [bi, bj], key, votesForKey: c, best, bestKey, activeLine: 9,
      message: `A's 1 at (${ai},${aj}) and B's 1 at (${bi},${bj}) agree on shift (${key}). That shift now has ${c} vote(s). Best: ${best}.` })
  }
  frames.push({ phase: 'done', pair: pairs.length - 1, best, bestKey, activeLine: 10, message: best ? `Largest overlap is ${best}, achieved by shifting A by (${bestKey}).` : 'No pair of 1s exists, so the overlap is 0.' })
  return { input: { A, B }, pairs, result: best, frames }
}
export const code = `def largestOverlap(A, B):
    n = len(A)
    ones_a = [(i, j) for i in range(n) for j in range(n) if A[i][j]]
    ones_b = [(i, j) for i in range(n) for j in range(n) if B[i][j]]
    vote = {}
    for ai, aj in ones_a:
        for bi, bj in ones_b:
            d = (bi - ai, bj - aj)
            vote[d] = vote.get(d, 0) + 1
    return max(vote.values(), default=0)`.split('\n').map((text, index) => ({ line: index + 1, text }))
