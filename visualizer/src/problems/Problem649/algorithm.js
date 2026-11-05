export function parseInput(text) {
  const senate = JSON.parse(text)
  if (typeof senate !== 'string' || senate.length < 1 || senate.length > 10000 || ![...senate].every(c => c === 'R' || c === 'D')) throw new Error('Enter a JSON string of 1–10,000 letters, each R or D.')
  return senate
}

// Two queues of seat numbers. The front senator of each party bans the other party's front senator,
// and the survivor re-queues at the back with a later turn number (position + n).
export function buildTrace(senate) {
  const n = senate.length
  const radiant = [], dire = []
  ;[...senate].forEach((c, i) => (c === 'R' ? radiant : dire).push(i))
  const frames = [{ phase: 'start', senate, radiant: [...radiant], dire: [...dire], banned: null, activeLine: L('const radiant = []'), pythonLine: P('radiant = deque('), message: 'Queue every senator by seat order in one queue per party.' }]
  while (radiant.length && dire.length) {
    const r = radiant.shift()
    const d = dire.shift()
    const winner = r < d ? 'R' : 'D'
    if (r < d) radiant.push(r + n)
    else dire.push(d + n)
    frames.push({ phase: 'round', senate, radiant: [...radiant], dire: [...dire], banned: winner === 'R' ? d : r, acting: winner === 'R' ? r : d, activeLine: L('if (r < d)'), pythonLine: P('if r < d'), message: `Seat ${r} (R) and seat ${d} (D) face off; ${winner === 'R' ? 'the Radiant seat bans the Dire seat' : 'the Dire seat bans the Radiant seat'}.` })
  }
  const result = radiant.length ? 'Radiant' : 'Dire'
  frames.push({ phase: 'done', senate, radiant: [...radiant], dire: [...dire], banned: null, result, activeLine: L("'Radiant' : 'Dire'"), pythonLine: P("return 'Radiant'"), message: `${result} wins: the other party has no senators left.` })
  return { input: senate, result, frames }
}

const SOURCE = `function predictPartyVictory(senate) {
  const n = senate.length
  const radiant = []
  const dire = []
  ;[...senate].forEach((c, i) => (c === 'R' ? radiant : dire).push(i))
  while (radiant.length > 0 && dire.length > 0) {
    const r = radiant.shift()
    const d = dire.shift()
    if (r < d) radiant.push(r + n)
    else dire.push(d + n)
  }
  return radiant.length > 0 ? 'Radiant' : 'Dire'
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque


def predict_party_victory(senate):
    n = len(senate)
    radiant = deque(i for i, c in enumerate(senate) if c == 'R')
    dire = deque(i for i, c in enumerate(senate) if c == 'D')
    while radiant and dire:
        r = radiant.popleft()
        d = dire.popleft()
        if r < d:
            radiant.append(r + n)
        else:
            dire.append(d + n)
    return 'Radiant' if radiant else 'Dire'`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
