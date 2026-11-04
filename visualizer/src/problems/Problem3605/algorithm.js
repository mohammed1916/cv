const MAX_N = 14

export const phases = [
  { id: 'build', label: 'Build', description: 'Fill the gcd table for spans of 1, 2, 4, 8 values.' },
  { id: 'probe', label: 'Probe', description: 'Try a limit halfway through the search range.' },
  { id: 'window', label: 'Window', description: 'Read the gcd of the next window from two table cells.' },
  { id: 'edit', label: 'Edit', description: 'The window is stable: replace its last value with 1.' },
  { id: 'slide', label: 'Slide', description: 'The window is not stable: move right by one.' },
  { id: 'verdict', label: 'Verdict', description: 'Compare the edits needed with maxC.' },
  { id: 'done', label: 'Result', description: 'The range has closed on the smallest limit.' },
]

export const gcd = (a, b) => {
  while (b) [a, b] = [b, a % b]
  return a
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and maxC.')
  const { nums, maxC } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_N) throw new Error(`nums has 1 to ${MAX_N} entries.`)
  for (const value of nums) if (!Number.isInteger(value) || value < 1 || value > 1e9) throw new Error('Each entry of nums is an integer from 1 to 1000000000.')
  if (!Number.isInteger(maxC) || maxC < 0 || maxC > nums.length) throw new Error('maxC is an integer from 0 to the length of nums.')
  return { nums, maxC }
}

// The positions a left-to-right greedy edits so no window of limit + 1 values stays stable.
export function greedyEdits(nums, limit) {
  const edits = []
  let l = 0
  while (l + limit < nums.length) {
    let g = 0
    for (let i = l; i <= l + limit; i++) g = gcd(g, nums[i])
    if (g >= 2) {
      edits.push(l + limit)
      l += limit + 1
    } else l += 1
  }
  return edits
}

export function buildTrace({ nums, maxC }) {
  const n = nums.length
  const frames = []
  const table = [[...nums]]
  let lo = 0
  let hi = n
  const copyTable = () => table.map(row => [...row])
  const base = () => ({
    table: copyTable(), tableFocus: null, lo, hi, mid: null, verdict: null,
    l: -1, r: -1, query: null, edits: 0, edited: [], witness: null, outcome: null,
  })
  const push = (phase, pseudo, py, message, extra = {}) => frames.push({ phase, activeLine: L(pseudo), pythonLine: P(py), message, ...base(), ...extra })

  push('build', 'build a gcd table', 'table = [nums[:]]', 'The first row of the table is nums itself: each value is the gcd of a span of one.', { tableFocus: { level: 0, i: -1, from: [] } })
  for (let level = 1; 1 << level <= n; level++) {
    const size = 1 << level
    const half = size >> 1
    const row = []
    table.push(row)
    for (let i = 0; i + size <= n; i++) {
      const a = table[level - 1][i]
      const b = table[level - 1][i + half]
      row.push(gcd(a, b))
      push('build', 'build a gcd table', 'table.append([gcd(prev[i], prev[i + half]) for i in range(n - size + 1)])',
        `The span of ${size} from index ${i} joins two spans of ${half}: gcd(${a}, ${b}) = ${row[i]}.`,
        { tableFocus: { level, i, from: [[level - 1, i], [level - 1, i + half]] } })
    }
  }

  while (lo < hi) {
    const mid = (lo + hi) >> 1
    const state = { mid }
    push('probe', 'try limit = the middle', 'mid = (lo + hi) // 2', `Can every stable stretch be held to length ${mid} or less? Then every window of ${mid + 1} must be unstable.`, state)
    let edits = 0
    const edited = []
    let l = 0
    while (l + mid < n) {
      const r = l + mid
      const p = 31 - Math.clz32(r - l + 1)
      const a = l
      const b = r - (1 << p) + 1
      const g = gcd(table[p][a], table[p][b])
      const here = () => ({ ...state, l, r, edits, edited: [...edited], query: { p, a, b, left: table[p][a], right: table[p][b], g } })
      push('window', 'read its gcd from two', 'return gcd(table[p][l], table[p][r - (1 << p) + 1])', `Window [${l}..${r}] is covered by two spans of ${1 << p}: gcd(${table[p][a]}, ${table[p][b]}) = ${g}.`, here())
      if (g >= 2) {
        edits += 1
        edited.push(r)
        push('edit', 'if it is stable, replace', 'edits += 1', `gcd ${g} is at least 2, so this window must lose a value. Replacing its last value, index ${r}, also breaks every later window through it. Edits: ${edits}.`, here())
        l = r + 1
      } else {
        push('slide', 'otherwise move right by one', 'l += 1', `gcd is 1, so this window is already fine. Slide right by one.`, here())
        l += 1
      }
    }
    const ok = edits <= maxC
    const verdictState = { ...state, verdict: ok, edits, edited: [...edited] }
    if (ok) {
      push('verdict', 'if the edits fit in maxC', 'if edits_needed(mid) <= maxC:', `${edits} edit${edits === 1 ? '' : 's'} fit within maxC = ${maxC}. Limit ${mid} works; try smaller.`, verdictState)
      hi = mid
    } else {
      push('verdict', 'if the edits fit in maxC', 'if edits_needed(mid) <= maxC:', `${edits} edits exceed maxC = ${maxC}. Limit ${mid} is impossible; try larger.`, verdictState)
      lo = mid + 1
    }
  }
  const witness = greedyEdits(nums, lo)
  push('done', 'return the limit', 'return lo', `The smallest workable limit is ${lo}.${witness.length ? ` One way: replace ${witness.map(i => `index ${i}`).join(', ')} with 1.` : ''}`, { edited: witness, edits: witness.length, witness })
  return { input: { nums, maxC }, result: lo, frames }
}

export const code = `smallest possible longest stable subarray
  build a gcd table for spans of 1, 2, 4, 8 values
  search limits lo = 0 to hi = n
  while lo < hi
    try limit = the middle of the range
    for windows of limit + 1 values, from the left
      read its gcd from two overlapping table cells
      if it is stable, replace its last value and jump past it
      otherwise move right by one
    if the edits fit in maxC then hi = limit, else lo = limit + 1
  return the limit lo`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `from math import gcd


def min_stable(nums, maxC):
    n = len(nums)
    table = [nums[:]]
    size = 2
    while size <= n:
        prev = table[-1]
        half = size // 2
        table.append([gcd(prev[i], prev[i + half]) for i in range(n - size + 1)])
        size *= 2

    def range_gcd(l, r):
        p = (r - l + 1).bit_length() - 1
        return gcd(table[p][l], table[p][r - (1 << p) + 1])

    def edits_needed(limit):
        edits = 0
        l = 0
        while l + limit < n:
            r = l + limit
            if range_gcd(l, r) >= 2:
                edits += 1
                l = r + 1
            else:
                l += 1
        return edits

    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi) // 2
        if edits_needed(mid) <= maxC:
            hi = mid
        else:
            lo = mid + 1
    return lo
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
