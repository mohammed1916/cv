export const code = [
  'find the most queries that can be processed, choosing the subsequence and the removals',
  '  let n be the length of nums',
  '  set states to {front -1 : back n}, meaning nothing removed yet',
  '  set processed to 0',
  '  for each query q in order',
  '    let next be an empty map from front index to best back index',
  '    for each state (x, y) in states',
  '      find the first index i with x < i < y and nums[i] at least q',
  '      if found then set next[i] to the larger of next[i] and y',
  '      find the last index j with x < j < y and nums[j] at least q',
  '      if found then set next[x] to the larger of next[x] and j',
  '    if next is empty then stop',
  '    set states to next and add one to processed',
  '  return processed',
].map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_removal_queries(nums, queries):
    n = len(nums)
    states = {-1: n}
    processed = 0
    for q in queries:
        nxt = {}
        for x, y in states.items():
            for i in range(x + 1, y):
                if nums[i] >= q:
                    nxt[i] = max(nxt.get(i, -1), y)
                    break
            for j in range(y - 1, x, -1):
                if nums[j] >= q:
                    nxt[x] = max(nxt.get(x, -1), j)
                    break
        if not nxt:
            break
        states = nxt
        processed += 1
    return processed
`
const PY = python.split('\n')
const P = s => {
  const index = PY.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('nums has 1 to 8 integers.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries has 1 to 8 integers.')
  for (const v of [...nums, ...queries]) {
    if (!Number.isInteger(v) || v < 1 || v > 9) throw new Error('Every value is an integer from 1 to 9.')
  }
  return { nums, queries }
}

export function buildTrace({ nums, queries }) {
  const n = nums.length
  const frames = []
  let states = new Map([[-1, n]])
  let processed = 0
  const list = map => [...map.entries()].map(([x, y]) => [x, y])
  const push = (phase, extra, activeText, pyText, message) => {
    frames.push({
      phase, query: -1, q: null, states: list(states), next: [], from: null, to: null, processed,
      ...extra, message,
      activeLine: L(activeText), pythonLine: P(pyText),
    })
  }

  push('start', {}, 'set states to', 'states = {-1: n}', `Nothing is removed yet. The front pointer sits before index 0 and the back pointer after index ${n - 1}.`)

  for (let k = 0; k < queries.length; k++) {
    const q = queries[k]
    const next = new Map()
    push('query', { query: k, q }, 'for each query q in order', 'for q in queries', `Query ${k + 1} needs a removed value of at least ${q}.`)
    for (const [x, y] of states) {
      let found = -1
      for (let i = x + 1; i < y; i++) {
        if (nums[i] >= q) { found = i; break }
      }
      if (found >= 0) {
        next.set(found, Math.max(next.get(found) ?? -1, y))
        push('front', { query: k, q, next: list(next), from: [x, y], to: [found, y] }, 'find the first index i', 'for i in range(x + 1, y)',
          `Remove index ${found} (value ${nums[found]}) from the front of the window (${x}, ${y}).`)
      }
      let last = -1
      for (let j = y - 1; j > x; j--) {
        if (nums[j] >= q) { last = j; break }
      }
      if (last >= 0) {
        next.set(x, Math.max(next.get(x) ?? -1, last))
        push('back', { query: k, q, next: list(next), from: [x, y], to: [x, last] }, 'find the last index j', 'for j in range(y - 1, x, -1)',
          `Remove index ${last} (value ${nums[last]}) from the back of the window (${x}, ${y}).`)
      }
    }
    if (next.size === 0) {
      push('stop', { query: k, q }, 'if next is empty then stop', 'if not nxt', `Query ${k + 1} cannot be processed from either end, so processing stops.`)
      break
    }
    states = next
    processed += 1
    push('advance', { query: k, q, next: list(next) }, 'set states to next', 'states = nxt',
      `Query ${k + 1} is processed. ${processed} processed so far.`)
  }

  frames.push({
    phase: 'done', query: -1, q: null, states: list(states), next: [], from: null, to: null, processed,
    message: `${processed} of ${queries.length} queries can be processed.`,
    activeLine: L('return processed'), pythonLine: P('return processed'),
  })
  return { input: { nums, queries }, result: processed, frames }
}
