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
  const frames = [{ phase: 'start', radiant: [...radiant], dire: [...dire], round: 0, pythonLine: P('radiant, dire = deque()'), activeLine: L('radiant = empty queue'), message: 'Queue each senator by position.' }]
  let round = 0
  while (radiant.length && dire.length) {
    const r = radiant.shift(), d = dire.shift()
    round++
    if (r < d) { radiant.push(r + n); frames.push({ phase: 'ban', radiant: [...radiant], dire: [...dire], round, actor: r, victim: d, winner: 'R', pythonLine: P('radiant.append(r + n)'), activeLine: L('add r + n to the back of radiant'), message: `Senator ${r} (R) bans senator ${d} (D). R returns to the queue.` }) }
    else { dire.push(d + n); frames.push({ phase: 'ban', radiant: [...radiant], dire: [...dire], round, actor: d, victim: r, winner: 'D', pythonLine: P('dire.append(d + n)'), activeLine: L('add d + n to the back of dire'), message: `Senator ${d} (D) bans senator ${r} (R). D returns to the queue.` }) }
  }
  const result = radiant.length ? 'Radiant' : 'Dire'
  frames.push({ phase: 'done', radiant: [...radiant], dire: [...dire], round, result, pythonLine: P("return 'Radiant'"), activeLine: L('return "Radiant"'), message: `${result} wins: the other party has no senators left.` })
  return { input: senate, result, frames }
}

export const code = `radiant = empty queue, dire = empty queue
for each position i and letter c in senate:
  if c is R: add i to the back of radiant
  else: add i to the back of dire
n = length of senate
while radiant and dire are both non-empty:
  r = pop front of radiant, d = pop front of dire
  if r < d: add r + n to the back of radiant
  else: add d + n to the back of dire
return "Radiant" if radiant is non-empty, else "Dire"`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `from collections import deque


def predict_party_victory(senate):
    radiant, dire = deque(), deque()
    for i, c in enumerate(senate):
        (radiant if c == 'R' else dire).append(i)
    n = len(senate)
    while radiant and dire:
        r, d = radiant.popleft(), dire.popleft()
        if r < d:
            radiant.append(r + n)
        else:
            dire.append(d + n)
    return 'Radiant' if radiant else 'Dire'`
