export const phases = [
  { id: 'base', label: 'Single stones', description: 'A one-stone interval ends the game with nothing to score, so its value is 0.' },
  { id: 'choose', label: 'Choose a side', description: 'Remove the left or right stone. The remover scores the sum of what is left, minus the best the opponent can then get.' },
  { id: 'done', label: 'Result', description: 'The full row gives the best score difference for the first player.' },
]

export function parseInput(text) {
  const stones = JSON.parse(text)
  if (!Array.isArray(stones) || stones.length < 1 || stones.length > 16 || !stones.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Enter a JSON array of 1 to 16 integers from 1 to 100, such as [4, 9, 2, 7].')
  return stones
}

export const code = `stone game vii (stones):
  prefix[k] = sum of the first k stones
  best[i][i] = 0 for every single stone
  for length from 2 to n:
    for each start i, with end j = i + length - 1:
      take left: prefix sum of i+1..j - best[i+1][j]
      take right: prefix sum of i..j-1 - best[i][j-1]
      best[i][j] = max of the two
  return best[0][n-1]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def stone_game_vii(stones):
    n = len(stones)
    prefix = [0]
    for s in stones:
        prefix.append(prefix[-1] + s)
    best = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            take_left = prefix[j + 1] - prefix[i + 1] - best[i + 1][j]
            take_right = prefix[j] - prefix[i] - best[i][j - 1]
            best[i][j] = max(take_left, take_right)
    return best[0][n - 1]
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

export function buildTrace(stones) {
  const n = stones.length
  const prefix = [0]
  stones.forEach(s => prefix.push(prefix[prefix.length - 1] + s))
  const best = Array.from({ length: n }, () => Array(n).fill(0))
  const table = () => best.map(row => [...row])
  const frames = [{ phase: 'base', ...at('best[i][i] = 0', 'best = [[0] * n'), snapshot: { stones, prefix, table: table(), interval: null, takeLeft: null, takeRight: null }, message: `Every single stone is worth 0 for the player who must take it, so the diagonal starts at 0.` }]
  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1
      const takeLeft = prefix[j + 1] - prefix[i + 1] - best[i + 1][j]
      const takeRight = prefix[j] - prefix[i] - best[i][j - 1]
      best[i][j] = Math.max(takeLeft, takeRight)
      frames.push({ phase: 'choose', ...at('best[i][j] = max', 'best[i][j] = max(take_left'), snapshot: { stones, prefix, table: table(), interval: [i, j], takeLeft, takeRight }, message: `Interval ${i}..${j}: removing the left stone scores ${takeLeft}, removing the right stone scores ${takeRight}. Keep the larger, which is ${best[i][j]}.` })
    }
  }
  const result = n === 1 ? 0 : best[0][n - 1]
  frames.push({ phase: 'done', ...at('return best[0]', 'return best[0][n - 1]'), snapshot: { stones, prefix, table: table(), interval: [0, n - 1], takeLeft: null, takeRight: null }, message: `The full row scores ${result} for the first player.` })
  return { input: stones, result, frames }
}
