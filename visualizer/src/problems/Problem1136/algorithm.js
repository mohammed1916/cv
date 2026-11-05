// Fewest semesters when any course whose prerequisites are finished may run in a semester.
// Layered topological sort: each semester takes every course that is currently unlocked.
// If some course never unlocks, the prerequisites contain a cycle and the answer is -1.

const COURSE_LIMIT = 10
const RELATION_LIMIT = 15

export const phases = [
  { id: 'start', label: 'Start', description: 'Count the unmet prerequisites of each course.' },
  { id: 'unlock', label: 'Unlocked', description: 'Courses with no unmet prerequisites can run in this semester.' },
  { id: 'semester', label: 'Semester', description: 'Run every unlocked course and release the courses that depended on them.' },
  { id: 'done', label: 'Result', description: 'Return the number of semesters, or -1 if a course is never released.' },
]

export function parseInput(text) {
  let obj = text
  if (typeof obj === 'string') {
    try { obj = JSON.parse(obj) } catch { throw new Error('Use a JSON object with courses and relations.') }
  }
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.courses) || !Array.isArray(obj.relations)) {
    throw new Error('Use an object with an integer courses and a list relations of [before, after].')
  }
  const { courses, relations } = obj
  if (courses < 1 || courses > COURSE_LIMIT) throw new Error(`courses must be from 1 to ${COURSE_LIMIT} in this visualization.`)
  if (relations.length > RELATION_LIMIT) throw new Error(`At most ${RELATION_LIMIT} relations in this visualization.`)
  for (const rel of relations) {
    if (!Array.isArray(rel) || rel.length !== 2) throw new Error('Each relation is [before, after].')
    if (!rel.every(c => Number.isInteger(c) && c >= 1 && c <= courses)) throw new Error('Relation entries are course numbers from 1 to courses.')
  }
  return { courses, relations }
}

export const code = `function minimumSemesters(courses, relations) {
  const indegree = Array(courses + 1).fill(0)
  const neededBy = Array.from({ length: courses + 1 }, () => [])
  for (const [before, after] of relations) {
    neededBy[before].push(after)
    indegree[after]++
  }
  let available = []
  for (let c = 1; c <= courses; c++) if (indegree[c] === 0) available.push(c)
  let semesters = 0
  let finished = 0
  while (available.length) {
    semesters++
    const upcoming = []
    for (const c of available) {
      finished++
      for (const d of neededBy[c]) {
        indegree[d]--
        if (indegree[d] === 0) upcoming.push(d)
      }
    }
    available = upcoming
  }
  return finished === courses ? semesters : -1
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_semesters(courses, relations):
    indegree = [0] * (courses + 1)
    needed_by = [[] for _ in range(courses + 1)]
    for before, after in relations:
        needed_by[before].append(after)
        indegree[after] += 1
    available = [c for c in range(1, courses + 1) if indegree[c] == 0]
    semesters = finished = 0
    while available:
        semesters += 1
        upcoming = []
        for c in available:
            finished += 1
            for d in needed_by[c]:
                indegree[d] -= 1
                if indegree[d] == 0:
                    upcoming.append(d)
        available = upcoming
    return semesters if finished == courses else -1
`

const P = text => python.split('\n').findIndex(line => line.includes(text)) + 1

export function buildTrace(input) {
  const { courses, relations } = parseInput(input)
  const indegree = Array(courses + 1).fill(0)
  const neededBy = Array.from({ length: courses + 1 }, () => [])
  for (const [before, after] of relations) {
    neededBy[before].push(after)
    indegree[after]++
  }
  const counts = () => Object.fromEntries(indegree.slice(1).map((c, i) => [i + 1, c]))
  const frames = [{
    phase: 'start', activeLine: 2, pythonLine: P('indegree = [0]'),
    message: 'Count how many unfinished prerequisites each course has.',
    snapshot: { unmet: counts(), available: [], semester: 0, finished: [], current: [] },
  }]
  let available = []
  for (let c = 1; c <= courses; c++) if (indegree[c] === 0) available.push(c)
  let semesters = 0
  const finished = []
  while (available.length) {
    semesters++
    frames.push({
      phase: 'unlock', activeLine: 12, pythonLine: P('available = [c for'),
      message: `Semester ${semesters}: courses ${available.join(', ')} have no unmet prerequisites.`,
      snapshot: { unmet: counts(), available: [...available], semester: semesters, finished: [...finished], current: [...available] },
    })
    const upcoming = []
    for (const c of available) {
      finished.push(c)
      for (const d of neededBy[c]) {
        indegree[d]--
        if (indegree[d] === 0) upcoming.push(d)
      }
    }
    frames.push({
      phase: 'semester', activeLine: 19, pythonLine: P('for d in needed_by'),
      message: upcoming.length ? `Finishing semester ${semesters} unlocks ${upcoming.join(', ')} for the next semester.` : `Finishing semester ${semesters} unlocks nothing new.`,
      snapshot: { unmet: counts(), available: [...upcoming], semester: semesters, finished: [...finished], current: [...available] },
    })
    available = upcoming
  }
  const result = finished.length === courses ? semesters : -1
  frames.push({
    phase: 'done', activeLine: 24, pythonLine: P('return semesters if'),
    message: result === -1 ? `Only ${finished.length} of ${courses} courses could be finished, so the prerequisites form a cycle.` : `All ${courses} courses are finished in ${result} semester${result === 1 ? '' : 's'}.`,
    snapshot: { unmet: counts(), available: [], semester: semesters, finished: [...finished], current: [] },
  })
  return { input: { courses, relations }, result, frames }
}
