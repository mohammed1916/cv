export const phases = [
  { id: 'query', label: 'Pick a subarray', description: 'Take the values between the two indices of one query, inclusive.' },
  { id: 'sort', label: 'Sort the copy', description: 'Sorting puts an arithmetic progression in order with equal gaps between neighbours.' },
  { id: 'check', label: 'Check gaps', description: 'Every neighbouring difference in the sorted copy must equal the first one.' },
  { id: 'answer', label: 'Answers', description: 'Each query becomes true or false in input order.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || !Array.isArray(data.l) || !Array.isArray(data.r)) throw new Error('Use {"nums":[...],"l":[...],"r":[...]}.')
  const n = data.nums.length
  if (n < 2 || n > 20) throw new Error('Use 2 to 20 numbers.')
  if (!data.nums.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) throw new Error('Each number must be an integer from -100 to 100.')
  if (data.l.length !== data.r.length || data.l.length < 1 || data.l.length > 6) throw new Error('Use 1 to 6 queries, with equal l and r lengths.')
  data.l.forEach((a, i) => {
    const b = data.r[i]
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b >= n || a >= b) throw new Error(`Query ${i + 1} needs zero-based indices with 0 ≤ l < r < ${n}.`)
  })
  return { nums: [...data.nums], l: [...data.l], r: [...data.r] }
}

const CODE = `arithmetic check (nums, l, r):
  answers = []
  for each query q:
    part = the values from l[q] to r[q], sorted
    gap = part[1] - part[0]
    ok = true
    for t from 0 to length - 2:
      if part[t + 1] - part[t] != gap: ok = false, stop
    answers.append(ok)
  return answers`.split('\n')
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = { query: 3, sort: 4, gap: 5, check: 7, mismatch: 8, answer: 9, done: 10 }

export const python = `def arithmetic_subarrays(nums, l, r):
    answers = []
    for start, end in zip(l, r):
        part = sorted(nums[start:end + 1])
        gap = part[1] - part[0]
        ok = True
        for t in range(len(part) - 1):
            if part[t + 1] - part[t] != gap:
                ok = False
                break
        answers.append(ok)
    return answers`
const PYLINE = { query: 3, sort: 4, gap: 5, check: 7, mismatch: 8, answer: 11, done: 12 }

export function buildTrace(input) {
  const { nums, l, r } = input
  const frames = []
  const answers = []
  const base = { segmentRange: null, sorted: null, gap: null, step: -1, answers: [], query: -1 }
  frames.push({ phase: 'query', activeLine: 2, pythonLine: 2, message: `Check ${l.length} queries. Each one is a fresh sorted copy of its own range.`, ...base })
  l.forEach((start, q) => {
    const end = r[q]
    const segment = nums.slice(start, end + 1)
    const snap = extra => ({ segmentRange: [start, end], segment: [...segment], sorted: null, gap: null, step: -1, answers: [...answers], query: q, ...extra })
    frames.push({ phase: 'query', activeLine: L.query, pythonLine: PYLINE.query, message: `Query ${q + 1}: indices ${start} to ${end}, values ${segment.join(', ')}.`, ...snap({}) })
    const part = [...segment].sort((a, b) => a - b)
    frames.push({ phase: 'sort', activeLine: L.sort, pythonLine: PYLINE.sort, message: `Sorted, the values are ${part.join(', ')}.`, ...snap({ sorted: part }) })
    const gap = part[1] - part[0]
    frames.push({ phase: 'check', activeLine: L.gap, pythonLine: PYLINE.gap, message: `The first gap is ${part[1]} - ${part[0]} = ${gap}. Every other neighbour pair must match it.`, ...snap({ sorted: part, gap }) })
    let ok = true
    for (let t = 0; t < part.length - 1; t++) {
      const d = part[t + 1] - part[t]
      if (d !== gap) {
        ok = false
        frames.push({ phase: 'check', activeLine: L.mismatch, pythonLine: PYLINE.mismatch, message: `${part[t + 1]} - ${part[t]} = ${d}, which differs from ${gap}. Stop: this query is false.`, ...snap({ sorted: part, gap, step: t }) })
        break
      }
      frames.push({ phase: 'check', activeLine: L.check, pythonLine: PYLINE.check, message: `Gap ${t + 1} is ${d}, which matches ${gap}.`, ...snap({ sorted: part, gap, step: t }) })
    }
    answers.push(ok)
    frames.push({ phase: 'answer', activeLine: L.answer, pythonLine: PYLINE.answer, message: `Query ${q + 1} is ${ok ? 'true' : 'false'}.`, ...snap({ sorted: part, gap, answers: [...answers] }) })
  })
  frames.push({ phase: 'answer', activeLine: L.done, pythonLine: PYLINE.done, message: `Answers in input order: ${answers.map(v => (v ? 'true' : 'false')).join(', ')}.`, segmentRange: null, segment: null, sorted: null, gap: null, step: -1, answers: [...answers], query: l.length - 1 })
  return { input, result: answers, frames }
}
