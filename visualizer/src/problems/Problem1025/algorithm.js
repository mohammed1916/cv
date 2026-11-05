// Independently written teaching model. The sample inputs are invented for this visualization.
export const code = `function divisorGameWins(n) {
  const wins = Array(n + 1).fill(false)
  for (let i = 1; i <= n; i++) {
    let found = false
    for (let x = 1; x < i && !found; x++) {
      if (i % x === 0 && !wins[i - x]) found = true
    }
    wins[i] = found
  }
  return wins[n]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def divisor_game_wins(n):
    wins = [False] * (n + 1)
    for i in range(1, n + 1):
        found = False
        for x in range(1, i):
            if i % x == 0 and not wins[i - x]:
                found = True
                break
        wins[i] = found
    return wins[n]`

const PSEUDO = code.map(line => line.text)
const PY_LINES = python.split('\n')
function lineOf(lines, key) {
  const index = lines.findIndex(text => text.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, pseudoKey, pyKey, message, snapshot) => ({
  phase,
  activeLine: lineOf(PSEUDO, pseudoKey),
  pythonLine: lineOf(PY_LINES, pyKey),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Start', description: 'Create a table with a state for every pile size up to n.' },
  { id: 'inspect', label: 'Try a divisor', description: 'For a pile size i, test each smaller divisor x that leaves a losing state.' },
  { id: 'update', label: 'Record state', description: 'A pile size is winning when some move reaches a losing state.' },
  { id: 'done', label: 'Result', description: 'Report whether the first player wins from n.' },
]

export const inputLabel = 'JSON object with n, for example {"n":9}'
export const complexity = 'O(n^2) time and O(n) space for the table. The visualizer accepts n up to 60 so every table entry can be shown.'
export const examples = [
  { label: 'Small even pile', input: '{"n":6}' },
  { label: 'Odd pile', input: '{"n":9}' },
  { label: 'Larger even pile', input: '{"n":16}' },
  { label: 'Starting pile of one', input: '{"n":1}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n) || input.n < 1 || input.n > 60) {
    throw new Error('Use {"n": m} with an integer m from 1 to 60.')
  }
  return { n: input.n }
}

export function buildTrace({ n }) {
  const frames = []
  const wins = Array(n + 1).fill(false)
  frames.push(frame('start', 'const wins = Array(n + 1)', 'wins = [False]', `Prepare states 0 through ${n}, all losing until shown otherwise.`, { n, i: 0, wins: [...wins] }))
  for (let i = 1; i <= n; i++) {
    frames.push(frame('inspect', 'for (let i = 1; i <= n; i++)', 'for i in range', `Decide pile size ${i}.`, { n, i, x: null, wins: [...wins] }))
    let found = false
    for (let x = 1; x < i && !found; x++) {
      const divides = i % x === 0
      frames.push(frame('inspect', 'if (i % x === 0', 'if i % x == 0', divides
        ? `Taking ${x} leaves ${i - x}.`
        : `${x} does not divide ${i}, so it is not a legal move.`, { n, i, x, wins: [...wins] }))
      if (divides && !wins[i - x]) {
        found = true
        frames.push(frame('update', 'found = true', 'found = True', `${i - x} is losing for the opponent, so ${i} is winning.`, { n, i, x, wins: [...wins] }))
      }
    }
    wins[i] = found
    frames.push(frame('update', 'wins[i] = found', 'wins[i] = found', `State ${i} is ${found ? 'winning' : 'losing'}.`, { n, i, x: null, wins: [...wins] }))
  }
  const result = wins[n]
  frames.push(frame('done', 'return wins[n]', 'return wins[n]', `The first player ${result ? 'wins' : 'loses'} from ${n}.`, { n, i: n, wins: [...wins], result }))
  return { input: { n }, result, frames }
}
