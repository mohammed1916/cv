// LeetCode 2140: Solving Questions With Brainpower.
// best[i] is the most points from question i onward. Solving question i gives points[i] and skips the next
// brainpower[i] questions, so the next question considered is i + brainpower[i] + 1; skipping it gives best[i + 1].
// Fill best from the end, so each value depends only on later entries.

export function parseInput(text) {
  let questions
  try { questions = JSON.parse(text) } catch { throw new Error('Use a JSON array of [points, brainpower] pairs, e.g. [[3,2],[4,3],[4,4],[2,5]].') }
  if (!Array.isArray(questions) || questions.length < 1 || questions.length > 30) throw new Error('Use 1 to 30 questions.')
  for (const [points, brain] of questions) {
    if (!Number.isInteger(points) || !Number.isInteger(brain) || points < 1 || points > 100000 || brain < 0 || brain > 30) {
      throw new Error('Each question is [points 1 to 100000, brainpower 0 to 30].')
    }
  }
  return { questions }
}

export const code = `function mostPoints(questions) {
  const n = questions.length
  const best = new Array(n + 1).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    const [points, brain] = questions[i]
    const next = Math.min(n, i + brain + 1)
    best[i] = Math.max(best[i + 1], points + best[next])
  }
  return best[0]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: most_points
def most_points(questions):
    n = len(questions)
    best = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        points, brain = questions[i]
        nxt = min(n, i + brain + 1)
        best[i] = max(best[i + 1], points + best[nxt])
    return best[0]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'base', label: 'Base case', description: 'Past the last question, no points remain.' },
  { id: 'compute', label: 'Compare', description: 'Skip question i, or solve it and jump past its brainpower block.' },
  { id: 'done', label: 'Result', description: 'The best total from the first question.' },
]

export function buildTrace({ questions }) {
  const frames = []
  const n = questions.length
  const best = new Array(n + 1).fill(0)
  frames.push({ phase: 'base', activeLine: L('const best = new Array'), pythonLine: P('best = [0]'), message: 'Past the last question the best total is 0.', best: [...best], i: n, next: null, choice: null })
  for (let i = n - 1; i >= 0; i--) {
    const [points, brain] = questions[i]
    const next = Math.min(n, i + brain + 1)
    const skip = best[i + 1]
    const solve = points + best[next]
    best[i] = Math.max(skip, solve)
    frames.push({ phase: 'compute', activeLine: L('best[i] = Math.max'), pythonLine: P('best[i] = max'), message: `Question ${i} (${points} points, skip ${brain}): skip gives ${skip}, solve gives ${points} + best[${next}] = ${solve}.`, best: [...best], i, next, choice: solve >= skip ? 'solve' : 'skip' })
  }
  frames.push({ phase: 'done', activeLine: L('return best[0]'), pythonLine: P('return best[0]'), message: `Most points from question 0: ${best[0]}.`, best: [...best], i: 0, next: null, choice: null })
  return { input: { questions }, result: best[0], frames }
}
