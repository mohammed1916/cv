const MAX_NUMS = 12
const MAX_QUERIES = 6
const MAX_VALUE = 1e9

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, k and queries.')
  const { nums, k, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_NUMS) throw new Error(`nums has 1 to ${MAX_NUMS} entries in this visualization.`)
  const isValue = value => Number.isInteger(value) && value >= 1 && value <= MAX_VALUE
  if (!nums.every(isValue)) throw new Error('Each entry of nums is an integer from 1 to 1000000000.')
  if (!Number.isInteger(k) || k < 1 || k > 5) throw new Error('k is an integer from 1 to 5.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > MAX_QUERIES) throw new Error(`queries has 1 to ${MAX_QUERIES} entries in this visualization.`)
  for (const query of queries) {
    if (!Array.isArray(query) || query.length !== 4 || !query.every(Number.isInteger)) throw new Error('Each query is [index, value, start, x].')
    const [index, value, start, x] = query
    if (index < 0 || index >= nums.length) throw new Error(`A query index is between 0 and ${nums.length - 1}.`)
    if (!isValue(value)) throw new Error('A query value is an integer from 1 to 1000000000.')
    if (start < 0 || start >= nums.length) throw new Error(`A query start is between 0 and ${nums.length - 1}.`)
    if (x < 0 || x >= k) throw new Error(`A query x is between 0 and ${k - 1}.`)
  }
  return { nums: [...nums], k, queries: queries.map(query => [...query]) }
}

export const code = `count end positions whose product from start has remainder x
  every tree node stores its range's product mod k
  and cnt[r], how many prefixes of its range have product remainder r
  a leaf holds value mod k and counts its single prefix
  to merge: product is left product times right product mod k
    left's prefixes keep their remainders in the merged counts
    a right prefix with remainder r becomes left product times r mod k
  build the tree bottom up
  for each query [index, value, start, x]
    overwrite the leaf for index, then re-merge its ancestors
    start with total counts all 0 and carry product 1
    walk the tree left to right, skipping ranges before start
      for a fully covered node: add its counts shifted by carry
      then multiply carry by the node's product
    the answer is total[x]
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Pseudocode line missing: ${key}`)
  return index + 1
}

export const python = `def x_value_queries(nums, k, queries):
    n = len(nums)
    prod = [1] * (4 * n)
    cnt = [[0] * k for _ in range(4 * n)]

    def set_leaf(node, value):
        prod[node] = value % k
        cnt[node] = [0] * k
        cnt[node][value % k] = 1

    def merge(node):
        left, right = 2 * node, 2 * node + 1
        prod[node] = prod[left] * prod[right] % k
        cnt[node] = cnt[left][:]
        for r in range(k):
            cnt[node][prod[left] * r % k] += cnt[right][r]

    def build(node, lo, hi):
        if lo == hi:
            set_leaf(node, nums[lo])
            return
        mid = (lo + hi) // 2
        build(2 * node, lo, mid)
        build(2 * node + 1, mid + 1, hi)
        merge(node)

    def update(node, lo, hi, index, value):
        if lo == hi:
            set_leaf(node, value)
            return
        mid = (lo + hi) // 2
        if index <= mid:
            update(2 * node, lo, mid, index, value)
        else:
            update(2 * node + 1, mid + 1, hi, index, value)
        merge(node)

    def absorb(node, lo, hi, start, total, carry):
        if hi < start:
            return carry
        if lo >= start:
            for r in range(k):
                total[carry * r % k] += cnt[node][r]
            return carry * prod[node] % k
        mid = (lo + hi) // 2
        carry = absorb(2 * node, lo, mid, start, total, carry)
        return absorb(2 * node + 1, mid + 1, hi, start, total, carry)

    build(1, 0, n - 1)
    answers = []
    for index, value, start, x in queries:
        update(1, 0, n - 1, index, value)
        total = [0] * k
        absorb(1, 0, n - 1, start, total, 1)
        answers.append(total[x])
    return answers`

const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'The array and the modulus.' },
  { id: 'leaf', label: 'Leaf', description: 'A single element is one prefix with one remainder.' },
  { id: 'merge', label: 'Merge', description: 'Combine two children by shifting the right counts.' },
  { id: 'query', label: 'Query', description: 'Read the next query.' },
  { id: 'update', label: 'Update', description: 'Overwrite one leaf; this change stays for later queries.' },
  { id: 'descend', label: 'Descend', description: 'Find the nodes that cover start onward.' },
  { id: 'absorb', label: 'Absorb', description: 'Add a covered node to the running totals.' },
  { id: 'answer', label: 'Answer', description: 'Read total[x] for this query.' },
  { id: 'done', label: 'Result', description: 'All query answers.' },
]

export function buildTrace({ nums: original, k, queries }) {
  const nums = [...original]
  const n = nums.length
  const prod = {}
  const cnt = {}
  const bounds = {}
  const frames = []
  const answers = []
  let query = null
  let queryIndex = -1
  let total = null
  let carry = null
  let revealedThrough = -1
  let covered = []

  // Product of nums[start..end] mod k for each end; computed directly, so the view can check the tree.
  const endProducts = start => {
    const values = []
    let running = 1 % k
    for (let end = start; end < n; end++) {
      running = (running * (nums[end] % k)) % k
      values.push({ end, remainder: running })
    }
    return values
  }
  const push = (phase, codeKey, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(codeKey), pythonLine: PY(pyKey), message,
    nums: [...nums], tree: Object.keys(prod).map(Number).sort((a, b) => a - b).map(id => ({ id, lo: bounds[id][0], hi: bounds[id][1], prod: prod[id], cnt: [...cnt[id]] })),
    node: extra.node ?? -1, children: extra.children ?? [], path: extra.path ?? [], skipped: extra.skipped ?? [], covered: [...covered],
    shift: extra.shift ?? null, query, queryIndex, total: total ? [...total] : null, carry, answers: [...answers],
    ends: query ? endProducts(query[2]).filter(entry => entry.end <= revealedThrough) : [],
    changed: extra.changed ?? -1,
  })

  const setLeaf = (node, value) => {
    prod[node] = value % k
    cnt[node] = Array(k).fill(0)
    cnt[node][value % k] = 1
  }
  const merge = (node, phase, path = []) => {
    const left = 2 * node
    const right = left + 1
    const base = [...cnt[left]]
    const incoming = [...cnt[right]]
    prod[node] = (prod[left] * prod[right]) % k
    const merged = [...base]
    const targets = []
    for (let r = 0; r < k; r++) {
      const target = (prod[left] * r) % k
      targets.push(target)
      merged[target] += incoming[r]
    }
    cnt[node] = merged
    const [lo, hi] = bounds[node]
    push(phase, 'to merge', 'prod[node] = prod[left] * prod[right]', `Node [${lo}, ${hi}]: left product is ${prod[left]}, so each right prefix remainder r moves to ${prod[left]} × r mod ${k}. New product ${prod[left]} × ${prod[right]} mod ${k} = ${prod[node]}.`, {
      node, children: [left, right], path,
      shift: { kind: 'merge', multiplier: prod[left], baseLabel: 'left counts', incomingLabel: 'right counts', base, incoming, targets, result: merged },
    })
  }
  const build = (node, lo, hi) => {
    bounds[node] = [lo, hi]
    if (lo === hi) {
      setLeaf(node, nums[lo])
      push('leaf', 'a leaf holds value', 'cnt[node][value % k] = 1', `Leaf [${lo}]: ${nums[lo]} mod ${k} = ${prod[node]}, one prefix with that remainder.`, { node })
      return
    }
    const mid = (lo + hi) >> 1
    build(2 * node, lo, mid)
    build(2 * node + 1, mid + 1, hi)
    merge(node, 'merge')
  }
  const update = (node, lo, hi, index, value, path) => {
    const here = [...path, node]
    if (lo === hi) {
      setLeaf(node, value)
      push('update', 'overwrite the leaf', '            set_leaf(node, value)', `Leaf [${lo}] now holds ${value}, remainder ${prod[node]}. Nodes above it are stale until re-merged.`, { node, path: here, changed: index })
      return
    }
    const mid = (lo + hi) >> 1
    if (index <= mid) update(2 * node, lo, mid, index, value, here)
    else update(2 * node + 1, mid + 1, hi, index, value, here)
    merge(node, 'update', here)
  }
  const skipped = []
  const absorb = (node, lo, hi, start) => {
    if (hi < start) {
      skipped.push(node)
      push('descend', 'walk the tree', 'return carry', `Node [${lo}, ${hi}] ends before start ${start}. Its elements were removed, so skip it.`, { node, skipped: [...skipped] })
      return
    }
    if (lo >= start) {
      const base = [...total]
      const targets = []
      for (let r = 0; r < k; r++) {
        const target = (carry * r) % k
        targets.push(target)
        total[target] += cnt[node][r]
      }
      const multiplier = carry
      covered = [...covered, node]
      revealedThrough = hi
      push('absorb', 'for a fully covered node', 'total[carry * r % k] += cnt[node][r]', `Node [${lo}, ${hi}] is fully inside. Everything before it multiplies to ${multiplier}, so each of its prefix remainders r becomes ${multiplier} × r mod ${k}.`, {
        node, skipped: [...skipped],
        shift: { kind: 'absorb', multiplier, baseLabel: 'total so far', incomingLabel: `node [${lo}, ${hi}] counts`, base, incoming: [...cnt[node]], targets, result: [...total] },
      })
      carry = (carry * prod[node]) % k
      push('absorb', "then multiply carry", 'return carry * prod[node] % k', `Carry becomes ${multiplier} × ${prod[node]} mod ${k} = ${carry}, ready for the next node.`, { node, skipped: [...skipped] })
      return
    }
    push('descend', 'walk the tree', 'carry = absorb(2 * node', `Node [${lo}, ${hi}] straddles start ${start}, so open both children, left first.`, { node, skipped: [...skipped], children: [2 * node, 2 * node + 1] })
    const mid = (lo + hi) >> 1
    absorb(2 * node, lo, mid, start)
    absorb(2 * node + 1, mid + 1, hi, start)
  }

  push('start', 'count end positions', 'def x_value_queries', `${n} values, modulus k = ${k}, ${queries.length} quer${queries.length === 1 ? 'y' : 'ies'}.`)
  build(1, 0, n - 1)
  queries.forEach((current, position) => {
    const [index, value, start, x] = current
    query = current
    queryIndex = position
    total = null
    carry = null
    revealedThrough = -1
    covered = []
    skipped.length = 0
    push('query', 'for each query', 'for index, value, start, x in queries', `Query ${position}: set nums[${index}] = ${value}, then count ends from start ${start} with remainder ${x}.`)
    nums[index] = value
    update(1, 0, n - 1, index, value, [])
    total = Array(k).fill(0)
    carry = 1
    push('descend', 'start with total', 'total = [0] * k', 'No element has been absorbed yet: every count is 0 and the running product is 1.')
    absorb(1, 0, n - 1, start)
    answers.push(total[x])
    push('answer', 'the answer is total', 'answers.append(total[x])', `total[${x}] = ${total[x]}: that many end positions give remainder ${x}.`)
  })
  query = null
  queryIndex = -1
  total = null
  carry = null
  covered = []
  push('done', 'return the answers', 'return answers', `Answers: [${answers.join(', ')}].`)
  return { input: { nums: original, k, queries }, result: answers, frames }
}
