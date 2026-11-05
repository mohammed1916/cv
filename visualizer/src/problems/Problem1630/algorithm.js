// Arithmetic subarrays: sort each queried slice; it is arithmetic when every neighbouring gap is equal.
const JS_LINES = [
  { text: 'const answers = []', py: 'answers = []' },
  { text: 'for (let q = 0; q < l.length; q++) {', py: 'for a, b in zip' },
  { text: 'const part = nums.slice(l[q], r[q] + 1).sort((x, y) => x - y)', py: 'part = sorted' },
  { text: 'const d = part[1] - part[0]', py: 'd = part[1]' },
  { text: 'let ok = true', py: 'ok = all(' },
  { text: 'answers.push(ok)', py: 'answers.append(ok)' },
  { text: '}', py: null },
  { text: 'return answers', py: 'return answers' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def checkArithmeticSubarrays(nums, l, r):
    answers = []
    for a, b in zip(l, r):
        part = sorted(nums[a:b + 1])
        d = part[1] - part[0]
        ok = all(part[i] - part[i - 1] == d for i in range(2, len(part)))
        answers.append(ok)
    return answers
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return answers')]))

export const phases = [
  { id: 'query', label: 'Query', description: 'Take the slice from index l to index r, both included.' },
  { id: 'sort', label: 'Sort', description: 'Sort a copy of the slice; the order of the original is not changed.' },
  { id: 'check', label: 'Check gaps', description: 'Every neighbouring gap in the sorted slice must match the first gap.' },
  { id: 'done', label: 'Result', description: 'One true or false per query, in query order.' },
]

export const examples = [
  { label: 'Two queries', input: '{"nums":[4,9,3,1,7,5],"l":[0,1,2],"r":[2,4,5]}' },
  { label: 'Pair is always arithmetic', input: '{"nums":[10,2,8],"l":[0],"r":[1]}' },
  { label: 'Gaps differ', input: '{"nums":[1,6,2,9],"l":[0],"r":[3]}' },
]

export const complexity = 'O(m * k log k) time for m queries whose slices have length k at most. Space is O(k) for each sorted slice.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object') throw new Error('Use an object with nums, l and r.')
  const { nums, l, r } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 16) throw new Error('nums has 2 to 16 integers (visual cap).')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100000)) throw new Error('nums values are integers.')
  if (!Array.isArray(l) || !Array.isArray(r) || l.length !== r.length || l.length < 1) throw new Error('l and r are equal-length query arrays.')
  l.forEach((a, i) => {
    const b = r[i]
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b >= nums.length || b - a < 1) throw new Error('Each query needs 0 <= l < r < nums.length.')
  })
  return { nums, l, r }
}

export function buildTrace({ nums, l, r }) {
  const frames = []
  const answers = []
  const snap = extra => ({ answers: [...answers], ...extra })
  frames.push({ phase: 'query', activeLine: 1, l: -1, r: -1, message: 'Answer each query in order.', snapshot: snap({}) })
  for (let q = 0; q < l.length; q++) {
    const slice = nums.slice(l[q], r[q] + 1)
    frames.push({ phase: 'query', activeLine: 2, l: l[q], r: r[q], query: q, message: `Query ${q + 1}: slice from index ${l[q]} to ${r[q]} is [${slice.join(', ')}].`, snapshot: snap({ slice }) })
    const part = [...slice].sort((x, y) => x - y)
    frames.push({ phase: 'sort', activeLine: 3, l: l[q], r: r[q], query: q, message: `Sorted copy: [${part.join(', ')}].`, snapshot: snap({ slice, part }) })
    const d = part[1] - part[0]
    let ok = true
    for (let i = 2; i < part.length; i++) if (part[i] - part[i - 1] !== d) ok = false
    answers.push(ok)
    frames.push({ phase: 'check', activeLine: 5, l: l[q], r: r[q], query: q, verdict: ok, message: ok ? `Every gap is ${d}: arithmetic.` : 'The gaps differ: not arithmetic.', snapshot: snap({ slice, part, gap: d }) })
  }
  frames.push({ phase: 'done', activeLine: 8, l: -1, r: -1, result: answers, message: `Answers: ${answers.map(String).join(', ')}.`, snapshot: snap({ result: answers }) })
  return { input: { nums, l, r }, result: answers, frames }
}
