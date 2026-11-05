// LeetCode 1947: pair every student with a distinct mentor and maximize the total number of matching answers.
const SOURCE = [
  "function maxCompatibilitySum(students, mentors) {",
  "  const m = students.length",
  "  const score = (i, j) => students[i].filter((a, k) => a === mentors[j][k]).length",
  "  let best = 0",
  "  const assign = (i, used, total) => {",
  "    if (i === m) { best = Math.max(best, total); return }",
  "    for (let j = 0; j < m; j++) {",
  "      if (used & (1 << j)) continue",
  "      assign(i + 1, used | (1 << j), total + score(i, j))",
  "    }",
  "  }",
  "  assign(0, 0, 0)",
  "  return best",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def max_compatibility_sum(students, mentors):
    m = len(students)
    best = 0
    def score(i, j):
        return sum(1 for a, b in zip(students[i], mentors[j]) if a == b)
    def assign(i, used, total):
        nonlocal best
        if i == m:
            best = max(best, total)
            return
        for j in range(m):
            if not used & (1 << j):
                assign(i + 1, used | (1 << j), total + score(i, j))
    assign(0, 0, 0)
    return best
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'search', label: 'Try pairings', description: 'Assign each student to a mentor not yet used.' },
  { id: 'done', label: 'Result', description: 'Best total over all complete pairings.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"students":[[1,0],[0,1]],"mentors":[[1,1],[0,0]]}.') }
  const { students, mentors } = input || {}
  if (!Array.isArray(students) || !Array.isArray(mentors) || students.length !== mentors.length || students.length < 1 || students.length > 4) throw new Error('students and mentors have the same length from 1 to 4.')
  const n = students[0]?.length
  const ok = arr => arr.every(row => Array.isArray(row) && row.length === n && row.every(v => v === 0 || v === 1))
  if (!n || n > 6 || !ok(students) || !ok(mentors)) throw new Error('Each answer list holds 0 or 1 values, up to 6 questions.')
  return { students, mentors }
}

export function buildTrace({ students, mentors }) {
  const m = students.length
  const score = (i, j) => students[i].filter((a, k) => a === mentors[j][k]).length
  const frames = []
  let best = 0
  let bestPairing = null
  const pairing = []
  const visit = (i, used, total) => {
    if (i === m) {
      if (total > best || bestPairing === null) { best = total; bestPairing = [...pairing] }
      frames.push({ phase: 'search', activeLine: L('if (i === m)'), pythonLine: P('if i == m'), message: `Complete pairing scores ${total}. Best so far: ${best}.`, pairing: [...pairing], total, best, bestPairing: [...bestPairing], depth: i })
      return
    }
    for (let j = 0; j < m; j++) {
      if (used & (1 << j)) continue
      pairing.push(j)
      const s = score(i, j)
      frames.push({ phase: 'search', activeLine: L('if (used & (1 << j)) continue'), pythonLine: P('if not used'), message: `Student ${i} tries mentor ${j}: ${s} matching answer(s).`, pairing: [...pairing], total: total + s, best, bestPairing: bestPairing ? [...bestPairing] : [], depth: i + 1 })
      visit(i + 1, used | (1 << j), total + s)
      pairing.pop()
    }
  }
  visit(0, 0, 0)
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), message: `Maximum total: ${best}.`, pairing: bestPairing, total: best, best, bestPairing, depth: m })
  return { input: { students, mentors }, result: best, frames, matrix: Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => score(i, j))) }
}
