import { queryChain, updateChain } from '../../components/shared/fenwickModel.js'

export const phases = [
  { id: 'start', label: 'Start', description: 'Six empty Fenwick trees, one per possible depth.' },
  { id: 'depth', label: 'Depth', description: 'Follow value, popcount, popcount, ... down to 1.' },
  { id: 'build', label: 'Build', description: 'Record this position in the tree of its depth.' },
  { id: 'query', label: 'Query', description: 'A count over a range for one depth.' },
  { id: 'prefix', label: 'Prefix', description: 'Read a prefix count from the tree of depth k.' },
  { id: 'answer', label: 'Answer', description: 'Subtract the two prefix counts.' },
  { id: 'update', label: 'Update', description: 'A new value may belong to a different tree.' },
  { id: 'remove', label: 'Remove', description: 'Take the position out of the tree of its old depth.' },
  { id: 'add', label: 'Add', description: 'Put the position in the tree of its new depth.' },
  { id: 'done', label: 'Result', description: 'Return the answers in order.' },
]

const MAX_N = 12
const MAX_Q = 8
const MAX_VALUE = 1e15
const TREES = 6

const popcount = x => x.toString(2).split('').filter(bit => bit === '1').length

/** The chain value → popcount → ... → 1. Its length minus one is the depth. Doubles hold values up to 1e15 exactly. */
export function depthChain(x) {
  const chain = [x]
  while (chain.at(-1) !== 1) chain.push(popcount(chain.at(-1)))
  return chain
}

const isValue = v => Number.isSafeInteger(v) && v >= 1 && v <= MAX_VALUE

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_N) throw new Error(`nums has 1 to ${MAX_N} entries here.`)
  if (!nums.every(isValue)) throw new Error('Each value is an integer from 1 to 10^15.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > MAX_Q) throw new Error(`queries has 1 to ${MAX_Q} entries here.`)
  const inRange = i => Number.isInteger(i) && i >= 0 && i < nums.length
  for (const q of queries) {
    if (!Array.isArray(q)) throw new Error('Each query is [1, l, r, k] or [2, idx, val].')
    if (q[0] === 1) {
      if (q.length !== 4 || !inRange(q[1]) || !inRange(q[2]) || q[1] > q[2]) throw new Error('A count query is [1, l, r, k] with l <= r inside the array.')
      if (!Number.isInteger(q[3]) || q[3] < 0 || q[3] > 5) throw new Error('k is from 0 to 5.')
    } else if (q[0] === 2) {
      if (q.length !== 3 || !inRange(q[1]) || !isValue(q[2])) throw new Error('An update is [2, idx, val] with val from 1 to 10^15.')
    } else throw new Error('Each query is [1, l, r, k] or [2, idx, val].')
  }
  return { nums, queries }
}

export const code = `range counts by popcount-depth, with point updates
  keep one Fenwick tree for each depth 0 to 5
  for each value, find its depth and add its position to that tree
  for each query in order
    if it asks to count depth k in l..r
      answer = prefix of tree k up to r minus prefix up to l - 1
    if it updates position idx to val
      find the depth of val
      remove idx from the tree of its old depth
      add idx to the tree of the new depth
      store val and its depth
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def popcount_depth(x):
    depth = 0
    while x != 1:
        x = bin(x).count("1")
        depth += 1
    return depth

def answer_queries(nums, queries):
    n = len(nums)
    trees = [[0] * (n + 1) for _ in range(6)]

    def add(tree, i, delta):
        i += 1
        while i <= n:
            tree[i] += delta
            i += i & -i

    def prefix(tree, i):
        total = 0
        while i > 0:
            total += tree[i]
            i -= i & -i
        return total

    depths = [popcount_depth(x) for x in nums]
    for i, d in enumerate(depths):
        add(trees[d], i, 1)
    answer = []
    for q in queries:
        if q[0] == 1:
            _, l, r, k = q
            upper = prefix(trees[k], r + 1)
            lower = prefix(trees[k], l)
            answer.append(upper - lower)
        else:
            _, idx, val = q
            new_depth = popcount_depth(val)
            add(trees[depths[idx]], idx, -1)
            add(trees[new_depth], idx, 1)
            depths[idx] = new_depth
            nums[idx] = val
    return answer
`

export function buildTrace({ nums: original, queries }) {
  const nums = original.slice()
  const n = nums.length
  const trees = Array.from({ length: TREES }, () => Array(n).fill(0))
  const depths = Array(n).fill(null)
  const answers = []
  const log = queries.map(q => (q[0] === 1
    ? { name: 'count', args: [q[1], q[2], q[3]] }
    : { name: 'update', args: [q[1], q[2]] }))
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, nums: nums.slice(), depths: depths.slice(), trees: trees.map(t => t.slice()),
    activeTree: null, ops: [], chain: null, chainAt: -1, focus: -1, range: null, k: null,
    prefixes: null, answers: answers.slice(), queryIndex: -1, log: log.map(op => ({ ...op })), ...extra,
  })
  const add = (tree, position, delta) => {
    const chain = updateChain(position + 1, n)
    chain.forEach(cell => { trees[tree][cell - 1] += delta })
    return { type: 'update', index: position + 1, value: delta, chain }
  }
  const read = (tree, count) => {
    const chain = queryChain(count)
    const parts = chain.map(cell => ({ cell, value: trees[tree][cell - 1] }))
    const total = parts.reduce((sum, part) => sum + part.value, 0)
    return { type: 'query', index: count, chain, parts, total }
  }

  push('start', L('keep one Fenwick'), 10, 'Depth never goes above 5 for values this small, so six trees cover every case. Each tree counts positions holding one depth.')
  for (let i = 0; i < n; i++) {
    const chain = depthChain(nums[i])
    depths[i] = chain.length - 1
    push('depth', L('for each value'), 25, `${nums[i]} reaches 1 after ${depths[i]} popcount ${depths[i] === 1 ? 'step' : 'steps'}, so its depth is ${depths[i]}.`, { chain, focus: i, chainAt: i })
  }
  for (let i = 0; i < n; i++) {
    const d = depths[i]
    const op = add(d, i, 1)
    push('build', L('for each value'), 27, `Position ${i} has depth ${d}, so add 1 to tree ${d} at every cell covering position ${i + 1}.`, { activeTree: d, ops: [op], focus: i })
  }
  queries.forEach((q, qi) => {
    if (q[0] === 1) {
      const [, l, r, k] = q
      const scope = { range: [l, r], k, queryIndex: qi, activeTree: k }
      push('query', L('if it asks'), 31, `Count depth ${k} in positions ${l} to ${r}. Only tree ${k} is needed.`, scope)
      const upper = read(k, r + 1)
      push('prefix', L('answer = prefix'), 32, `Tree ${k} says ${upper.total} of the first ${r + 1} positions have depth ${k}.`, { ...scope, ops: [upper], prefixes: { upper: upper.total, lower: null } })
      const lower = read(k, l)
      push('prefix', L('answer = prefix'), 33, l === 0
        ? 'The range starts at position 0, so nothing lies before it and this prefix is empty.'
        : `Tree ${k} says ${lower.total} of the first ${l} positions have depth ${k}. These lie before the range.`, { ...scope, ops: [lower], prefixes: { upper: upper.total, lower: lower.total } })
      const value = upper.total - lower.total
      answers.push(value)
      log[qi].returned = value
      push('answer', L('answer = prefix'), 34, `${upper.total} − ${lower.total} = ${value} positions in ${l}..${r} have depth ${k}.`, { ...scope, prefixes: { upper: upper.total, lower: lower.total } })
    } else {
      const [, idx, val] = q
      const chain = depthChain(val)
      const next = chain.length - 1
      const old = depths[idx]
      push('update', L('find the depth of val'), 37, `Position ${idx} becomes ${val}, whose depth is ${next}.`, { chain, chainAt: idx, focus: idx, queryIndex: qi })
      const removed = add(old, idx, -1)
      depths[idx] = null
      push('remove', L('remove idx'), 38, `Position ${idx} leaves tree ${old}: subtract 1 at every cell covering it.`, { activeTree: old, ops: [removed], focus: idx, queryIndex: qi })
      const added = add(next, idx, 1)
      push('add', L('add idx'), 39, old === next
        ? `The depth is unchanged, so position ${idx} goes straight back into tree ${next}.`
        : `Position ${idx} joins tree ${next}: add 1 at every cell covering it.`, { activeTree: next, ops: [added], focus: idx, queryIndex: qi })
      depths[idx] = next
      nums[idx] = val
      push('add', L('store val'), 40, `Store ${val} and depth ${next} at position ${idx}.`, { activeTree: next, focus: idx, queryIndex: qi })
    }
  })
  push('done', L('return the answers'), 42, answers.length
    ? `Return ${JSON.stringify(answers)}, one answer per count query.`
    : 'There were no count queries, so the answer list is empty.')
  return { input: { nums: original, queries }, result: answers, frames }
}
