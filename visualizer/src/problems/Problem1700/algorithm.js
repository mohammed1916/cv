// Students unable to eat: a student who wants the top sandwich leaves; if nobody wants it, everyone left is stuck.
const JS_LINES = [
  { text: 'const count = [0, 0]', py: 'count = [0, 0]' },
  { text: 'for (const s of students) count[s]++', py: 'for s in students' },
  { text: 'let left = students.length', py: 'left = len(students)' },
  { text: 'for (const s of sandwiches) {', py: 'for s in sandwiches' },
  { text: 'if (count[s] === 0) break', py: 'if count[s] == 0' },
  { text: 'count[s]--', py: 'count[s] -= 1' },
  { text: 'left--', py: 'left -= 1' },
  { text: '}', py: null },
  { text: 'return left', py: 'return left' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def countStudents(students, sandwiches):
    count = [0, 0]
    for s in students:
        count[s] += 1
    left = len(students)
    for s in sandwiches:
        if count[s] == 0:
            break
        count[s] -= 1
        left -= 1
    return left
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return left')]))

export const phases = [
  { id: 'count', label: 'Count', description: 'Count how many students want circular (0) and square (1) sandwiches.' },
  { id: 'serve', label: 'Serve', description: 'The top sandwich goes to one student who wants it; the rest keep their order.' },
  { id: 'stuck', label: 'Stuck', description: 'No one left wants the top sandwich, so the queue stops here.' },
  { id: 'done', label: 'Result', description: 'The students still waiting are the answer.' },
]

export const examples = [
  { label: 'Shortage of one type', input: '{"students":[1,0,1,1,0],"sandwiches":[1,1,0,0,1]}' },
  { label: 'Everyone eats', input: '{"students":[0,0,1],"sandwiches":[0,1,0]}' },
  { label: 'Top sandwich blocks', input: '{"students":[1,1,1],"sandwiches":[0,1,1]}' },
  { label: 'Single student match', input: '{"students":[1],"sandwiches":[1]}' },
  { label: 'Single mismatch', input: '{"students":[0],"sandwiches":[1]}' },
  { label: 'All equal preferences', input: '{"students":[1,1,1,1],"sandwiches":[1,1,1,1]}' },
  { label: 'Long run: 20 students', input: '{"students":[1,0,1,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0,1,0],"sandwiches":[0,0,1,0,1,0,1,1,0,1,0,1,0,0,1,0,1,1,0,1]}' },
]

export const complexity = 'O(n) time and O(1) extra space for n students.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.students) || !Array.isArray(input.sandwiches)) throw new Error('Use an object with students and sandwiches.')
  const { students, sandwiches } = input
  if (students.length !== sandwiches.length || students.length < 1 || students.length > 20) throw new Error('students and sandwiches have the same length, 1 to 20 (visual cap).')
  if (!students.every(v => v === 0 || v === 1) || !sandwiches.every(v => v === 0 || v === 1)) throw new Error('Use 0 (circular) and 1 (square) only.')
  return { students, sandwiches }
}

export function buildTrace({ students, sandwiches }) {
  const frames = []
  const count = [0, 0]
  for (const s of students) count[s]++
  let left = students.length
  const snap = extra => ({ count: [...count], left, ...extra })
  frames.push({ phase: 'count', activeLine: 2, index: -1, message: `Circular wanted: ${count[0]}, square wanted: ${count[1]}.`, snapshot: snap({}) })
  let stuck = false
  for (let i = 0; i < sandwiches.length; i++) {
    const s = sandwiches[i]
    if (count[s] === 0) {
      stuck = true
      frames.push({ phase: 'stuck', activeLine: 5, index: i, message: `Nobody wants ${s === 0 ? 'circular' : 'square'} sandwich ${i + 1}; ${left} students stay.`, snapshot: snap({}) })
      break
    }
    count[s]--
    left--
    frames.push({ phase: 'serve', activeLine: 6, index: i, message: `A student who wants ${s === 0 ? 'circular' : 'square'} eats it; ${left} still waiting.`, snapshot: snap({}) })
  }
  frames.push({ phase: 'done', activeLine: 9, index: -1, result: left, message: `${left} student${left === 1 ? '' : 's'} unable to eat${stuck ? '' : ' (all ate)'}.`, snapshot: snap({ result: left }) })
  return { input: { students, sandwiches }, result: left, frames }
}
