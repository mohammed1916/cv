export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with prices and profits lists.')
  const { prices, profits } = input
  if (!Array.isArray(prices) || !Array.isArray(profits) || prices.length < 1 || prices.length > 12) throw new Error('prices and profits each have 1 to 12 entries.')
  if (prices.length !== profits.length) throw new Error('prices and profits must have the same length.')
  const inRange = v => Number.isInteger(v) && v >= -30 && v <= 30
  if (!prices.every(inRange) || !profits.every(inRange)) throw new Error('Each value is an integer from -30 to 30.')
  return { prices, profits }
}

export function buildTrace({ prices, profits }) {
  const n = prices.length
  const distinct = [...new Set(prices)].sort((a, b) => a - b)
  const rankOf = new Map(distinct.map((p, i) => [p, i + 1]))
  const m = distinct.length
  const NEG = -Infinity
  const toNum = v => (v === NEG ? null : v)
  const left = Array(n).fill(NEG)
  const right = Array(n).fill(NEG)
  let tree = Array(m + 1).fill(NEG)
  let best = NEG
  let bestMiddle = -1
  const frames = []
  const frame = (phase, pythonLine, text, j, message) => frames.push({
    phase, pythonLine, activeLine: L(text), j,
    tree: tree.map(toNum), left: left.map(toNum), right: right.map(toNum),
    best: toNum(best), bestMiddle, message,
  })
  const query = (tr, i) => {
    let b = NEG
    for (; i > 0; i -= i & -i) b = Math.max(b, tr[i])
    return b
  }
  const update = (tr, i, v) => {
    for (; i <= m; i += i & -i) tr[i] = Math.max(tr[i], v)
  }

  frame('start', 3, 'compress prices to ranks', -1, `The prices have ${m} distinct values, so each gets a rank from 1 to ${m}.`)
  frame('sweep', 18, 'left pass', -1, 'Sweep left to right. Each index asks the tree for the best profit with a smaller rank.')
  for (let j = 0; j < n; j++) {
    const r = rankOf.get(prices[j])
    left[j] = query(tree, r - 1)
    frame('query', 20, 'leftBest is the largest profit', j, `Index ${j} asks for the best profit below rank ${r}: ${toNum(left[j]) ?? 'none'}.`)
    update(tree, r, profits[j])
    frame('insert', 21, 'insert profits[j] at rank j', j, `Index ${j} stores profit ${profits[j]} at rank ${r}.`)
  }

  tree = Array(m + 1).fill(NEG)
  frame('sweep', 24, 'right pass', -1, 'Sweep right to left with mirrored ranks, so a larger price becomes a smaller mirrored rank.')
  for (let j = n - 1; j >= 0; j--) {
    const r = m + 1 - rankOf.get(prices[j])
    right[j] = query(tree, r - 1)
    frame('query-right', 26, 'rightBest is the largest profit', j, `Index ${j} asks for the best profit with a larger price: ${toNum(right[j]) ?? 'none'}.`)
    update(tree, r, profits[j])
    frame('insert-right', 27, 'insert profits[j] at its mirrored rank', j, `Index ${j} stores profit ${profits[j]} at mirrored rank ${r}.`)
  }

  for (let j = 0; j < n; j++) {
    if (left[j] !== NEG && right[j] !== NEG) {
      const total = left[j] + profits[j] + right[j]
      frame('combine', 31, 'for each j with a left', j, `Middle ${j}: ${left[j]} + ${profits[j]} + ${right[j]} = ${total}.`)
      if (best === NEG || total > best) {
        best = total
        bestMiddle = j
        frame('best', 31, 'for each j with a left', j, `New best ${best} with middle index ${j}.`)
      }
    } else {
      frame('skip', 30, 'for each j with a left', j, `Middle ${j} lacks a left or right partner.`)
    }
  }
  const result = best === NEG ? -1 : best
  frame('done', 32, 'return best or -1', -1, result === -1 ? 'No strictly increasing triplet exists.' : `The best triplet profit is ${result}.`)
  return { input: { prices, profits }, result, frames }
}

export const code = `maximum profit triplet or -1
  compress prices to ranks 1 to m
  left pass: sweep j from first to last
    leftBest is the largest profit with a smaller rank so far
    insert profits[j] at rank j in the max Fenwick tree
  right pass: sweep j from last to first
    rightBest is the largest profit with a larger rank so far
    insert profits[j] at its mirrored rank
  for each j with a left and right best, combine
  return best or -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_profitable_triplet(prices, profits):
    n = len(prices)
    ranks = {p: r for r, p in enumerate(sorted(set(prices)), 1)}
    m = len(ranks)
    NEG = float('-inf')
    def query(tree, i):
        best = NEG
        while i > 0:
            best = max(best, tree[i])
            i -= i & -i
        return best
    def update(tree, i, value):
        while i <= m:
            tree[i] = max(tree[i], value)
            i += i & -i
    left = [NEG] * n
    tree = [NEG] * (m + 1)
    for j in range(n):
        r = ranks[prices[j]]
        left[j] = query(tree, r - 1)
        update(tree, r, profits[j])
    right = [NEG] * n
    tree = [NEG] * (m + 1)
    for j in range(n - 1, -1, -1):
        r = m + 1 - ranks[prices[j]]
        right[j] = query(tree, r - 1)
        update(tree, r, profits[j])
    best = NEG
    for j in range(n):
        if left[j] != NEG and right[j] != NEG:
            best = max(best, left[j] + profits[j] + right[j])
    return -1 if best == NEG else best
`
