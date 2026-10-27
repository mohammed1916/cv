import { queryChain, updateChain } from '../../components/shared/fenwickModel.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('nums has 3 to 12 integers from 1 to 20.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('Enter 1 to 8 queries.')
  const n = nums.length
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 3) throw new Error('Each query is [1, l, r] to count peaks or [2, index, value] to set a value.')
    if (q[0] === 1) {
      if (!Number.isInteger(q[1]) || !Number.isInteger(q[2]) || q[1] < 0 || q[2] > n - 1 || q[1] > q[2]) throw new Error('A count query needs 0 <= l <= r < n.')
    } else if (q[0] === 2) {
      if (!Number.isInteger(q[1]) || !Number.isInteger(q[2]) || q[1] < 0 || q[1] > n - 1 || q[2] < 1 || q[2] > 20) throw new Error('An update query needs 0 <= index < n and a value from 1 to 20.')
    } else throw new Error('Query type is 1 (count) or 2 (update).')
  }
  return { nums, queries }
}

export function buildTrace({ nums, queries }) {
  const n = nums.length
  const arr = nums.slice()
  const isPeak = i => i > 0 && i < n - 1 && arr[i] > arr[i - 1] && arr[i] > arr[i + 1]
  const flags = arr.map((_, i) => isPeak(i))
  const cells = Array(n + 1).fill(0)
  let ops = []
  const add = (i, d) => {
    const chain = updateChain(i, n)
    for (const c of chain) cells[c] += d
    ops.push({ type: 'update', index: i, value: d, chain, mode: 'sum' })
  }
  const prefix = p => {
    const chain = queryChain(p)
    const parts = chain.map(c => ({ cell: c, value: cells[c] }))
    const total = parts.reduce((s, x) => s + x.value, 0)
    ops.push({ type: 'query', index: p, chain, parts, total, mode: 'sum' })
    return total
  }
  flags.forEach((f, i) => { if (f) add(i + 1, 1) })
  ops = []
  const answers = []
  const snapshot = (phase, extra) => ({ phase, arr: arr.slice(), flags: flags.slice(), tree: cells.slice(1), ops: ops.slice(), answers: answers.slice(), ...extra })
  const frames = [snapshot('start', { query: null, activeLine: L('set arr to a copy'), message: 'Mark every peak in a Fenwick tree by position.' })]
  for (const [type, a, b] of queries) {
    ops = []
    if (type === 1) {
      const count = a + 1 > b - 1 ? 0 : prefix(b) - prefix(a + 1)
      answers.push(count)
      frames.push(snapshot('count', { query: [type, a, b], activeLine: L('answer is the number'), message: `Peaks strictly between ${a} and ${b}: ${count}.` }))
    } else {
      arr[a] = b
      const touched = []
      for (const i of [a - 1, a, a + 1]) {
        if (i < 0 || i >= n) continue
        const now = isPeak(i)
        if (now !== flags[i]) {
          add(i + 1, now ? 1 : -1)
          flags[i] = now
          touched.push(i)
        }
      }
      frames.push(snapshot('update', { query: [type, a, b], activeLine: L('set arr[index] to val'), message: `nums[${a}] = ${b}; peak status changed at [${touched.join(', ') || 'none'}].` }))
    }
  }
  frames.push(snapshot('done', { query: null, activeLine: L('return answers'), message: `Answers: [${answers.join(', ')}].` }))
  return { input: { nums, queries }, result: answers, frames }
}

export const code = `answer peak counts and value changes in order
  set arr to a copy of nums
  mark each peak position in a Fenwick tree
  set answers to an empty list
  for each query in order
    if the query counts peaks between l and r then
      answer is the number of marked peaks strictly between l and r
      append the answer to answers
    otherwise set arr[index] to val, then re-check the peak status of index - 1, index and index + 1 and update their marks
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_peaks(nums, queries):
    n = len(nums)
    arr = list(nums)
    tree = [0] * (n + 1)

    def add(i, d):
        while i <= n:
            tree[i] += d
            i += i & -i

    def prefix(i):
        total = 0
        while i > 0:
            total += tree[i]
            i -= i & -i
        return total

    def is_peak(i):
        return 0 < i < n - 1 and arr[i] > arr[i - 1] and arr[i] > arr[i + 1]

    flags = [is_peak(i) for i in range(n)]
    for i in range(n):
        if flags[i]:
            add(i + 1, 1)
    answers = []
    for kind, a, b in queries:
        if kind == 1:
            answers.append(0 if b - a < 2 else prefix(b) - prefix(a + 1))
        else:
            arr[a] = b
            for i in (a - 1, a, a + 1):
                if 0 <= i < n and is_peak(i) != flags[i]:
                    flags[i] = is_peak(i)
                    add(i + 1, 1 if flags[i] else -1)
    return answers
`
