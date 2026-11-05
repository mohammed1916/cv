const CODE_TEXT = `function employeeFreeTime(schedules) {
  const flat = []
  for (const busy of schedules) for (const [start, end] of busy) flat.push([start, end]) // flatten every employee's busy intervals
  flat.sort((a, b) => a[0] - b[0] || a[1] - b[1]) // sort the list by start time
  const free = []
  let reach = null // no time seen yet
  for (const [start, end] of flat) { // for each interval in sorted order
    if (reach !== null && start > reach) free.push([reach, start]) // if reach exists and start is after it, that gap is free
    reach = reach === null || end > reach ? end : reach // set reach to the later end
  }
  return free // return the free gaps
}`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def employee_free_time(schedules):
    intervals = []
    for busy in schedules:
        for start, end in busy:
            intervals.append((start, end))
    intervals.sort()
    free = []
    reach = None
    for start, end in intervals:
        if reach is not None and start > reach:
            free.append([reach, start])
        if reach is None or end > reach:
            reach = end
    return free


if __name__ == "__main__":
    print(employee_free_time([[[1, 2], [5, 6]], [[1, 3]], [[4, 10]]]))
`

const PY_LINES = python.split('\n')
const L = text => {
  const index = code.findIndex(item => item.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY_LINES.findIndex(item => item.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const MAX_EMPLOYEES = 4
const MAX_INTERVALS = 5
const MAX_TIME = 50

export function parseInput(text) {
  const schedules = JSON.parse(text)
  if (!Array.isArray(schedules) || schedules.length < 1 || schedules.length > MAX_EMPLOYEES) {
    throw new Error(`Use a list of 1 to ${MAX_EMPLOYEES} employees.`)
  }
  for (const busy of schedules) {
    if (!Array.isArray(busy) || busy.length > MAX_INTERVALS) throw new Error(`Each employee has at most ${MAX_INTERVALS} intervals.`)
    let previousEnd = -Infinity
    for (const pair of busy) {
      if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger)) throw new Error('Each interval is [start, end] with integers.')
      const [start, end] = pair
      if (start < 0 || end > MAX_TIME || start >= end) throw new Error(`Each interval needs 0 <= start < end <= ${MAX_TIME}.`)
      if (start < previousEnd) throw new Error("An employee's intervals are sorted and do not overlap.")
      previousEnd = end
    }
  }
  return schedules
}

export function buildTrace(schedules) {
  const frames = []
  const add = (phase, line, py, message, state) => frames.push({ phase, activeLine: L(line), pythonLine: P(py), message, ...state })
  const flat = []
  schedules.forEach((busy, owner) => busy.forEach(([start, end]) => flat.push({ owner, start, end })))
  add('flatten', 'flatten every', 'intervals.append', `Collected ${flat.length} busy intervals from ${schedules.length} employees.`, { items: flat.slice(), current: -1, reach: null, free: [], result: null })
  const sorted = flat.slice().sort((a, b) => a.start - b.start || a.end - b.end)
  add('sort', 'sort the list', 'intervals.sort()', 'Sorted every interval by start time.', { items: sorted.slice(), current: -1, reach: null, free: [], result: null })
  const free = []
  let reach = null
  sorted.forEach((item, index) => {
    add('compare', 'for each interval', 'for start, end in intervals', `Interval [${item.start}, ${item.end}] of employee ${item.owner} is next.`, { items: sorted, current: index, reach, free: free.slice(), result: null })
    if (reach !== null && item.start > reach) {
      free.push([reach, item.start])
      add('gap', 'if reach exists', 'free.append', `Start ${item.start} is after reach ${reach}, so [${reach}, ${item.start}] is free.`, { items: sorted, current: index, reach, free: free.slice(), result: null })
    }
    reach = reach === null || item.end > reach ? item.end : reach
    add('extend', 'set reach', 'reach = end', `Reach is now ${reach}.`, { items: sorted, current: index, reach, free: free.slice(), result: null })
  })
  add('done', 'return the free gaps', 'return free', `${free.length} free gap${free.length === 1 ? '' : 's'} found.`, { items: sorted, current: -1, reach, free: free.slice(), result: free.map(gap => gap.slice()) })
  return { input: schedules, result: free, frames }
}
