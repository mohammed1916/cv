export const phases = [
  { id: 'start', label: 'Start count', description: 'Begin with zero busy students.' },
  { id: 'check', label: 'Check interval', description: 'Test whether the query time lies between this student start and end times, inclusive.' },
  { id: 'count', label: 'Count student', description: 'The query is inside the interval, so this student is busy at that time.' },
  { id: 'skip', label: 'Outside interval', description: 'The query is outside this interval, so the student is not counted.' },
  { id: 'done', label: 'Result', description: 'Return the total count.' },
]

export const code = `function busyStudents(startTime, endTime, queryTime):
    count = 0
    for i from 0 to length(startTime) - 1:
        if startTime[i] <= queryTime and queryTime <= endTime[i]:
            count = count + 1
    return count`

export const python = `def busy_students(start_time, end_time, query_time):
    count = 0
    for i in range(len(start_time)):
        if start_time[i] <= query_time <= end_time[i]:
            count += 1
    return count`

const lineOf = (source, fragment) => source.split('\n').findIndex(line => line.includes(fragment)) + 1
const C = fragment => lineOf(code, fragment)
const P = fragment => lineOf(python, fragment)

const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"start":[1,3],"end":[2,5],"query":4}.') }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use a JSON object with start, end and query.')
  const { start, end, query } = obj
  if (!Array.isArray(start) || !Array.isArray(end) || start.length < 1 || start.length > 100 || start.length !== end.length) {
    throw new Error('start and end must be arrays of the same length, from 1 to 100.')
  }
  start.forEach((s, i) => {
    if (!isInt(s, 1, 1000) || !isInt(end[i], 1, 1000)) throw new Error(`Student ${i + 1}: times must be whole numbers from 1 to 1000.`)
    if (s > end[i]) throw new Error(`Student ${i + 1}: the start must not be after the end.`)
  })
  if (!isInt(query, 1, 1000)) throw new Error('query must be a whole number from 1 to 1000.')
  return { start, end, query }
}

export function buildTrace({ start, end, query }) {
  const frames = []
  const flags = []
  let count = 0
  const add = (phase, c, p, message, index, current) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { start, end, query, index, count, decided: flags.slice(), current },
  })
  add('start', 'count = 0', 'count = 0', `Start with count 0 and query time ${query}.`, -1, null)
  for (let i = 0; i < start.length; i++) {
    const inside = start[i] <= query && query <= end[i]
    add('check', 'if startTime', 'if start_time', `Student ${i + 1} has interval [${start[i]}, ${end[i]}]. Is ${query} inside it?`, i, inside)
    if (inside) {
      count += 1
      flags.push(true)
      add('count', 'count = count + 1', 'count += 1', `Yes, so student ${i + 1} is counted. The count is now ${count}.`, i, true)
    } else {
      flags.push(false)
      add('skip', 'if startTime', 'if start_time', `No, so student ${i + 1} is not counted.`, i, false)
    }
  }
  add('done', 'return count', 'return count', `${count} students are busy at time ${query}.`, start.length - 1, null)
  return { input: { start, end, query }, result: count, frames }
}
