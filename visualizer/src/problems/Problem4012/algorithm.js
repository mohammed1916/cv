const MAX_TASKS = 8
const MAX_SHIFTS = 12
const MAX_VALUE = 30

function lookup(lines, text) {
  const index = lines.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

function positiveList(value, name, max, limit) {
  if (!Array.isArray(value) || value.length < 1 || value.length > limit) throw new Error(`${name} has 1 to ${limit} entries.`)
  for (const v of value) {
    if (!Number.isInteger(v) || v < 1 || v > max) throw new Error(`Each ${name} entry is an integer from 1 to ${max}.`)
  }
  return value
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with tasks and shifts.')
  return {
    tasks: positiveList(input.tasks, 'tasks', MAX_VALUE, MAX_TASKS),
    shifts: positiveList(input.shifts, 'shifts', MAX_VALUE * 2, MAX_SHIFTS),
  }
}

export function buildTrace({ tasks, shifts }) {
  const L = text => lookup(code, text)
  const P = text => lookup(pyLines, text)
  const n = tasks.length
  const frames = []
  let idx = 0
  let rem = tasks[0]
  const answer = []
  frames.push({ pythonLine: P('idx = 0'), phase: 'start', activeLine: L('set idx to 0'), shift: null, budget: null, left: null, idx, rem, answer: answer.slice(), message: `Start with task 0 (${rem} units left) at the first shift.` })
  shifts.forEach((budget, s) => {
    let left = budget
    frames.push({ pythonLine: P('for budget in shifts'), phase: 'shift', activeLine: L('for each budget'), shift: s, budget, left, idx, rem, answer: answer.slice(), message: `Shift ${s + 1} offers ${budget} units.` })
    while (idx < n && left > 0) {
      if (rem <= left) {
        left -= rem
        const finished = idx
        idx += 1
        if (idx < n) rem = tasks[idx]
        frames.push({ pythonLine: P('left -= rem'), phase: 'finish', activeLine: L('if rem <= left'), shift: s, budget, left, idx, rem: idx < n ? rem : 0, finished, answer: answer.slice(), message: `Task ${finished} finishes; ${left} unit${left === 1 ? '' : 's'} left in this shift.` })
      } else {
        rem -= left
        left = 0
        frames.push({ pythonLine: P('rem -= left'), phase: 'partial', activeLine: L('else rem -= left'), shift: s, budget, left, idx, rem, answer: answer.slice(), message: `The shift ends inside task ${idx}, which still needs ${rem} unit${rem === 1 ? '' : 's'}.` })
      }
    }
    if (idx === n) {
      answer.push(0)
      frames.push({ pythonLine: P('answer.append(0)'), phase: 'reset', activeLine: L('then reset idx'), shift: s, budget, left, idx, rem: 0, answer: answer.slice(), message: 'Every task is done, so this shift ends early and leftover time is discarded. The next shift restarts from task 0.' })
      idx = 0
      rem = tasks[0]
    } else {
      answer.push(n - idx)
      frames.push({ pythonLine: P('answer.append(n - idx)'), phase: 'count', activeLine: L('else append n - idx'), shift: s, budget, left, idx, rem, answer: answer.slice(), message: `${n - idx} task${n - idx === 1 ? '' : 's'} remain unfinished after this shift.` })
    }
  })
  frames.push({ pythonLine: P('return answer'), phase: 'done', activeLine: L('return answer'), shift: null, budget: null, left: null, idx, rem, answer: answer.slice(), message: `Unfinished counts after each shift: ${answer.join(', ')}.` })
  return { input: { tasks, shifts }, result: answer, frames }
}

export const code = `unfinished task counts after each shift
  set idx to 0 and rem to tasks[0]
  answer = empty list
  for each budget in shifts
    left = budget
    while idx < n and left > 0
      if rem <= left then left -= rem, idx += 1, and rem becomes the next task
      else rem -= left and left = 0
    if idx == n then append 0 to answer, then reset idx to 0 and rem to tasks[0]
    else append n - idx to answer
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def unfinished_after_each_shift(tasks, shifts):
    n = len(tasks)
    idx = 0
    rem = tasks[0]
    answer = []
    for budget in shifts:
        left = budget
        while idx < n and left > 0:
            if rem <= left:
                left -= rem
                idx += 1
                if idx < n:
                    rem = tasks[idx]
            else:
                rem -= left
                left = 0
        if idx == n:
            answer.append(0)
            idx = 0
            rem = tasks[0]
        else:
            answer.append(n - idx)
    return answer
`

const pyLines = python.split('\n').map((text, index) => ({ line: index + 1, text }))
