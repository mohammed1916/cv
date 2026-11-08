// Best team with no conflicts: sort by age then score; a team is a chain of non-decreasing scores.
const JS_LINES = [
  { text: 'const players = ages.map((age, i) => [age, scores[i]]).sort((x, y) => x[0] - y[0] || x[1] - y[1])', py: 'players = sorted' },
  { text: 'const dp = new Array(n).fill(0)', py: 'dp = [0] * n' },
  { text: 'for (let i = 0; i < n; i++) {', py: 'for i in range(n)' },
  { text: 'dp[i] = players[i][1]', py: 'dp[i] = players[i][1]' },
  { text: 'for (let j = 0; j < i; j++) {', py: 'for j in range(i)' },
  { text: 'if (players[j][1] <= players[i][1]) dp[i] = Math.max(dp[i], dp[j] + players[i][1])', py: 'if players[j][1] <= players[i][1]' },
  { text: '}', py: null },
  { text: '}', py: null },
  { text: 'return Math.max(...dp)', py: 'return max(dp)' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def bestTeamScore(scores, ages):
    players = sorted(zip(ages, scores))
    n = len(players)
    dp = [0] * n
    for i in range(n):
        dp[i] = players[i][1]
        for j in range(i):
            if players[j][1] <= players[i][1]:
                dp[i] = max(dp[i], dp[j] + players[i][1])
    return max(dp)
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return max(dp)')]))

export const phases = [
  { id: 'sort', label: 'Sort', description: 'Order players by age, then by score, so the younger players come first.' },
  { id: 'extend', label: 'Extend', description: 'Each player extends the best team that ends with a score no higher than theirs.' },
  { id: 'done', label: 'Result', description: 'The best team ends at some player; the answer is the largest total.' },
]

export const examples = [
  { label: 'Mixed ages', input: '{"scores":[6,4,9,5],"ages":[2,2,3,1]}' },
  { label: 'Same age only', input: '{"scores":[3,7,5],"ages":[4,4,4]}' },
  { label: 'Strict conflict', input: '{"scores":[8,2,5],"ages":[1,3,5]}' },
    { label: "Single player", input: "{\"scores\":[10],\"ages\":[20]}" },
    { label: "Equal scores and ages", input: "{\"scores\":[5,5,5],\"ages\":[3,3,3]}" },
    { label: "Twelve players, top scores", input: "{\"scores\":[100,100,100,100,100,100,100,100,100,100,100,100],\"ages\":[1,2,3,4,5,6,7,8,9,10,11,12]}" },
    { label: "Long run: 12 players", input: "{\"scores\":[17,74,58,3,31,73,81,11,95,70,60,80],\"ages\":[98,3,37,40,70,20,84,55,47,100,14,94]}" },
]

export const complexity = 'O(n^2) time and O(n) space for n players. Players with the same age never conflict.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object') throw new Error('Use an object with scores and ages.')
  const { scores, ages } = input
  if (!Array.isArray(scores) || !Array.isArray(ages) || scores.length !== ages.length) throw new Error('scores and ages need the same length.')
  if (scores.length < 1 || scores.length > 12) throw new Error('Use 1 to 12 players (visual cap).')
  for (let i = 0; i < scores.length; i++) {
    if (!Number.isInteger(scores[i]) || scores[i] < 1 || scores[i] > 100) throw new Error('Scores are integers from 1 to 100.')
    if (!Number.isInteger(ages[i]) || ages[i] < 1 || ages[i] > 100) throw new Error('Ages are integers from 1 to 100.')
  }
  return { scores, ages }
}

export function buildTrace({ scores, ages }) {
  const players = ages.map((age, i) => ({ age, score: scores[i], id: i })).sort((x, y) => x.age - y.age || x.score - y.score)
  const n = players.length
  const dp = new Array(n).fill(0)
  const prev = new Array(n).fill(-1)
  const frames = []
  const snap = extra => ({ dp: [...dp], prev: [...prev], players: players.map(p => `${p.age}/${p.score}`), ...extra })
  frames.push({ phase: 'sort', activeLine: 1, index: -1, message: 'Players sorted by age, then score.', snapshot: snap({}) })
  for (let i = 0; i < n; i++) {
    dp[i] = players[i].score
    for (let j = 0; j < i; j++) {
      if (players[j].score <= players[i].score && dp[j] + players[i].score > dp[i]) {
        dp[i] = dp[j] + players[i].score
        prev[i] = j
      }
    }
    const from = prev[i] >= 0 ? `extends player ${prev[i] + 1}` : 'starts a new team'
    frames.push({ phase: 'extend', activeLine: 4, index: i, message: `Player ${i + 1} (age ${players[i].age}, score ${players[i].score}) ${from}; best total ${dp[i]}.`, snapshot: snap({ current: i }) })
  }
  const best = Math.max(...dp)
  frames.push({ phase: 'done', activeLine: 9, index: -1, result: best, message: `Best team total is ${best}.`, snapshot: snap({ result: best }) })
  return { input: { scores, ages }, players, result: best, frames }
}
