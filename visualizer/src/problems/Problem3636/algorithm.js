const MAX_NUMS = 32
const MAX_QUERIES = 8

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_NUMS) throw new Error(`nums has 1 to ${MAX_NUMS} entries here.`)
  for (const value of nums) {
    if (!Number.isInteger(value) || value < 1 || value > 1e9) throw new Error('Each number is an integer from 1 to 1000000000.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > MAX_QUERIES) throw new Error(`queries has 1 to ${MAX_QUERIES} entries here.`)
  for (const query of queries) {
    if (!Array.isArray(query) || query.length !== 3 || !query.every(Number.isInteger)) throw new Error('Each query is [l, r, threshold].')
    const [l, r, threshold] = query
    if (l < 0 || l > r || r >= nums.length) throw new Error(`Query [${query}] needs 0 <= l <= r < ${nums.length}.`)
    if (threshold < 1 || threshold > r - l + 1) throw new Error(`Query [${query}] needs a threshold from 1 to ${r - l + 1}.`)
  }
  return { nums, queries }
}

export const code = `answer range-mode queries offline, adding and rolling back
  cut nums into blocks of about sqrt(n) entries
  sort queries by the block of l, then by r
  for each query in that order
    on entering a new block, empty the counts and start right before the next block
    while right is short of r, add nums[right] for good
    save the current mode
    add the entries from the block boundary leftward to l, for now
    if the mode occurs at least threshold times, it is the answer
    undo those leftward additions and restore the saved mode
  return the answers in the original query order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Pseudocode line missing: ${key}`)
  return index + 1
}

export const python = `from collections import Counter
from math import isqrt

def threshold_majority(nums, queries):
    size = isqrt(len(nums))
    order = sorted(range(len(queries)), key=lambda i: (queries[i][0] // size, queries[i][1]))
    ans = [-1] * len(queries)
    count = Counter()
    current = -1

    def add(value, mode, mode_count):
        count[value] += 1
        if count[value] > mode_count or (count[value] == mode_count and value < mode):
            return value, count[value]
        return mode, mode_count

    for i in order:
        l, r, threshold = queries[i]
        block = l // size
        if block != current:
            current = block
            boundary = (block + 1) * size
            count.clear()
            right = boundary - 1
            mode, mode_count = 0, 0
        while right < r:
            right += 1
            mode, mode_count = add(nums[right], mode, mode_count)
        saved = mode, mode_count
        for j in range(min(r, boundary - 1), l - 1, -1):
            mode, mode_count = add(nums[j], mode, mode_count)
        if mode_count >= threshold:
            ans[i] = mode
        for j in range(l, min(r, boundary - 1) + 1):
            count[nums[j]] -= 1
        mode, mode_count = saved
    return ans
`
const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'plan', label: 'Plan', description: 'Choose the block size and the query order.' },
  { id: 'block', label: 'New block', description: 'Empty the counts for a new block.' },
  { id: 'extend', label: 'Extend right', description: 'Permanent additions; right only moves forward in a block.' },
  { id: 'save', label: 'Save', description: 'Remember the mode before temporary work.' },
  { id: 'temporary', label: 'Reach left', description: 'Temporary additions from the boundary to l.' },
  { id: 'answer', label: 'Answer', description: 'Compare the mode count with the threshold.' },
  { id: 'rollback', label: 'Roll back', description: 'Undo the temporary additions and restore the mode.' },
  { id: 'done', label: 'Result', description: 'Report answers in the original order.' },
]

export const inputLabel = 'Object with nums and queries, each query [l, r, threshold]'
export const complexity = 'O((n + q) · √n) count updates after sorting the queries: within a block right only moves forward, and each query reaches left by at most one block. Space is O(n). The input box takes up to 32 numbers and 8 queries; the Python handles the full limits.'
export const examples = [
  { label: 'All three kinds of query', input: '{"nums":[4,7,4,9,7,7,4,2,2,7],"queries":[[0,5,3],[3,9,4],[2,3,1],[6,8,2],[1,2,2]]}' },
  { label: 'Tie goes to the smaller', input: '{"nums":[8,3,8,3],"queries":[[0,3,2],[0,3,3]]}' },
  { label: 'One number', input: '{"nums":[5],"queries":[[0,0,1]]}' },
  { label: 'One number, one query', input: '{"nums":[7],"queries":[[0,0,1]]}' },
  { label: 'Equal values in one window', input: '{"nums":[4,4,4,4],"queries":[[0,3,2]]}' },
  { label: 'Largest value and full window', input: '{"nums":[1000000000,1],"queries":[[0,1,2]]}' },
  { label: 'Long run: 32 numbers, 8 queries', input: '{"nums":[10824805,1299514,7026500,4351563,10995630,5008339,9971963,12955445,3288389,7793354,9113097,11989248,8074699,11643254,3398321,3975968,9671206,9730920,607607,16431689,5320568,16565109,6146848,16485488,14605096,11585458,2290351,11703496,1320663,11421042,14602600,786373],"queries":[[10,13,3],[27,31,2],[7,8,1],[13,23,8],[6,12,2],[30,31,1],[9,9,1],[22,22,1]]}' },
]

export function buildTrace({ nums, queries }) {
  const size = Math.floor(Math.sqrt(nums.length))
  const order = queries.map((_, index) => index).sort((a, b) =>
    Math.floor(queries[a][0] / size) - Math.floor(queries[b][0] / size) || queries[a][1] - queries[b][1] || a - b)
  const values = [...new Set(nums)].sort((a, b) => a - b)
  const ans = queries.map(() => -1)
  const count = new Map()
  let current = -1
  let boundary = 0
  let right = -1
  let mode = 0
  let modeCount = 0
  let query = null
  let position = -1
  const add = value => {
    const next = (count.get(value) || 0) + 1
    count.set(value, next)
    const previous = { mode, modeCount }
    const wins = next > modeCount
    const ties = next === modeCount && value < mode
    if (wins || ties) { mode = value; modeCount = next }
    if (wins) return `${value} now occurs ${next} time${next === 1 ? '' : 's'}, the most so far, so it is the mode.`
    if (ties) return `${value} ties ${previous.mode} at ${next} and is smaller, so it takes over as the mode.`
    return `${value} now occurs ${next} time${next === 1 ? '' : 's'}; ${mode} stays the mode with ${modeCount}.`
  }
  const frames = []
  const push = (phase, key, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(key), pythonLine: P(pyKey), message,
    query, position, block: current, boundary, right, l: query?.l ?? null, r: query?.r ?? null, threshold: query?.threshold ?? null,
    counts: Object.fromEntries(count), mode, modeCount, ans: [...ans], at: null, tempFrom: null, tempTo: null, saved: null, ...extra,
  })

  push('plan', 'cut nums', 'size = isqrt', `n = ${nums.length}, so each block holds ${size} entr${size === 1 ? 'y' : 'ies'}.`)
  push('plan', 'sort queries', 'order = sorted', `Order the queries as ${order.map(i => `#${i}`).join(', ')}: same block together, r rising, so right never has to move back.`)

  order.forEach((index, place) => {
    const [l, r, threshold] = queries[index]
    position = place
    query = { index, l, r, threshold }
    const block = Math.floor(l / size)
    if (block !== current) {
      current = block
      boundary = (block + 1) * size
      count.clear()
      right = boundary - 1
      mode = 0
      modeCount = 0
      push('block', 'on entering a new block', 'count.clear', `Query #${index} starts in block ${block}. Empty the counts; permanent additions will start at index ${boundary}.`)
    }
    while (right < r) {
      right += 1
      const note = add(nums[right])
      push('extend', 'while right is short', 'add(nums[right]', `Index ${right}, for good: ${note}`, { at: right })
    }
    const saved = { mode, modeCount }
    const top = Math.min(r, boundary - 1)
    push('save', 'save the current', 'saved = mode', modeCount
      ? `Before reaching left, remember mode ${mode} with count ${modeCount}.`
      : `No permanent entries are needed for query #${index}; the saved mode is empty.`, { saved })
    for (let j = top; j >= l; j--) {
      const note = add(nums[j])
      push('temporary', 'add the entries from', 'add(nums[j]', `Index ${j}, for now: ${note}`, { at: j, tempFrom: j, tempTo: top, saved })
    }
    const met = modeCount >= threshold
    if (met) ans[index] = mode
    push('answer', 'if the mode occurs', met ? 'ans[i] = mode' : 'if mode_count >= threshold', met
      ? `Mode ${mode} occurs ${modeCount} times and the threshold is ${threshold}, so query #${index} answers ${mode}.`
      : `Even the most frequent value occurs only ${modeCount} time${modeCount === 1 ? '' : 's'}, below the threshold ${threshold}, so query #${index} answers -1.`,
    { tempFrom: l, tempTo: top, saved })
    for (let j = l; j <= top; j++) count.set(nums[j], count.get(nums[j]) - 1)
    push('rollback', 'undo those', 'count[nums[j]] -= 1', top >= l
      ? `Take back indices ${l} to ${top}. A count can be undone cheaply, but the old mode cannot be worked out again from the counts.`
      : 'Nothing was added on the left, so no counts change.', { saved })
    mode = saved.mode
    modeCount = saved.modeCount
    push('rollback', 'undo those', 'mode, mode_count = saved', modeCount
      ? `Restore the saved mode ${mode} with count ${modeCount}.`
      : 'Restore the empty mode.', { saved })
  })

  query = null
  position = order.length
  push('done', 'return the answers', 'return ans', `Answers in the original order: [${ans.join(', ')}].`)
  return { input: { nums, queries }, result: ans, frames, order, size, values }
}
