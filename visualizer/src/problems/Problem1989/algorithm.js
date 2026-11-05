export const phases = [
  { id: 'start', label: 'Start', description: 'Scan the line from left to right with a pointer to the next runner that might still be caught.' },
  { id: 'window', label: 'Catcher window', description: 'The catcher at i can reach runners from l = i - dist to r = i + dist.' },
  { id: 'catch', label: 'Catch', description: 'Catch the leftmost reachable runner, then move the pointer past it.' },
  { id: 'skip', label: 'Skip', description: 'Runners left of the window can never be reached again, so the pointer moves past them.' },
  { id: 'done', label: 'Result', description: 'Return the number of runners caught.' },
]

export const code = `function catchMaximumPeople(team, dist) {
  let caught = 0
  let next = 0
  for (let i = 0; i < team.length; i++) {
    if (team[i] !== 1) continue
    while (next < team.length && (team[next] === 1 || next < i - dist)) next++
    if (next < team.length && next <= i + dist) {
      caught++
      next++
    }
  }
  return caught
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def catch_maximum_people(team, dist):
    caught = 0
    nxt = 0
    for i in range(len(team)):
        if team[i] != 1:
            continue
        while nxt < len(team) and (team[nxt] == 1 or nxt < i - dist):
            nxt += 1
        if nxt < len(team) and nxt <= i + dist:
            caught += 1
            nxt += 1
    return caught
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"team":[0,1,0,1,0],"dist":3}.') }
  const { team, dist } = obj || {}
  if (!Array.isArray(team) || team.length < 1 || team.length > 30) throw new Error('team must have 1 to 30 entries here.')
  if (!team.every(v => v === 0 || v === 1)) throw new Error('team entries must be 0 (not it) or 1 (it).')
  if (!Number.isInteger(dist) || dist < 1 || dist > 30) throw new Error('dist must be a whole number from 1 to 30.')
  return { team, dist }
}

export function buildTrace({ team, dist }) {
  const frames = []
  let caught = 0
  let next = 0
  const caughtAt = new Set()
  const add = (phase, c, p, message, i, extra = {}) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { team, dist, index: i, l: extra.l ?? -1, r: extra.r ?? -1, caughtAt: [...caughtAt], caught, lastCatch: extra.lastCatch ?? -1 },
  })
  add('start', 'let caught', 'caught = 0', 'Start with no one caught and the runner pointer at index 0.', -1)
  for (let i = 0; i < team.length; i++) {
    if (team[i] !== 1) continue
    add('window', 'if (team[i] !== 1)', 'if team[i] != 1', `Catcher at ${i} reaches [${Math.max(0, i - dist)}, ${Math.min(team.length - 1, i + dist)}].`, i, { l: Math.max(0, i - dist), r: Math.min(team.length - 1, i + dist) })
    while (next < team.length && (team[next] === 1 || next < i - dist)) {
      next++
    }
    if (next < team.length && next <= i + dist) {
      caught++
      caughtAt.add(next)
      add('catch', 'caught++', 'caught += 1', `Catch runner ${next}, the leftmost one in reach. ${caught} caught so far.`, i, { l: next, r: i + dist, lastCatch: next })
      next++
    } else {
      add('skip', 'if (next < team.length', 'if nxt < len(team)', `No runner is reachable from catcher ${i}.`, i, { l: next, r: i + dist })
    }
  }
  add('done', 'return caught', 'return caught', `${caught} runners are caught.`, team.length - 1)
  return { input: { team, dist }, result: caught, frames }
}
