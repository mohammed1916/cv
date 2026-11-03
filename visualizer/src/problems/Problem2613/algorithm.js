const CODE = [
  'find indices i < j minimizing |x_i - x_j| + |y_i - y_j|, ties by smallest pair',
  'order the points by x, then by index',
  'tree A and tree B are empty; best distance is infinity',
  'for each point j in that order',
  '  query A: earlier points with y at most y_j, largest x + y, smallest index',
  '  query B: earlier points with y at least y_j, largest x - y, smallest index',
  '  for each answer found, compute its distance and keep it if it is better',
  '  insert j into tree A with key x + y and into tree B with key x - y',
  'return the best pair',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))

const PY = [
  'def beautiful_pairs(nums1, nums2):',
  '    n = len(nums1)',
  '    order = sorted(range(n), key=lambda i: (nums1[i], i))',
  '    ys = sorted(set(nums2))',
  '    m = len(ys)',
  '    rank = {y: r + 1 for r, y in enumerate(ys)}',
  '    tree_a = [None] * (m + 1)',
  '    tree_b = [None] * (m + 1)',
  '    def better(p, q):',
  '        if p is None:',
  '            return q',
  '        if q is None:',
  '            return p',
  '        if p[0] != q[0]:',
  '            return p if p[0] > q[0] else q',
  '        return p if p[1] < q[1] else q',
  '    def update(tree, pos, entry):',
  '        while pos <= m:',
  '            tree[pos] = better(tree[pos], entry)',
  '            pos += pos & -pos',
  '    def query(tree, pos):',
  '        best = None',
  '        while pos > 0:',
  '            best = better(best, tree[pos])',
  '            pos -= pos & -pos',
  '        return best',
  '    best_dist = None',
  '    best_pair = None',
  '    for j in order:',
  '        x, y = nums1[j], nums2[j]',
  '        r = rank[y]',
  '        rr = m + 1 - r',
  '        found = []',
  '        e = query(tree_a, r)',
  '        if e is not None:',
  '            found.append((x + y - e[0], e[1]))',
  '        e = query(tree_b, rr)',
  '        if e is not None:',
  '            found.append((x - y - e[0], e[1]))',
  '        for dist, i in found:',
  '            pair = (min(i, j), max(i, j))',
  '            if best_dist is None or dist < best_dist or (dist == best_dist and pair < best_pair):',
  '                best_dist, best_pair = dist, pair',
  '        update(tree_a, r, (x + y, j))',
  '        update(tree_b, rr, (x - y, j))',
  '    return list(best_pair)',
]
export const python = `${PY.join('\n')}\n`

const L = key => {
  const found = code.findIndex(c => c.text.includes(key))
  if (found < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return found + 1
}
const P = key => {
  const found = PY.findIndex(line => line.includes(key))
  if (found < 0) throw new Error(`Missing python line: ${key}`)
  return found + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || nums1.length !== nums2.length) throw new Error('nums1 and nums2 have the same length.')
  if (nums1.length < 2 || nums1.length > 8) throw new Error('Use 2 to 8 points for the visualization.')
  for (const v of [...nums1, ...nums2]) if (!Number.isInteger(v) || v < -9 || v > 9) throw new Error('Each coordinate is a whole number from -9 to 9.')
  return { nums1, nums2 }
}

// Fenwick tree for prefix maxima. An entry is { s, idx }; larger s wins, then smaller idx.
const better = (p, q) => {
  if (p === null) return q
  if (q === null) return p
  if (p.s !== q.s) return p.s > q.s ? p : q
  return p.idx < q.idx ? p : q
}
function update(tree, pos, entry) {
  for (let p = pos; p < tree.length; p += p & -p) tree[p] = better(tree[p], entry)
}
function query(tree, pos) {
  let best = null
  for (let p = pos; p > 0; p -= p & -p) best = better(best, tree[p])
  return best
}

export function buildTrace({ nums1, nums2 }) {
  const n = nums1.length
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => nums1[a] - nums1[b] || a - b)
  const ys = [...new Set(nums2)].sort((a, b) => a - b)
  const m = ys.length
  const rank = new Map(ys.map((y, r) => [y, r + 1]))
  const treeA = Array(m + 1).fill(null)
  const treeB = Array(m + 1).fill(null)
  const frames = []
  let bestDist = null
  let bestPair = null
  const inserted = []
  const F = (phase, codeKey, pyKey, message, state) => frames.push({
    phase,
    activeLine: L(codeKey),
    pythonLine: P(pyKey),
    message,
    bestDist,
    bestPair: bestPair ? [...bestPair] : null,
    inserted: inserted.slice(),
    j: -1,
    partner: null,
    ...state,
  })
  F('setup', 'order the points by x', 'order = sorted', `Points sorted by x, then index: [${order.join(', ')}].`, {})
  F('setup', 'tree A and tree B are empty', 'tree_a = [None]', 'Both trees start empty; no pair has been seen yet.', {})
  for (const j of order) {
    const x = nums1[j]
    const y = nums2[j]
    const r = rank.get(y)
    const rr = m + 1 - r
    F('point', 'for each point j in that order', 'for j in order', `Point ${j} at (${x}, ${y}) is next; earlier points have x no larger than ${x}.`, { j })
    const found = []
    const eA = query(treeA, r)
    F('queryA', 'query A: earlier points with y at most', 'e = query(tree_a, r)', eA
      ? `Among earlier points with y at most ${y}, point ${eA.idx} has the largest x + y (${eA.s}).`
      : `No earlier point has y at most ${y}.`, { j, partner: eA ? eA.idx : null, region: 'A' })
    if (eA) found.push({ dist: x + y - eA.s, i: eA.idx, region: 'A' })
    const eB = query(treeB, rr)
    F('queryB', 'query B: earlier points with y at least', 'e = query(tree_b, rr)', eB
      ? `Among earlier points with y at least ${y}, point ${eB.idx} has the largest x - y (${eB.s}).`
      : `No earlier point has y at least ${y}.`, { j, partner: eB ? eB.idx : null, region: 'B' })
    if (eB) found.push({ dist: x - y - eB.s, i: eB.idx, region: 'B' })
    for (const c of found) {
      const pair = [Math.min(c.i, j), Math.max(c.i, j)]
      const better_ = bestDist === null || c.dist < bestDist || (c.dist === bestDist && (pair[0] < bestPair[0] || (pair[0] === bestPair[0] && pair[1] < bestPair[1])))
      if (better_) {
        bestDist = c.dist
        bestPair = pair
        F('record', 'for each answer found, compute its distance', 'best_dist, best_pair = dist, pair', `Pair (${pair[0]}, ${pair[1]}) has distance ${c.dist}; it becomes the best so far.`, { j, partner: c.i, region: c.region })
      }
    }
    update(treeA, r, { s: x + y, idx: j })
    update(treeB, rr, { s: x - y, idx: j })
    inserted.push(j)
    F('insert', 'insert j into tree A', 'update(tree_a, r', `Point ${j} joins both trees with keys x + y = ${x + y} and x - y = ${x - y}.`, { j })
  }
  F('done', 'return the best pair', 'return list(best_pair)', `The beautiful pair is [${bestPair[0]}, ${bestPair[1]}] at distance ${bestDist}.`, { j: -1 })
  return { input: { nums1, nums2 }, result: bestPair, frames }
}
