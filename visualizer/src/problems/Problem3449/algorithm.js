export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.points)) throw new Error('Use an object with points and m.')
  const { points, m } = input
  if (points.length < 1 || points.length > 4 || !points.every(p => Number.isInteger(p) && p >= 1 && p <= 9)) throw new Error('points has 1 to 4 integers from 1 to 9.')
  if (!Number.isInteger(m) || m < 1 || m > 6) throw new Error('m is an integer from 1 to 6.')
  return { points, m }
}

// Every legal walk, enumerated: the first move enters index 0, later moves step to a neighbour inside the board.
export function buildTrace({ points, m }) {
  const n = points.length
  const score = Array(n).fill(0)
  const frames = []
  let best = -1
  let bestScores = null
  const frame = (phase, at, line, message) => frames.push({ pythonLine: line, phase, activeLine: L(phase === 'leaf' ? 'record the minimum' : phase === 'move' ? 'for each neighbour' : 'enter index 0'), at, scores: [...score], best, message })

  const evaluate = () => {
    const value = Math.min(...score)
    if (value > best) {
      best = value
      bestScores = [...score]
    }
    frame('leaf', -1, 6, `Minimum ${value}; best so far ${best}.`)
  }
  const walk = (pos, left) => {
    const options = [pos - 1, pos + 1].filter(q => q >= 0 && q < n)
    if (left === 0 || options.length === 0) return evaluate()
    for (const q of options) {
      score[q] += points[q]
      frame('move', q, 4, `Move to index ${q}, adding ${points[q]}.`)
      walk(q, left - 1)
      score[q] -= points[q]
    }
  }
  score[0] += points[0]
  frame('start', 0, 2, `First move enters index 0, adding ${points[0]}.`)
  walk(0, m - 1)
  frames.push({ pythonLine: 8, phase: 'done', activeLine: L('return the best'), at: -1, scores: bestScores || Array(n).fill(0), best, message: `Maximum possible minimum is ${best}.` })
  return { input: { points, m }, frames, result: best }
}

export const code = `enter index 0 with one move, adding points[0]
for each walk of the remaining moves
  for each neighbour inside the board
    add its points, recurse, then undo
  record the minimum of gameScore
return the best minimum`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_min_game_score(points, m):
    n = len(points)
    score = [0] * n
    best = -1

    def walk(pos, left):
        nonlocal best
        options = [q for q in (pos - 1, pos + 1) if 0 <= q < n]
        if left == 0 or not options:
            best = max(best, min(score))
            return
        for q in options:
            score[q] += points[q]
            walk(q, left - 1)
            score[q] -= points[q]

    score[0] += points[0]
    walk(0, m - 1)
    return best
`
