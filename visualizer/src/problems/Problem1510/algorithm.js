export const phases = [
  { id: 'setup', label: 'Set up', description: 'With zero stones, the player to move has no legal move and loses.' },
  { id: 'pos', label: 'Stone count', description: 'Decide whether the player to move wins with this many stones.' },
  { id: 'move', label: 'Try a square', description: 'Remove k times k stones. If the opponent is left in a losing position, this stone count wins.' },
  { id: 'win', label: 'Winning position', description: 'A move leaves the opponent losing, so this stone count is a win.' },
  { id: 'lose', label: 'Losing position', description: 'Every square move leaves the opponent winning, so this stone count is a loss.' },
  { id: 'done', label: 'Complete', description: 'Report whether the first player wins with n stones.' },
]

export function parseInput(text) {
  const trimmed = String(text).trim()
  if (!/^\d+$/.test(trimmed)) throw new Error('Enter a whole number of stones, from 1 to 60.')
  const n = Number(trimmed)
  if (n < 1 || n > 60) throw new Error('Enter a number of stones from 1 to 60.')
  return n
}

export const code = `first player wins with n stones (n):
  win[0] = false
  for stones from 1 to n:
    win[stones] = false
    for each k with k * k <= stones:
      if win[stones - k * k] is false:
        win[stones] = true
        stop checking squares
  return win[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def winner_square_game(n):
    win = [False] * (n + 1)
    for stones in range(1, n + 1):
        k = 1
        while k * k <= stones:
            if not win[stones - k * k]:
                win[stones] = True
                break
            k += 1
    return win[n]
`

const SPOT = {
  setup: ['win[0] = false', 'win = [False]'],
  pos: ['for stones from 1 to n', 'for stones in range(1, n + 1)'],
  move: ['if win[stones - k * k] is false', 'if not win[stones - k * k]'],
  win: ['win[stones] = true', 'win[stones] = True'],
  lose: ['win[stones] = false', 'while k * k <= stones'],
  done: ['return win[n]', 'return win[n]'],
}
function where(key) {
  const [pseudo, py] = SPOT[key]
  return {
    activeLine: code.findIndex(c => c.text.includes(pseudo)) + 1,
    pythonLine: python.split('\n').findIndex(l => l.includes(py)) + 1,
  }
}

export function buildTrace(n) {
  const win = Array(n + 1).fill(false)
  const frames = []
  const emit = (phase, key, message, snapshot) => frames.push({ phase, ...where(key), message, snapshot: { ...snapshot, win: [...win] } })

  emit('setup', 'setup', `Zero stones is a loss for the player to move. Positions are filled in from 1 up to ${n}.`, { stones: 0, k: null, next: null })
  for (let stones = 1; stones <= n; stones++) {
    emit('pos', 'pos', `Stones = ${stones}. Try removing k * k stones for each square that fits.`, { stones, k: null, next: null })
    let won = false
    for (let k = 1; k * k <= stones; k++) {
      const next = stones - k * k
      if (!win[next]) {
        win[stones] = true
        won = true
        emit('win', 'win', `Removing ${k * k} leaves ${next} stones, a losing position for the opponent. So ${stones} is a win.`, { stones, k, next })
        break
      }
      emit('move', 'move', `Removing ${k * k} leaves ${next} stones, which is a win for the opponent. Keep checking.`, { stones, k, next })
    }
    if (!won) emit('lose', 'lose', `No square leaves the opponent losing, so ${stones} is a losing position.`, { stones, k: null, next: null })
  }
  emit('done', 'done', `${win[n] ? 'The first player wins' : 'The first player loses'} with ${n} stones.`, { stones: n, k: null, next: null })
  return { input: n, result: win[n], frames }
}
