export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 10000 || ![...s].every(c => c === 'R' || c === 'D')) throw new Error('Enter a JSON string of 1–10,000 characters, each R or D.')
  return s
}

// Two queues of senator positions; the front of each queue acts next, bans the first opponent, and re-queues.
export function buildTrace(senate) {
  const radiant = [], dire = []
  ;[...senate].forEach((c, i) => (c === 'R' ? radiant : dire).push(i))
  const n = senate.length
  const frames = [{ phase: 'start', radiant: [...radiant], dire: [...dire], round: 0, activeLine: 3, message: 'Queue each senator by position.' }]
  let round = 0
  while (radiant.length && dire.length) {
    const r = radiant.shift(), d = dire.shift()
    round++
    if (r < d) { radiant.push(r + n); frames.push({ phase: 'ban', radiant: [...radiant], dire: [...dire], round, actor: r, victim: d, winner: 'R', activeLine: 8, message: `Senator ${r} (R) bans senator ${d} (D). R returns to the queue.` }) }
    else { dire.push(d + n); frames.push({ phase: 'ban', radiant: [...radiant], dire: [...dire], round, actor: d, victim: r, winner: 'D', activeLine: 9, message: `Senator ${d} (D) bans senator ${r} (R). D returns to the queue.` }) }
  }
  const result = radiant.length ? 'Radiant' : 'Dire'
  frames.push({ phase: 'done', radiant: [...radiant], dire: [...dire], round, result, activeLine: 11, message: `${result} wins: the other party has no senators left.` })
  return { input: senate, result, frames }
}

export const code = `def predictPartyVictory(senate):
    radiant, dire = deque(), deque()
    for i, c in enumerate(senate):
        (radiant if c == 'R' else dire).append(i)
    n = len(senate)
    while radiant and dire:
        r, d = radiant.popleft(), dire.popleft()
        if r < d: radiant.append(r + n)
        else: dire.append(d + n)
    return 'Radiant' if radiant else 'Dire'`.split('\n').map((text, index) => ({ line: index + 1, text }))
