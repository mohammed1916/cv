export const phases = [
  { id: 'sort', label: 'Sort players', description: 'Order players by age, then by score. Any valid team reads left to right in this order.' },
  { id: 'extend', label: 'Extend teams', description: 'Each player adds their score to the best team that can end with an earlier player.' },
  { id: 'answer', label: 'Best team', description: 'The best team ends at the player whose team total is largest.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.scores) || !Array.isArray(data.ages)) throw new Error('Use an object with scores and ages arrays, for example {"scores":[4,2,8],"ages":[1,1,3]}.')
  const n = data.scores.length
  if (n < 1 || n > 12) throw new Error('Use 1 to 12 players.')
  if (data.ages.length !== n) throw new Error('scores and ages must have the same length.')
  if (!data.scores.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each score must be an integer from 1 to 1000.')
  if (!data.ages.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each age must be an integer from 1 to 100.')
  return { scores: [...data.scores], ages: [...data.ages] }
}

const CODE = `best team score (scores, ages):
  order the players by age, then by score
  for each player i in that order:
    best[i] = score[i]
    for each earlier player j in that order:
      if score[j] <= score[i] and best[j] + score[i] > best[i]:
        best[i] = best[j] + score[i]
  return the largest best[i]`.split('\n')
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = { sort: 1, init: 4, test: 6, update: 7, answer: 8 }
void CODE

export const python = `def best_team_score(scores, ages):
    n = len(scores)
    order = sorted(range(n), key=lambda p: (ages[p], scores[p]))
    best = [0] * n
    for k, i in enumerate(order):
        best[k] = scores[i]
        for j in range(k):
            if scores[order[j]] <= scores[i] and best[j] + scores[i] > best[k]:
                best[k] = best[j] + scores[i]
    return max(best)`
const PY = python.split('\n')
const P = s => PY.findIndex(t => t.includes(s)) + 1
const PYLINE = { sort: P('order = sorted'), init: P('best[k] = scores[i]'), test: P('if scores[order[j]]'), update: P('best[k] = best[j]'), answer: P('return max') }

export function buildTrace(input) {
  const { scores, ages } = input
  const n = scores.length
  const order = Array.from({ length: n }, (_, p) => p).sort((a, b) => ages[a] - ages[b] || scores[a] - scores[b])
  const best = Array(n).fill(null)
  const from = Array(n).fill(-1)
  const frames = []
  const who = p => `age ${ages[p]}, score ${scores[p]}`
  const snap = (current, candidate = -1, team = null) => ({ order: [...order], best: [...best], from: [...from], current, candidate, team })
  const frame = (phase, line, pyLine, message, extra) => frames.push({ phase, activeLine: line, pythonLine: pyLine, message, ...snap(extra.current, extra.candidate, extra.team) })

  frame('sort', L.sort, PYLINE.sort, `Sort the ${n} players by age, then by score. Any valid team is a subsequence of this order.`, { current: -1 })
  for (let k = 0; k < n; k++) {
    const i = order[k]
    best[k] = scores[i]
    frame('extend', L.init, PYLINE.init, `Player ${k + 1} in this order (${who(i)}) can always start a team alone with score ${scores[i]}.`, { current: k })
    for (let j = 0; j < k; j++) {
      const p = order[j]
      const compatible = scores[p] <= scores[i]
      const improves = compatible && best[j] + scores[i] > best[k]
      if (improves) { best[k] = best[j] + scores[i]; from[k] = j }
      const message = compatible
        ? `Earlier player ${j + 1} (${who(p)}) does not score above ${scores[i]}, so they can share a team. Their total ${best[j]} + ${scores[i]} = ${best[j] + scores[i]}${improves ? ', a better total, so keep it.' : ', no better than the current ' + best[k] + '.'}`
        : `Earlier player ${j + 1} (${who(p)}) scores ${scores[p]}, above ${scores[i]}, so pairing them would have a younger player outscoring an older one. Skip.`
      frame('extend', compatible ? (improves ? L.update : L.test) : L.test, compatible ? (improves ? PYLINE.update : PYLINE.test) : PYLINE.test, message, { current: k, candidate: j })
    }
  }

  let end = 0
  for (let k = 1; k < n; k++) if (best[k] > best[end]) end = k
  const team = []
  for (let k = end; k >= 0; k = from[k]) { team.unshift(order[k] + 1); if (from[k] < 0) break }
  const total = best[end]
  frame('answer', L.answer, PYLINE.answer, `The best team ends at sorted position ${end + 1} with total ${total}. Its members are players ${team.join(', ')}.`, { current: end, team: team.map(p => p - 1) })
  return { input, result: total, frames }
}
