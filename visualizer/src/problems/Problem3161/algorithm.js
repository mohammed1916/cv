const M = 16

export function parseInput(text) {
  const queries = JSON.parse(text)
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 12) throw new Error('Enter 1 to 12 queries.')
  for (const q of queries) {
    if (!Array.isArray(q)) throw new Error('Each query is an array.')
    if (q[0] === 1 && q.length === 2 && Number.isInteger(q[1]) && q[1] >= 0 && q[1] < M) continue
    if (q[0] === 2 && q.length === 3 && Number.isInteger(q[1]) && q[1] >= 0 && q[1] < M && Number.isInteger(q[2]) && q[2] >= 1 && q[2] <= M) continue
    throw new Error(`Use [1, x] to place an obstacle at x, or [2, x, size] to check a block in [0, x]; x is 0 to ${M - 1}.`)
  }
  return queries
}

// A idx summarises a run of cells: length, free prefix, free suffix and longest free run.
const combine = (a, b) => ({
  len: a.len + b.len,
  pre: a.pre === a.len ? a.len + b.pre : a.pre,
  suf: b.suf === b.len ? b.len + a.suf : b.suf,
  best: Math.max(a.best, b.best, a.suf + b.pre),
})
const IDENTITY = { len: 0, pre: 0, suf: 0, best: 0 }
const leaf = free => ({ len: 1, pre: free, suf: free, best: free })

export function buildTrace(queries) {
  const tree = Array(4 * M).fill(null)
  const blocked = Array(M).fill(false)
  const build = (id, lo, hi) => {
    if (lo === hi) { tree[id] = leaf(1); return }
    const mid = (lo + hi) >> 1
    build(2 * id, lo, mid); build(2 * id + 1, mid + 1, hi)
    tree[id] = combine(tree[2 * id], tree[2 * id + 1])
  }
  build(1, 0, M - 1)
  const set = (id, lo, hi, pos, free) => {
    if (lo === hi) { tree[id] = leaf(free); return }
    const mid = (lo + hi) >> 1
    if (pos <= mid) set(2 * id, lo, mid, pos, free)
    else set(2 * id + 1, mid + 1, hi, pos, free)
    tree[id] = combine(tree[2 * id], tree[2 * id + 1])
  }
  // Summary of cells lo..qr (the prefix query), built left to right.
  const prefix = (id, lo, hi, qr) => {
    if (lo > qr) return IDENTITY
    if (hi <= qr) return tree[id]
    const mid = (lo + hi) >> 1
    return combine(prefix(2 * id, lo, mid, qr), prefix(2 * id + 1, mid + 1, hi, qr))
  }
  const answers = []
  const frames = [{ phase: 'start', query: null, answer: null, blocked: blocked.slice(), window: null, activeLine: L('set answers to'), message: 'No obstacles yet. Every cell is free.' }]
  for (const q of queries) {
    if (q[0] === 1) {
      blocked[q[1]] = true
      set(1, 0, M - 1, q[1], 0)
      frames.push({ phase: 'obstacle', query: q, answer: null, blocked: blocked.slice(), window: null, activeLine: L('set that cell to blocked'), message: `Obstacle at cell ${q[1]}.` })
    } else {
      const [, x, size] = q
      const run = prefix(1, 0, M - 1, x).best
      const ok = run >= size
      answers.push(ok)
      frames.push({ phase: 'check', query: q, answer: ok, longest: run, blocked: blocked.slice(), window: x, activeLine: L('append whether'), message: `Longest free run in [0, ${x}] is ${run}; a block of ${size} ${ok ? 'fits' : 'does not fit'}.` })
    }
  }
  frames.push({ phase: 'done', query: null, answer: null, blocked: blocked.slice(), window: null, activeLine: L('return answers'), message: `Answers: [${answers.join(', ')}].` })
  return { input: queries, result: answers, frames }
}

export const code = `answer block placement queries over cells 0 to 15
  set answers to an empty list
  build a segment tree whose nodes store the free prefix, free suffix and longest free run
  for each query in order
    if the query places an obstacle at x then
      set that cell to blocked and update its path in the tree
    otherwise combine the nodes covering cells 0 to x, and append whether the longest free run is at least size
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def get_results(queries):
    M = 16
    IDENTITY = (0, 0, 0, 0)

    def combine(a, b):
        la, pa, sa, ba = a
        lb, pb, sb, bb = b
        pre = la + pb if pa == la else pa
        suf = lb + sa if sb == lb else sb
        return (la + lb, pre, suf, max(ba, bb, sa + pb))

    def leaf(free):
        return (1, free, free, free)

    tree = [IDENTITY] * (4 * M)

    def build(idx, lo, hi):
        if lo == hi:
            tree[idx] = leaf(1)
            return
        mid = (lo + hi) // 2
        build(2 * idx, lo, mid)
        build(2 * idx + 1, mid + 1, hi)
        tree[idx] = combine(tree[2 * idx], tree[2 * idx + 1])

    def set_cell(idx, lo, hi, pos, free):
        if lo == hi:
            tree[idx] = leaf(free)
            return
        mid = (lo + hi) // 2
        if pos <= mid:
            set_cell(2 * idx, lo, mid, pos, free)
        else:
            set_cell(2 * idx + 1, mid + 1, hi, pos, free)
        tree[idx] = combine(tree[2 * idx], tree[2 * idx + 1])

    def prefix(idx, lo, hi, qr):
        if lo > qr:
            return IDENTITY
        if hi <= qr:
            return tree[idx]
        mid = (lo + hi) // 2
        return combine(prefix(2 * idx, lo, mid, qr), prefix(2 * idx + 1, mid + 1, hi, qr))

    build(1, 0, M - 1)
    answers = []
    for q in queries:
        if q[0] == 1:
            set_cell(1, 0, M - 1, q[1], 0)
        else:
            answers.append(prefix(1, 0, M - 1, q[1])[3] >= q[2])
    return answers
`
