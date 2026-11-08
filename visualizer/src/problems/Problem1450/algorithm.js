export const phases = [
  { id: 'start', label: 'Start', description: 'Set the query time and a count of zero students doing homework.' },
  { id: 'check', label: 'Check student', description: 'A student is doing homework at the query time when start <= query <= end.' },
  { id: 'busy', label: 'Doing homework', description: 'The query time falls inside this student’s interval, so count them.' },
  { id: 'idle', label: 'Not doing homework', description: 'The query time is outside this student’s interval.' },
  { id: 'done', label: 'Complete', description: 'Return how many students are doing homework at the query time.' },
]

export const examples = [
  { label: 'Three overlapping', input: '{"start":[1,3,3,8],"end":[3,3,8,10],"query":3}' },
  { label: 'One at the time', input: '{"start":[2,5,7,9],"end":[4,6,8,12],"query":6}' },
  { label: 'Nobody', input: '{"start":[1,2],"end":[3,4],"query":9}' },
    { label: 'One student at the exact time', input: '{"start":[5],"end":[5],"query":5}' },
    { label: 'Query at an end time', input: '{"start":[2,4],"end":[4,4],"query":4}' },
    { label: 'Largest query time: 20 students', input: '{"start":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],"end":[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],"query":100}' },
    { label: 'Long run: 20 students', input: '{"start":[45,58,34,54,38,57,46,54,60,5,59,36,44,8,52,43,27,45,37,10],"end":[81,85,65,74,44,93,78,80,94,32,88,37,51,47,65,73,47,82,65,30],"query":62}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.start) || !Array.isArray(data.end)) throw new Error('Use an object with start and end lists, and an integer query.')
  if (data.start.length !== data.end.length) throw new Error('start and end must have the same length.')
  if (data.start.length < 1 || data.start.length > 20) throw new Error('Use 1 to 20 students in this visualization.')
  data.start.forEach((s, i) => {
    if (!Number.isInteger(s) || !Number.isInteger(data.end[i])) throw new Error(`Student ${i} needs integer start and end times.`)
    if (s > data.end[i]) throw new Error(`Student ${i} starts after the end time.`)
  })
  if (!Number.isInteger(data.query) || data.query < 1 || data.query > 100) throw new Error('query must be an integer from 1 to 100.')
  return { start: data.start, end: data.end, query: data.query }
}

export function buildTrace({ start, end, query }) {
  let count = 0
  const rows = (upto) => start.slice(0, upto).map((s, i) => ({ student: i, start: s, end: end[i], busy: s <= query && query <= end[i] ? 'yes' : 'no' }))
  const snap = (current, extra = {}) => ({ query, count, current, rows: rows(current === null ? 0 : current + 1), ...extra })
  const frames = [{ phase: 'start', activeLine: L('let count = 0'), pythonLine: P('count = 0'), snapshot: snap(null),
    message: `Query time ${query}. Count students whose interval covers it.` }]
  start.forEach((s, i) => {
    frames.push({ phase: 'check', activeLine: L('for (let i = 0'), pythonLine: P('for i in range'), snapshot: snap(i),
      message: `Student ${i} is busy from ${s} to ${end[i]}; is ${query} inside?` })
    if (s <= query && query <= end[i]) {
      count++
      frames.push({ phase: 'busy', activeLine: L('count++'), pythonLine: P('count += 1'), snapshot: snap(i),
        message: `${query} is inside [${s}, ${end[i]}], so student ${i} counts; total ${count}.` })
    } else {
      frames.push({ phase: 'idle', activeLine: L('if (start[i] <= query'), pythonLine: P('if start[i] <= query'), snapshot: snap(i),
        message: `${query} is outside [${s}, ${end[i]}], so student ${i} does not count.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), snapshot: snap(null, { result: count }),
    message: `Return ${count}: that many students are doing homework at time ${query}.`, result: count })
  return { input: { start, end, query }, result: count, frames }
}

export const code = `function busyStudent(start, end, query) {
  let count = 0
  for (let i = 0; i < start.length; i++) {
    if (start[i] <= query && query <= end[i]) count++
  }
  return count
}`
export const codeLines = code.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }

export const python = `def busy_student(start, end, query):
    count = 0
    for i in range(len(start)):
        if start[i] <= query <= end[i]:
            count += 1
    return count
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
