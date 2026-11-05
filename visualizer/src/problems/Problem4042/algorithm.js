const PHASES = [
  { id: 'query', label: 'Query', description: 'Take the current inclusive range [l, r].' },
  { id: 'count', label: 'Count', description: 'Tally each value inside the range.' },
  { id: 'check', label: 'Check', description: 'Test for exactly k distinct values, all with even counts.' },
  { id: 'next', label: 'Next range', description: 'Derive the next endpoints from the answer.' },
  { id: 'done', label: 'Answers', description: 'Return every Boolean answer.' },
]

export const phases = PHASES

const CODE_LINES = [
  'function validQueries(nums, k, start, q) {',
  '  const n = nums.length',
  '  let [l, r] = start',
  '  const answers = []',
  '  for (let step = 0; step < q; step++) {',
  '    const counts = new Map()',
  '    for (let i = l; i <= r; i++) counts.set(nums[i], (counts.get(nums[i]) ?? 0) + 1)',
  '    const valid = counts.size === k && [...counts.values()].every(c => c % 2 === 0)',
  '    answers.push(valid)',
  '    const g = valid ? l + r : r - l',
  '    const a = (l ^ g) % n, b = (r ^ g) % n',
  '    l = Math.min(a, b); r = Math.max(a, b)',
  '  }',
  '  return answers',
  '}',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `def valid_queries(nums, k, start, q):
    n = len(nums)
    l, r = start
    answers = []
    for _ in range(q):
        counts = {}
        for x in nums[l:r + 1]:
            counts[x] = counts.get(x, 0) + 1
        valid = len(counts) == k and all(c % 2 == 0 for c in counts.values())
        answers.append(valid)
        g = l + r if valid else r - l
        a, b = (l ^ g) % n, (r ^ g) % n
        l, r = min(a, b), max(a, b)
    return answers
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, k, start and q.')
  const { nums, k, start, q } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 14 || !nums.every(v => Number.isInteger(v) && v >= 0 && v <= 9)) {
    throw new Error('nums has 1 to 14 integers from 0 to 9.')
  }
  const n = nums.length
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  if (!Array.isArray(start) || start.length !== 2 || !start.every(v => Number.isInteger(v) && v >= 0 && v < n) || start[0] > start[1]) {
    throw new Error('start is [l, r] with 0 <= l <= r < n.')
  }
  if (!Number.isInteger(q) || q < 1 || q > 12) throw new Error('q is an integer from 1 to 12.')
  return { nums, k, start, q }
}

export function buildTrace({ nums, k, start, q }) {
  const n = nums.length
  const frames = []
  const answers = []
  let l = start[0]
  let r = start[1]
  const base = () => ({ k, n, nums, answers: [...answers] })
  frames.push({ ...base(), pythonLine: P('l, r = start'), phase: 'query', activeLine: L('let [l, r] = start'), l, r, counts: null, valid: null, g: null, message: `Start with range [${l}, ${r}].` })
  for (let step = 0; step < q; step++) {
    frames.push({ ...base(), pythonLine: P('for _ in range(q)'), phase: 'query', activeLine: L('for (let step = 0'), l, r, counts: null, valid: null, g: null, message: `Query ${step + 1} of ${q}: range [${l}, ${r}].` })
    const counts = new Map()
    for (let i = l; i <= r; i++) {
      counts.set(nums[i], (counts.get(nums[i]) || 0) + 1)
      frames.push({ ...base(), pythonLine: P('counts[x] = counts.get'), phase: 'count', activeLine: L('counts.set(nums[i]'), l, r, at: i, counts: Object.fromEntries(counts), valid: null, g: null, message: `Index ${i} holds ${nums[i]}; ${counts.size} distinct so far.` })
    }
    const even = [...counts.values()].every(c => c % 2 === 0)
    const valid = counts.size === k && even
    answers.push(valid)
    frames.push({ ...base(), pythonLine: P('valid = len(counts)'), phase: 'check', activeLine: L('const valid ='), l, r, counts: Object.fromEntries(counts), valid, g: null, message: `${counts.size} distinct value${counts.size === 1 ? '' : 's'} (need ${k}), ${even ? 'all counts even' : 'some count is odd'}: ${valid ? 'valid' : 'not valid'}.` })
    const g = valid ? l + r : r - l
    const a = (l ^ g) % n
    const b = (r ^ g) % n
    const nl = Math.min(a, b)
    const nr = Math.max(a, b)
    frames.push({ ...base(), pythonLine: P('a, b = (l ^ g)'), phase: 'next', activeLine: L('const a ='), l, r, counts: Object.fromEntries(counts), valid, g, nextL: nl, nextR: nr, message: `g = ${g}; next endpoints ${a} and ${b}, sorted to [${nl}, ${nr}].` })
    l = nl
    r = nr
  }
  frames.push({ ...base(), pythonLine: P('return answers'), phase: 'done', activeLine: L('return answers'), l, r, counts: null, valid: null, g: null, message: `Answers: ${answers.map(v => (v ? 'true' : 'false')).join(', ')}.` })
  return { input: { nums, k, start, q }, result: answers, frames }
}
