const CODE = [
  "FUNCTION findChampion(grid)",
  "    n ← number of teams",
  "    FOR each team i",
  "        wins ← 0",
  "        FOR each team j different from i",
  "            IF grid[i][j] = 1, wins ← wins + 1",
  "        IF wins = n - 1, RETURN i",
  "    RETURN -1",
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = `def findChampion(grid):
    n = len(grid)
    for i in range(n):
        wins = 0
        for j in range(n):
            if j != i and grid[i][j] == 1:
                wins += 1
        if wins == n - 1:
            return i
    return -1
`

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be a JSON object such as {"grid": [[0,1],[0,0]]}') }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with key grid')
  const { grid } = data
  if (!Array.isArray(grid) || grid.length < 2 || grid.length > 10) throw new Error('grid must be a square matrix of 2 to 10 teams for the visualization')
  const n = grid.length
  grid.forEach((row, i) => {
    if (!Array.isArray(row) || row.length !== n) throw new Error(`grid row ${i} must have length ${n}`)
    row.forEach((v, j) => {
      if (v !== 0 && v !== 1) throw new Error(`grid[${i}][${j}] must be 0 or 1`)
      if (i === j && v !== 0) throw new Error(`diagonal entry grid[${i}][${i}] must be 0`)
    })
  })
  return { grid }
}

export function buildTrace({ grid }) {
  const n = grid.length
  const frames = []
  const winsByTeam = Array(n).fill(null)
  let champion = -1
  const emit = (phase, activeLine, pythonLine, message, active = -1, marks = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: winsByTeam.map(v => (v === null ? '?' : v)), active, marks,
    summary: champion >= 0 ? `champion: team ${champion}` : 'searching',
  })
  emit('setup', 2, 2, `n = ${n} teams`)
  for (let i = 0; i < n; i++) {
    emit('team', 3, 3, `check team ${i}`, i, { [i]: 'current' })
    let wins = 0
    for (let j = 0; j < n; j++) {
      if (j === i) continue
      if (grid[i][j] === 1) {
        wins += 1
        emit('compare', 6, 7, `team ${i} beats team ${j} (wins ${wins})`, i, { [i]: 'current', [j]: 'beaten' })
      } else {
        emit('compare', 6, 6, `team ${i} does not beat team ${j}`, i, { [i]: 'current', [j]: 'beaten' })
      }
    }
    winsByTeam[i] = wins
    if (wins === n - 1) {
      champion = i
      emit('result', 7, 9, `team ${i} beats all ${n - 1} other teams, so it is the champion`, i, { [i]: 'champion' })
      break
    }
    emit('team', 7, 8, `team ${i} has ${wins} wins, not enough`, i, { [i]: 'filled' })
  }
  const result = champion
  if (champion < 0) emit('result', 8, 10, 'no team beats all others, return -1')
  return { input: { grid }, result, frames }
}
