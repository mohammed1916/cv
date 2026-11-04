export const phases = [
  { id: 'start', label: 'Start', description: 'Nothing has been grouped yet.' },
  { id: 'read', label: 'Read', description: 'Convert a record to minutes and file it under its employee.' },
  { id: 'sort', label: 'Sort', description: 'Order one employee\'s times.' },
  { id: 'check', label: 'Check', description: 'Compare a time with the one two places earlier.' },
  { id: 'hit', label: 'High access', description: 'Three accesses fit under 60 minutes.' },
  { id: 'clear', label: 'Not high', description: 'No three consecutive times fit under 60 minutes.' },
  { id: 'done', label: 'Result', description: 'Report every high-access employee.' },
]

const toMinutes = stamp => Number(stamp.slice(0, 2)) * 60 + Number(stamp.slice(2))
export const clock = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with access_times.')
  const { access_times: records } = input
  if (!Array.isArray(records) || records.length < 1 || records.length > 100) throw new Error('access_times has 1 to 100 records.')
  for (const record of records) {
    if (!Array.isArray(record) || record.length !== 2) throw new Error('Each record is [name, time].')
    const [name, stamp] = record
    if (typeof name !== 'string' || !/^[a-z]{1,10}$/.test(name)) throw new Error('A name is 1 to 10 lowercase letters.')
    if (typeof stamp !== 'string' || !/^([01][0-9]|2[0-3])[0-5][0-9]$/.test(stamp)) throw new Error('A time is four digits in 24-hour HHMM form.')
  }
  return { access_times: records }
}

export function buildTrace({ access_times: records }) {
  const frames = []
  const groups = new Map()
  const answer = []
  const verdicts = {}
  let sorted = {}
  const snapshot = () => [...groups].map(([name, minutes]) => ({ name, minutes: [...minutes] }))
  const push = (phase, pseudo, py, message, extra = {}) => frames.push({
    phase, activeLine: L(pseudo), pythonLine: P(py), message,
    rowIndex: -1, groups: snapshot(), sorted: { ...sorted }, verdicts: { ...verdicts }, answer: [...answer],
    current: null, i: -1, gap: null, ...extra,
  })
  push('start', 'group the records', 'groups = defaultdict(list)', 'Start with no employees grouped.')
  records.forEach(([name, stamp], rowIndex) => {
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(toMinutes(stamp))
    push('read', 'turn HHMM into minutes', 'groups[name].append', `${stamp} is ${toMinutes(stamp)} minutes after midnight; file it under ${name}.`, { rowIndex, current: name })
  })
  for (const [name, minutes] of groups) {
    const ordered = [...minutes].sort((a, b) => a - b)
    sorted = { ...sorted, [name]: ordered }
    push('sort', 'sort the times', 'minutes.sort()', `${name} in time order: ${ordered.map(clock).join(', ')}.`, { current: name })
    let high = false
    for (let i = 2; i < ordered.length; i++) {
      const gap = ordered[i] - ordered[i - 2]
      push('check', 'compare it with the time two places earlier', 'if minutes[i] - minutes[i - 2] < 60:', `${clock(ordered[i])} minus ${clock(ordered[i - 2])} is ${gap} minutes. ${gap < 60 ? 'That is under 60.' : gap === 60 ? 'Exactly 60 does not count.' : 'That is 60 or more.'}`, { current: name, i, gap })
      if (gap < 60) {
        high = true
        verdicts[name] = true
        answer.push(name)
        push('hit', 'add the employee', 'answer.append(name)', `${name} has three accesses in ${gap} minutes, so ${name} is high-access. Later times need no check.`, { current: name, i, gap })
        break
      }
    }
    if (!high) {
      verdicts[name] = false
      const reason = ordered.length < 3 ? `${name} has only ${ordered.length} access${ordered.length === 1 ? '' : 'es'}, too few.` : `No three consecutive times of ${name} fit under 60 minutes.`
      push('clear', 'for each time from the third onward', 'for i in range(2, len(minutes)):', reason, { current: name })
    }
  }
  push('done', 'return the employees', 'return answer', answer.length ? `High-access: ${answer.join(', ')}.` : 'Nobody is high-access.')
  return { input: { access_times: records }, result: answer, frames }
}

export const code = `find high-access employees
  group the records by employee
  turn HHMM into minutes since midnight for each record
  for each employee
    sort the times
    for each time from the third onward
      compare it with the time two places earlier
      if the gap is under 60, add the employee and stop checking them
  return the employees that were added`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `from collections import defaultdict


def find_high_access_employees(access_times):
    groups = defaultdict(list)
    for name, stamp in access_times:
        groups[name].append(int(stamp[:2]) * 60 + int(stamp[2:]))
    answer = []
    for name, minutes in groups.items():
        minutes.sort()
        for i in range(2, len(minutes)):
            if minutes[i] - minutes[i - 2] < 60:
                answer.append(name)
                break
    return answer
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
