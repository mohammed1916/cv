export const python = `def maxManhattanDistance(s, k):
    best = 0
    for vertical, horizontal in (("N", "E"), ("N", "W"), ("S", "E"), ("S", "W")):
        helpful = 0
        harmful = 0
        for steps, move in enumerate(s, 1):
            if move in (vertical, horizontal):
                helpful += 1
            else:
                harmful += 1
            reach = helpful - harmful + 2 * min(k, harmful)
            best = max(best, min(steps, reach))
    return best
`

const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const code = `function maxManhattanDistance(s, k) {
  let best = 0
  for (const [vertical, horizontal] of [['N', 'E'], ['N', 'W'], ['S', 'E'], ['S', 'W']]) {
    let helpful = 0
    let harmful = 0
    for (let steps = 1; steps <= s.length; steps++) {
      const move = s[steps - 1]
      if (move === vertical || move === horizontal) helpful++
      else harmful++
      const reach = helpful - harmful + 2 * Math.min(k, harmful)
      best = Math.max(best, Math.min(steps, reach))
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function parseInput(text) {
  const data = typeof text === 'string' ? JSON.parse(text) : text
  if (!data || typeof data !== 'object') throw new Error('Use a JSON object with s and k.')
  const { s, k } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 12) throw new Error('s must be a string of 1 to 12 characters for this visualization.')
  if (![...s].every(ch => 'NSEW'.includes(ch))) throw new Error('s may contain only N, S, E and W.')
  if (!Number.isInteger(k) || k < 0 || k > s.length) throw new Error('k must be an integer from 0 to s.length.')
  return { s, k }
}

export function buildTrace(input) {
  const { s, k } = input
  const corners = [['N', 'E'], ['N', 'W'], ['S', 'E'], ['S', 'W']]
  const frames = []
  let best = 0
  frames.push({ phase: 'setup', activeLine: L('let best = 0'), pythonLine: P('best = 0'), moves: s, corner: null, steps: 0, helpful: 0, harmful: 0, best,
    message: `Start with best = 0. Try each diagonal corner; at most ${k} moves can be changed.` })
  for (const [vertical, horizontal] of corners) {
    const corner = [vertical, horizontal]
    let helpful = 0
    let harmful = 0
    frames.push({ phase: 'corner', activeLine: L('for (const [vertical'), pythonLine: P('for vertical, horizontal'), moves: s, corner, steps: 0, helpful, harmful, best,
      message: `Corner ${vertical}${horizontal}: moves ${vertical} or ${horizontal} help, and the other two hurt.` })
    for (let steps = 1; steps <= s.length; steps++) {
      const move = s[steps - 1]
      const toward = move === vertical || move === horizontal
      if (toward) helpful++
      else harmful++
      frames.push({ phase: 'walk', activeLine: L('if (move === vertical'), pythonLine: P(toward ? 'helpful += 1' : 'harmful += 1'), moves: s, corner, steps, helpful, harmful, best,
        message: `After ${steps} move(s), move ${move} ${toward ? 'helps' : 'hurts'} this corner. Helpful ${helpful}, harmful ${harmful}.` })
      const reach = helpful - harmful + 2 * Math.min(k, harmful)
      frames.push({ phase: 'reach', activeLine: L('const reach ='), pythonLine: P('reach = helpful'), moves: s, corner, steps, helpful, harmful, reach, best,
        message: `Flipping up to ${Math.min(k, harmful)} hurting moves reaches distance ${reach}.` })
      const candidate = Math.min(steps, reach)
      best = Math.max(best, candidate)
      frames.push({ phase: 'record', activeLine: L('best = Math.max'), pythonLine: P('best = max(best'), moves: s, corner, steps, helpful, harmful, reach, candidate, best,
        message: `The distance cannot exceed ${steps} moves, so this step gives ${candidate}. Best is now ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), moves: s, corner: null, steps: s.length, helpful: 0, harmful: 0, best,
    message: `Return ${best}, the largest Manhattan distance reachable at any point.` })
  return { input, result: best, frames }
}
