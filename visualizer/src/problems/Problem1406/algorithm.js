export const phases = [
  { id: 'start', label: 'Start', description: 'With no stones left, the player to move gains nothing further, so the best value is 0.' },
  { id: 'option', label: 'Try a take', description: 'Taking 1 to 3 leading stones earns their sum, then the opponent starts the smaller suffix.' },
  { id: 'store', label: 'Store best', description: 'Keep the best advantage for the player to move from this suffix.' },
  { id: 'decide', label: 'Decide', description: 'The sign of the advantage from stone 0 decides the winner.' },
]

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 12 || !values.every(v => Number.isInteger(v) && Math.abs(v) <= 50)) {
    throw new Error('Use a JSON array of 1 to 12 integers from -50 to 50, such as [4, -1, 6].')
  }
  return values
}

export function buildTrace(values) {
  const n = values.length
  const best = Array(n + 1).fill(0)
  const shown = () => best.map(v => (v === -Infinity ? null : v))
  const snap = (start, extra = {}) => ({ values, start, best: shown(), ...extra })
  const frames = [{
    phase: 'start', activeLine: L('const best = Array'), pythonLine: PY('best = [0]'), snapshot: snap(null),
    message: `${n} stones. best[${n}] = 0 because no stones remain. Fill best from the right end toward stone 0.`,
  }]
  for (let start = n - 1; start >= 0; start--) {
    best[start] = -Infinity
    let total = 0
    for (let take = 1; take <= 3 && start + take <= n; take++) {
      total += values[start + take - 1]
      const value = total - best[start + take]
      frames.push({
        phase: 'option', activeLine: L('total += values'), pythonLine: PY('total += values'), snapshot: snap(start, { take, total, option: value }),
        message: `From stone ${start}, taking ${take} earns ${total}. The opponent then gets advantage ${best[start + take]} from stone ${start + take}, so this option is worth ${value}.`,
      })
      best[start] = Math.max(best[start], value)
    }
    frames.push({
      phase: 'store', activeLine: L('best[start] = Math.max'), pythonLine: PY('best[start] = max'), snapshot: snap(start),
      message: `Best advantage for the player to move at stone ${start} is ${best[start]}.`,
    })
  }
  const result = best[0] > 0 ? 'Alice' : best[0] < 0 ? 'Bob' : 'Tie'
  frames.push({
    phase: 'decide', activeLine: L('if (best[0] > 0)'), pythonLine: PY("return 'Tie'"), snapshot: snap(0, { winner: result }),
    message: `Alice moves first with advantage ${best[0]}. Result: ${result}.`,
  })
  return { input: values, result, frames }
}

export const code = `function stoneGameIII(values) {
  const n = values.length
  const best = Array(n + 1).fill(0)
  for (let start = n - 1; start >= 0; start--) {
    best[start] = -Infinity
    let total = 0
    for (let take = 1; take <= 3 && start + take <= n; take++) {
      total += values[start + take - 1]
      best[start] = Math.max(best[start], total - best[start + take])
    }
  }
  if (best[0] > 0) return 'Alice'
  if (best[0] < 0) return 'Bob'
  return 'Tie'
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def stone_game_iii(values):
    n = len(values)
    best = [0] * (n + 1)
    for start in range(n - 1, -1, -1):
        total = 0
        best[start] = float('-inf')
        for take in range(1, 4):
            if start + take > n:
                break
            total += values[start + take - 1]
            best[start] = max(best[start], total - best[start + take])
    if best[0] > 0:
        return 'Alice'
    if best[0] < 0:
        return 'Bob'
    return 'Tie'
`
const PY = s => python.split('\n').findIndex(l => l.includes(s)) + 1
