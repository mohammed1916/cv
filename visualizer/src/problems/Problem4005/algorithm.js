const MAX_LENGTH = 12
const MAX_VALUE = 1_000_000_000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1) throw new Error('nums needs at least one entry.')
  if (nums.length > MAX_LENGTH) throw new Error(`This visualization handles up to ${MAX_LENGTH} entries; the task allows 100000.`)
  for (const x of nums) if (!Number.isInteger(x) || x < 1 || x > MAX_VALUE) throw new Error('Each entry is an integer from 1 to 1000000000.')
  return { nums }
}

export const phases = [
  { id: 'count', label: 'Count', description: 'Count how many times each distinct value appears.' },
  { id: 'tally', label: 'Tally', description: 'Use each value\'s divisors to count the elements one operation away.' },
  { id: 'fallback', label: 'Baseline', description: 'A common multiple is reachable by every element in one operation.' },
  { id: 'exclude', label: 'Exclude 1', description: 'Nothing can be divided down to 1, so 1 only works if all elements are 1.' },
  { id: 'candidate', label: 'Candidate', description: 'Price one value from the array as the common target.' },
  { id: 'plan', label: 'Plan', description: 'Write out the operations for the winning target.' },
  { id: 'done', label: 'Result', description: 'Return the fewest operations.' },
]

export const code = `fewest operations to make all elements equal
  count how often each distinct value appears
  for each distinct value x and each divisor d of x
    if d is also in nums, x is above d and d is below x
  a common multiple of everything costs one per element: best = n
  for each distinct value v with count c
    1 cannot be reached by dividing, so skip it unless every element is 1
    related = elements that divide v or that v divides
    cost = related others at 1 each + unrelated at 2 each = 2n - related - c
    keep the smallest cost in best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import Counter
from math import isqrt


def divisors(x):
    found = []
    for d in range(1, isqrt(x) + 1):
        if x % d == 0:
            found.append(d)
            if d != x // d:
                found.append(x // d)
    return found


def min_operations(nums):
    n = len(nums)
    freq = Counter(nums)
    above = Counter()
    below = Counter()
    for x, count in freq.items():
        for d in divisors(x):
            if d in freq:
                above[d] += count
                below[x] += freq[d]
    best = n
    for v, c in freq.items():
        if v == 1 and c < n:
            continue
        related = above[v] + below[v] - c
        cost = 2 * n - related - c
        best = min(best, cost)
    return best
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}
const pyLines = python.trim().split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

function divisorsOf(x) {
  const small = [], large = []
  for (let d = 1; d * d <= x; d++) {
    if (x % d === 0) {
      small.push(d)
      if (d !== x / d) large.push(x / d)
    }
  }
  return [...small, ...large.reverse()]
}

const gcdBig = (a, b) => { while (b) [a, b] = [b, a % b]; return a }
const lcmBig = (a, b) => a / gcdBig(a, b) * b

// The operations that take x to target, at most two. Values are strings because a common multiple can be huge.
export function planFor(x, target) {
  const a = BigInt(x), t = BigInt(target)
  if (a === t) return []
  const op = (kind, value, k, next) => ({ kind, k: String(k), from: String(value), to: String(next) })
  if (t % a === 0n) return [op('×', a, t / a, t)]
  if (a % t === 0n) return [op('÷', a, a / t, t)]
  const g = gcdBig(a, t)
  if (g >= 2n) return [op('÷', a, a / g, g), op('×', g, t / g, t)]
  return [op('×', a, t, a * t), op('÷', a * t, a, t)]
}

export function costBetween(x, v) {
  if (x === v) return 0
  return x % v === 0 || v % x === 0 ? 1 : 2
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  const freq = new Map()
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1)
  const distinct = [...freq.keys()].sort((a, b) => a - b)
  const above = new Map(distinct.map(v => [v, 0]))
  const below = new Map(distinct.map(v => [v, 0]))
  const lcm = String(nums.reduce((acc, x) => lcmBig(acc, BigInt(x)), 1n))
  const rows = []
  let best = n
  let target = lcm
  let targetLabel = 'common multiple'
  const tallies = () => distinct.map(v => ({ value: v, count: freq.get(v), 'divides (above)': above.get(v), 'divided by (below)': below.get(v) }))
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, distinct, freq: distinct.map(v => freq.get(v)), tally: tallies(), rows: rows.map(r => ({ ...r })),
    best, target, targetLabel, commonMultiple: lcm, multipleTotal: n - (freq.get(Number(lcm)) ?? 0), currentX: null, divisors: null, divisorTotal: 0, hits: [], focus: null, activeRow: -1,
    plan: null, planIndex: -1, values: nums.map(String), ...extra,
  })

  push('count', L('count how often'), P('freq = Counter'), `${n} element${n === 1 ? '' : 's'} hold ${distinct.length} distinct value${distinct.length === 1 ? '' : 's'}: ${distinct.map(v => `${v} (×${freq.get(v)})`).join(', ')}.`)

  for (const x of distinct) {
    const all = divisorsOf(x)
    const hits = all.filter(d => freq.has(d))
    for (const d of hits) {
      above.set(d, above.get(d) + freq.get(x))
      below.set(x, below.get(x) + freq.get(d))
    }
    push('tally', L('if d is also in nums'), P('if d in freq'),
      `${x} has ${all.length} divisor${all.length === 1 ? '' : 's'}; ${hits.join(', ')} ${hits.length === 1 ? 'is' : 'are'} also in nums. Each such pair is one operation apart.`,
      { currentX: x, divisors: all.slice(0, 40), divisorTotal: all.length, hits })
  }

  push('fallback', L('a common multiple'), P('best = n'), `Multiplying every element up to a common multiple such as ${lcm.length > 16 ? 'their least common multiple' : lcm} costs at most one each, so best starts at ${n}.`)

  for (const v of distinct) {
    const c = freq.get(v)
    if (v === 1 && c < n) {
      rows.push({ v, costs: distinct.map(() => null), total: null, excluded: true })
      push('exclude', L('1 cannot be reached'), P('continue'), `Target 1 is out: a division needs k smaller than the element, so no element above 1 can ever reach 1.`, { focus: v, activeRow: rows.length - 1 })
      continue
    }
    const related = above.get(v) + below.get(v) - c
    const cost = 2 * n - related - c
    const costs = distinct.map(x => costBetween(x, v))
    rows.push({ v, costs, total: cost, excluded: false, related, c })
    const unrelated = n - related
    const parts = `${c} already equal, ${related - c} one operation away, ${unrelated} two operations away`
    if (cost < best || (cost === best && targetLabel === 'common multiple')) {
      const lower = cost < best
      best = cost
      target = String(v)
      targetLabel = 'value in nums'
      push('candidate', L('keep the smallest'), P('best = min'), `Target ${v}: ${parts}. Cost 2×${n} − ${related} − ${c} = ${cost}. ${lower ? `New best: ${cost}.` : `Ties with best ${cost}, and it is simpler to show.`}`, { focus: v, activeRow: rows.length - 1 })
    } else {
      push('candidate', L('cost = related'), P('cost = 2 * n'), `Target ${v}: ${parts}. Cost 2×${n} − ${related} − ${c} = ${cost}, which does not beat ${best}.`, { focus: v, activeRow: rows.length - 1 })
    }
  }

  const values = nums.map(String)
  const plan = nums.map(x => planFor(x, target))
  const shortTarget = target.length > 16 ? 'the common multiple' : target
  plan.forEach((ops, planIndex) => {
    values[planIndex] = target
    const words = ops.length === 0
      ? `Element ${planIndex} already equals the target.`
      : `Element ${planIndex}: ${ops.map(o => `${abbreviate(o.from)} ${o.kind} ${abbreviate(o.k)} = ${abbreviate(o.to)}`).join(', then ')}.`
    push('plan', L('return best'), P('return best'), `${words} ${ops.length === 2 ? `Neither divides the other, so one step cannot reach ${shortTarget}.` : ''}`.trim(), { plan, planIndex, values: [...values] })
  })
  push('done', L('return best'), P('return best'), `Return ${best}: every element now equals ${abbreviate(target)}, using ${best} operation${best === 1 ? '' : 's'}.`, { plan, planIndex: plan.length, values: [...values] })
  return { input: { nums }, result: best, frames }
}

export function abbreviate(text) {
  const s = String(text)
  return s.length > 14 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s
}
