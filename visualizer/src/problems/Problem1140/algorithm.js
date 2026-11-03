// Original teaching model. The pile sizes are invented for this visualization.
// A table cell (i, M) answers: from pile i with limit M, how many stones can the player to move collect?

export const phases = [
  { id: 'setup', label: 'Setup', description: 'Build suffix totals so the stones left from any pile are one lookup.' },
  { id: 'fill', label: 'Fill table', description: 'Each cell tries every legal take and keeps the best one.' },
  { id: 'done', label: 'Result', description: 'Read the first player total from the first pile with limit one.' },
]

export const code = [
  'n = number of piles; suffix[i] = stones from pile i to the end',
  'best[n][M] = 0 for every limit M',
  'for i from n - 1 down to 0:',
  '  for M from 1 to n:',
  '    choice = 0',
  '    for X from 1 to min(2M, n - i):',
  '      opponent = best[i + X][max(M, X)]',
  '      choice = max(choice, suffix[i] - opponent)',
  '    best[i][M] = choice',
  'return best[0][1]',
].map((text, index) => ({ line: index + 1, text }))

const at = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing code line: ${key}`)
  return index + 1
}

export const python = `def stone_split(piles):
    n = len(piles)
    suffix = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suffix[i] = suffix[i + 1] + piles[i]
    best = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for m in range(1, n + 1):
            choice = 0
            for x in range(1, min(2 * m, n - i) + 1):
                choice = max(choice, suffix[i] - best[i + x][max(m, x)])
            best[i][m] = choice
    return best[0][1]`

export const inputLabel = 'Pile sizes (JSON array of positive integers)'
export const complexity = 'O(n³) time for the table: n piles, n limits, and up to n takes per cell. The space is O(n²).'
export const examples = [
  { label: 'Sample', input: '[3,9,1,2,7,5]' },
  { label: 'Two piles', input: '[4,8]' },
  { label: 'Equal piles', input: '[6,6,6,6]' },
]

export function parseInput(text) {
  const piles = JSON.parse(text)
  if (!Array.isArray(piles) || piles.length < 1 || piles.length > 10) throw new Error('Enter a JSON array of 1 to 10 pile sizes.')
  piles.forEach((value, i) => {
    if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error(`Pile ${i + 1} must be a whole number from 1 to 100.`)
  })
  return piles
}

export function buildTrace(piles) {
  const n = piles.length
  const suffix = Array(n + 1).fill(0)
  for (let i = n - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + piles[i]
  const best = Array.from({ length: n + 1 }, () => Array(n + 1).fill(null))
  for (let M = 1; M <= n; M++) best[n][M] = 0
  const frames = []
  const snap = extra => ({ piles, suffix: [...suffix], table: best.map(row => [...row]), cell: null, choice: null, ...extra })

  frames.push({
    phase: 'setup', activeLine: at('n = number'),
    message: `${n} piles. The suffix totals show how many stones remain from each pile to the end. Past the last pile nothing is left, so those cells are zero.`,
    snapshot: snap(),
  })

  for (let i = n - 1; i >= 0; i--) {
    for (let M = 1; M <= n; M++) {
      let choice = 0, chosenX = 0
      const maxX = Math.min(2 * M, n - i)
      for (let X = 1; X <= maxX; X++) {
        const opponent = best[i + X][Math.max(M, X)]
        const value = suffix[i] - opponent
        if (value > choice) { choice = value; chosenX = X }
      }
      best[i][M] = choice
      const opponentLeft = best[i + chosenX][Math.max(M, chosenX)]
      frames.push({
        phase: 'fill', activeLine: at('best[i][M] = choice'),
        message: `Pile ${i}, limit ${M}: taking ${chosenX} pile(s) is best. The opponent then collects ${opponentLeft} from the rest, so this player keeps ${choice}.`,
        snapshot: snap({ cell: [i, M], choice: chosenX }),
      })
    }
  }

  const result = best[0][1]
  frames.push({
    phase: 'done', activeLine: at('return best[0][1]'),
    message: `Starting at pile 0 with limit 1, the first player can guarantee ${result} stones.`,
    snapshot: snap({ cell: [0, 1], choice: null }),
  })
  return { input: piles, result, frames }
}
