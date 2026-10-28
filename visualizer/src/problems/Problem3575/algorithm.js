const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with vals and par, for example {"vals":[2,3],"par":[-1,0]}.')
  const { vals, par } = data
  if (!Array.isArray(vals) || vals.length < 1 || vals.length > 8) throw new Error('vals must have 1 to 8 entries.')
  if (!Array.isArray(par) || par.length !== vals.length) throw new Error('par must have the same length as vals.')
  if (vals.some(v => !Number.isInteger(v) || v < 1 || v > 999)) throw new Error('Each value is an integer from 1 to 999.')
  if (par[0] !== -1) throw new Error('par[0] must be -1 for the root.')
  const n = vals.length
  for (let i = 1; i < n; i++) {
    if (!Number.isInteger(par[i]) || par[i] < 0 || par[i] >= n || par[i] === i) throw new Error('Each par[i] must be another node label.')
    let v = i
    let steps = 0
    while (v !== 0 && steps <= n) { v = par[v]; steps++ }
    if (v !== 0) throw new Error('The parent array must describe a tree rooted at 0.')
  }
  return { vals: [...vals], par: [...par] }
}

const digitMask = x => {
  let mask = 0
  for (const ch of String(x)) {
    const bit = 1 << Number(ch)
    if (mask & bit) return -1
    mask |= bit
  }
  return mask
}

// Merge two maps from digit masks to best score; keep only pairs of disjoint masks.
function merge(a, b) {
  const out = new Map()
  for (const [m1, s1] of a) {
    for (const [m2, s2] of b) {
      if (m1 & m2) continue
      const m = m1 | m2
      if (!out.has(m) || out.get(m) < s1 + s2) out.set(m, s1 + s2)
    }
  }
  return out
}

export function buildTrace(input) {
  const { vals, par } = input
  const n = vals.length
  const children = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) children[par[i]].push(i)
  const order = [0]
  for (let i = 0; i < order.length; i++) for (const c of children[order[i]]) order.push(c)
  const maps = Array(n).fill(null)
  const maxScore = Array(n).fill(0)
  const frames = [{ phase: 'start', activeLine: L('build the child lists'), node: null, best: null, message: 'Process nodes from the bottom of the tree. Each node keeps the best score for every set of digits its subtree can use.' }]
  for (let i = order.length - 1; i >= 0; i--) {
    const v = order[i]
    let cur = new Map([[0, 0]])
    for (const c of children[v]) cur = merge(cur, maps[c])
    const mask = digitMask(vals[v])
    const withV = new Map(cur)
    if (mask >= 0) {
      for (const [m, s] of cur) {
        if (m & mask) continue
        const nm = m | mask
        if (!withV.has(nm) || withV.get(nm) < s + vals[v]) withV.set(nm, s + vals[v])
      }
    }
    maps[v] = withV
    maxScore[v] = Math.max(...withV.values())
    frames.push({ phase: 'node', activeLine: L('for each child c, merge'), node: v, best: maxScore[v], message: `Node ${v}: the best good subset in its subtree scores ${maxScore[v]}.` })
  }
  const result = maxScore.reduce((sum, s) => sum + s, 0) % MOD
  frames.push({ phase: 'done', activeLine: L('return the sum of maxScore'), node: null, best: result, message: `The sum of all maxScore values, modulo 1000000007, is ${result}.` })
  return { input, result, frames }
}

export const code = `maximum good subtree score (vals, par)
  build the child lists from par, and order the nodes so that parents come first
  for each node v from the bottom of the order
    set cur to the map {empty set: 0}
    for each child c, merge cur with the map of c, keeping only disjoint digit sets
    if the digits of vals[v] are all different then add v to every compatible entry
    store cur as the map of v and let maxScore[v] be its largest score
  return the sum of maxScore modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_good_subtree_score(vals, par):
    MOD = 10 ** 9 + 7
    n = len(vals)
    children = [[] for _ in range(n)]
    for i in range(1, n):
        children[par[i]].append(i)
    order = [0]
    for v in order:
        order.extend(children[v])

    def digit_mask(x):
        mask = 0
        for ch in str(x):
            bit = 1 << int(ch)
            if mask & bit:
                return -1
            mask |= bit
        return mask

    def merge(a, b):
        out = {}
        for m1, s1 in a.items():
            for m2, s2 in b.items():
                if m1 & m2:
                    continue
                m = m1 | m2
                if out.get(m, -1) < s1 + s2:
                    out[m] = s1 + s2
        return out

    maps = [None] * n
    max_score = [0] * n
    for v in reversed(order):
        cur = {0: 0}
        for c in children[v]:
            cur = merge(cur, maps[c])
        mask = digit_mask(vals[v])
        with_v = dict(cur)
        if mask >= 0:
            for m, s in cur.items():
                if m & mask:
                    continue
                nm = m | mask
                if with_v.get(nm, -1) < s + vals[v]:
                    with_v[nm] = s + vals[v]
        maps[v] = with_v
        max_score[v] = max(with_v.values())
    return sum(max_score) % MOD
`
