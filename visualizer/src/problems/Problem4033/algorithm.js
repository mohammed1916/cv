// Each query asks whether nums[l..r] has exactly k distinct values and every value occurs an even number of times.
// We count the values in the window from scratch for each query, then check two facts about the table.

const MAX_LENGTH = 20
const MAX_QUERIES = 10

const codeLines = [
  'answers is empty',
  'for each query [l, r] in order',
  '  empty the count table',
  '  for each index i from l to r',
  '    add nums[i] to its count',
  '  distinct is the number of values with a count',
  '  all_even is true when every count is even',
  '  append whether distinct equals k and all_even',
  'return answers',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'def valid_k_unique(nums, k, queries):',
  '    answers = []',
  '    for l, r in queries:',
  '        counts = {}',
  '        for i in range(l, r + 1):',
  '            counts[nums[i]] = counts.get(nums[i], 0) + 1',
  '        distinct = len(counts)',
  '        all_even = all(c % 2 == 0 for c in counts.values())',
  '        answers.append(distinct == k and all_even)',
  '    return answers',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, k and queries.')
  const { nums, k, queries } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > MAX_LENGTH) throw new Error(`nums has 2 to ${MAX_LENGTH} values.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > MAX_QUERIES) throw new Error(`queries holds 1 to ${MAX_QUERIES} pairs.`)
  for (const query of queries) {
    if (!Array.isArray(query) || query.length !== 2 || !query.every(Number.isInteger)) throw new Error('Each query is [l, r] with whole numbers.')
    const [l, r] = query
    if (l < 0 || l >= r || r >= nums.length) throw new Error('Each query needs 0 <= l < r < length.')
  }
  return { nums, k, queries }
}

export function buildTrace({ nums, k, queries }) {
  const frames = []
  const answers = []
  const push = frame => frames.push({ ...frame, answers: [...answers] })

  push({ phase: 'start', pythonLine: P('answers = []'), activeLine: L('answers is empty'), query: -1, l: -1, r: -1, at: -1, counts: [], message: `Check ${queries.length} range${queries.length === 1 ? '' : 's'} for exactly ${k} distinct value${k === 1 ? '' : 's'}, each seen an even number of times.` })

  queries.forEach(([l, r], query) => {
    push({ phase: 'query', pythonLine: P('for l, r in queries'), activeLine: L('for each query'), query, l, r, at: -1, counts: [], message: `Query ${query + 1}: the range is index ${l} to index ${r}.` })
    const counts = new Map()
    push({ phase: 'reset', pythonLine: P('counts = {}'), activeLine: L('empty the count table'), query, l, r, at: -1, counts: [], message: 'The count table starts empty for this range.' })
    for (let i = l; i <= r; i++) {
      counts.set(nums[i], (counts.get(nums[i]) || 0) + 1)
      push({ phase: 'add', pythonLine: P('counts[nums[i]]'), activeLine: L('add nums[i]'), query, l, r, at: i, counts: [...counts.entries()], message: `Add ${nums[i]} from index ${i}; it now appears ${counts.get(nums[i])} time${counts.get(nums[i]) === 1 ? '' : 's'}.` })
    }
    const distinct = counts.size
    const allEven = [...counts.values()].every(c => c % 2 === 0)
    const ok = distinct === k && allEven
    push({ phase: 'check', pythonLine: P('distinct = len'), activeLine: L('distinct is the number'), query, l, r, at: -1, counts: [...counts.entries()], distinct, allEven, ok, message: `${distinct} distinct value${distinct === 1 ? '' : 's'}; ${allEven ? 'every count is even' : 'some count is odd'}. ${ok ? 'Valid.' : 'Not valid.'}` })
    answers.push(ok)
    push({ phase: 'record', pythonLine: P('answers.append'), activeLine: L('append whether'), query, l, r, at: -1, counts: [...counts.entries()], distinct, allEven, ok, message: `Query ${query + 1} is recorded as ${ok}.` })
  })

  push({ phase: 'done', pythonLine: P('return answers'), activeLine: L('return answers'), query: -1, l: -1, r: -1, at: -1, counts: [], message: 'Every query has an answer.' })
  return { input: { nums, k, queries }, result: answers, frames }
}

export const limits = { maxLength: MAX_LENGTH, maxQueries: MAX_QUERIES }
