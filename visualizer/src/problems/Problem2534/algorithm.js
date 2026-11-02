const CODE = [
  'FUNCTION crossingTimes(arrival, state)',
  '    answer ← zeros ; crossed ← nobody ; t ← 0 ; lastDir ← none ; lastTime ← -2',
  '    WHILE someone has not crossed',
  '        waiting[d] ← people who have not crossed, arrived by t, and want direction d',
  '        IF no one is waiting THEN t ← t + 1 and continue (the door is idle)',
  '        IF both directions wait THEN d ← lastDir if lastTime = t - 1, otherwise exit (1)',
  '        ELSE d ← the only direction that waits',
  '        person ← the earliest input index in waiting[d]',
  '        answer[person] ← t ; lastDir ← d ; lastTime ← t ; t ← t + 1',
  '    RETURN answer',
]

const PY = [
  'def crossing_times(arrival, state):',
  '    n = len(arrival)',
  '    answer = [0] * n',
  '    crossed = [False] * n',
  '    t = 0',
  '    last_dir = None',
  '    last_time = -2',
  '    remaining = n',
  '    while remaining:',
  '        waiting = {0: [], 1: []}',
  '        for i in range(n):',
  '            if not crossed[i] and arrival[i] <= t:',
  '                waiting[state[i]].append(i)',
  '        if not waiting[0] and not waiting[1]:',
  '            t += 1',
  '            continue',
  '        if waiting[0] and waiting[1]:',
  '            d = last_dir if last_time == t - 1 else 1',
  '        else:',
  '            d = 0 if waiting[0] else 1',
  '        i = waiting[d][0]',
  '        crossed[i] = True',
  '        answer[i] = t',
  '        remaining -= 1',
  '        last_dir = d',
  '        last_time = t',
  '        t += 1',
  '    return answer',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Start', description: 'Nobody has crossed; the door is idle.' },
  { id: 'idle', label: 'Idle', description: 'Nobody is waiting this second.' },
  { id: 'choose', label: 'Choose', description: 'Pick the direction for this second.' },
  { id: 'cross', label: 'Cross', description: 'The chosen person crosses in this second.' },
  { id: 'done', label: 'Result', description: 'Every person has crossed.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with arrival and state.')
  const { arrival, state } = input
  if (!Array.isArray(arrival) || !Array.isArray(state) || arrival.length !== state.length) throw new Error('arrival and state must be lists of the same length.')
  if (arrival.length < 1 || arrival.length > 10) throw new Error('The visualization caps the people at 10.')
  if (!arrival.every(t => Number.isInteger(t) && t >= 0 && t <= 20)) throw new Error('Arrival times are integers from 0 to 20 in this visualization.')
  if (!state.every(s => s === 0 || s === 1)) throw new Error('state is 0 (enter) or 1 (exit) per person.')
  return { arrival, state }
}

export function buildTrace({ arrival, state }) {
  const n = arrival.length
  const answer = Array(n).fill(0)
  const crossed = Array(n).fill(false)
  let t = 0
  let lastDir = null
  let lastTime = -2
  let remaining = n
  const frames = []
  frames.push({ pythonLine: pyLine('answer = [0] * n'), phase: 'start', activeLine: codeLine('answer ← zeros ; crossed ← nobody ; t ← 0 ; lastDir ← none ; lastTime ← -2'), t: 0, waiting: [[], []], dir: null, person: null, timeline: [], answer: [...answer], message: 'The door starts idle. Each crossing takes one second.' })
  const timeline = []
  while (remaining) {
    const waiting = [[], []]
    for (let i = 0; i < n; i++) if (!crossed[i] && arrival[i] <= t) waiting[state[i]].push(i)
    if (!waiting[0].length && !waiting[1].length) {
      timeline.push({ t, idle: true })
      frames.push({ pythonLine: pyLine('t += 1'), phase: 'idle', activeLine: codeLine('IF no one is waiting THEN t ← t + 1 and continue (the door is idle)'), t, waiting, dir: null, person: null, timeline: [...timeline], answer: [...answer], message: `Second ${t}: nobody is waiting, so the door is idle.` })
      t += 1
      continue
    }
    let d
    let why
    if (waiting[0].length && waiting[1].length) {
      if (lastTime === t - 1) { d = lastDir; why = `both directions wait, and the door was used last second, so it keeps direction ${lastDir === 0 ? 'enter' : 'exit'}` }
      else { d = 1; why = 'both directions wait and the door was idle last second, so exiting has priority' }
    } else {
      d = waiting[0].length ? 0 : 1
      why = `only ${d === 0 ? 'entering' : 'exiting'} people wait`
    }
    frames.push({ pythonLine: pyLine('d = last_dir if last_time == t - 1 else 1'), phase: 'choose', activeLine: codeLine('IF both directions wait THEN d ← lastDir if lastTime = t - 1, otherwise exit (1)'), t, waiting: waiting.map(w => [...w]), dir: d, person: null, timeline: [...timeline], answer: [...answer], message: `Second ${t}: ${why}.` })
    const person = waiting[d][0]
    crossed[person] = true
    answer[person] = t
    remaining -= 1
    lastDir = d
    lastTime = t
    timeline.push({ t, dir: d, person })
    frames.push({ pythonLine: pyLine('answer[i] = t'), phase: 'cross', activeLine: codeLine('person ← the earliest input index in waiting[d]'), t, waiting: waiting.map(w => [...w]), dir: d, person, timeline: [...timeline], answer: [...answer], message: `Person ${person} ${d === 0 ? 'enters' : 'exits'} at second ${t}.` })
    t += 1
  }
  frames.push({ pythonLine: pyLine('return answer'), phase: 'done', activeLine: codeLine('RETURN answer'), t: t - 1, waiting: [[], []], dir: null, person: null, timeline: [...timeline], answer: [...answer], message: `Crossing times: ${answer.join(', ')}.` })
  return { input: { arrival, state }, result: answer, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
