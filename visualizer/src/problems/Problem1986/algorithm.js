export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with one open session and no time used.' },
  { id: 'mask', label: 'Extend subset', description: 'For each subset of tasks, keep the fewest sessions and then the least time in the last one.' },
  { id: 'done', label: 'Result', description: 'The full subset holds the answer.' },
]

export const code = `function minSessions(tasks, sessionTime) {
  const n = tasks.length
  const full = (1 << n) - 1
  const best = new Array(full + 1).fill(null)
  best[0] = [1, 0]
  for (let mask = 1; mask <= full; mask++) {
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i))) continue
      const [sessions, used] = best[mask ^ (1 << i)]
      const candidate = used + tasks[i] <= sessionTime ? [sessions, used + tasks[i]] : [sessions + 1, tasks[i]]
      if (best[mask] === null || candidate[0] < best[mask][0] || (candidate[0] === best[mask][0] && candidate[1] < best[mask][1])) {
        best[mask] = candidate
      }
    }
  }
  return best[full][0]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_sessions(tasks, session_time):
    n = len(tasks)
    full = (1 << n) - 1
    best = [None] * (full + 1)
    best[0] = (1, 0)
    for mask in range(1, full + 1):
        for i in range(n):
            if not mask & (1 << i):
                continue
            sessions, used = best[mask ^ (1 << i)]
            if used + tasks[i] <= session_time:
                candidate = (sessions, used + tasks[i])
            else:
                candidate = (sessions + 1, tasks[i])
            if best[mask] is None or candidate < best[mask]:
                best[mask] = candidate
    return best[full][0]
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"tasks":[1,2,3],"sessionTime":3}.') }
  const { tasks, sessionTime } = obj || {}
  if (!Array.isArray(tasks) || tasks.length < 1 || tasks.length > 8) throw new Error('This visual accepts 1 to 8 tasks.')
  if (!Number.isInteger(sessionTime) || sessionTime < 1 || sessionTime > 15) throw new Error('sessionTime must be a whole number from 1 to 15.')
  if (!tasks.every(t => Number.isInteger(t) && t >= 1 && t <= sessionTime)) throw new Error('Each task must be a whole number no longer than sessionTime.')
  return { tasks, sessionTime }
}

export function buildTrace({ tasks, sessionTime }) {
  const n = tasks.length
  const full = (1 << n) - 1
  const frames = []
  const best = new Array(full + 1).fill(null)
  best[0] = [1, 0]
  const members = mask => tasks.map((t, i) => (mask & (1 << i) ? t : null)).filter(v => v !== null)
  const add = (phase, c, p, message, mask) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { tasks, mask, sessionTime, value: mask === null ? null : best[mask], inSet: mask === null ? [] : members(mask), full },
  })
  add('start', 'best[0] = ', 'best[0] = ', 'The empty set uses one session with no time spent.', null)
  for (let mask = 1; mask <= full; mask++) {
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i))) continue
      const [sessions, used] = best[mask ^ (1 << i)]
      const candidate = used + tasks[i] <= sessionTime ? [sessions, used + tasks[i]] : [sessions + 1, tasks[i]]
      if (best[mask] === null || candidate[0] < best[mask][0] || (candidate[0] === best[mask][0] && candidate[1] < best[mask][1])) {
        best[mask] = candidate
      }
    }
    add('mask', 'for (let mask', 'for mask in range', `Subset ${members(mask).join(' + ')} needs ${best[mask][0]} session(s), with ${best[mask][1]} hours in the last one.`, mask)
  }
  add('done', 'return best[full]', 'return best[full]', `All tasks fit in ${best[full][0]} session(s).`, full)
  return { input: { tasks, sessionTime }, result: best[full][0], frames }
}
