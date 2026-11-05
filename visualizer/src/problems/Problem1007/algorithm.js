export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"tops": [2, 1], "bottoms": [1, 2]}.')
  const { tops, bottoms } = input
  const valid = row => Array.isArray(row) && row.length >= 1 && row.length <= 12 && row.every(v => Number.isInteger(v) && v >= 1 && v <= 6)
  if (!valid(tops) || !valid(bottoms)) throw new Error('tops and bottoms are lists of 1 to 12 integers from 1 to 6.')
  if (tops.length !== bottoms.length) throw new Error('tops and bottoms must have the same length.')
  return { tops, bottoms }
}

export function buildTrace({ tops, bottoms }) {
  const n = tops.length
  const candidates = [...new Set([tops[0], bottoms[0]])]
  const frames = []
  let best = Infinity
  const shown = () => (best === Infinity ? null : best)
  frames.push({ phase: 'start', activeLine: L('const candidates = [...new Set'), pythonLine: P('candidates = {'), message: `Domino 0 offers ${candidates.join(' and ')} as the only possible shared value.`, state: { target: null, index: -1, topMoves: 0, bottomMoves: 0, best: null, blocked: false, candidates } })

  for (const target of candidates) {
    let topMoves = 0
    let bottomMoves = 0
    let blocked = false
    frames.push({ phase: 'candidate', activeLine: L('for (const target of candidates)'), pythonLine: P('for target in'), message: `Try ${target} as the shared value for the whole row.`, state: { target, index: -1, topMoves, bottomMoves, best: shown(), blocked, candidates } })
    for (let i = 0; i < n; i++) {
      if (tops[i] !== target && bottoms[i] !== target) {
        blocked = true
        frames.push({ phase: 'scan', activeLine: L('blocked = true'), pythonLine: P('blocked = True'), message: `Domino ${i} shows ${tops[i]} and ${bottoms[i]}, so ${target} cannot appear on it. This target is impossible.`, state: { target, index: i, topMoves, bottomMoves, best: shown(), blocked, candidates } })
        break
      }
      if (tops[i] !== target) topMoves++
      if (bottoms[i] !== target) bottomMoves++
      frames.push({ phase: 'scan', activeLine: L('if (tops[i] !== target) topMoves++'), pythonLine: P('top_moves +='), message: `Domino ${i} contains ${target}. Top row needs ${topMoves} rotations so far; bottom row needs ${bottomMoves}.`, state: { target, index: i, topMoves, bottomMoves, best: shown(), blocked, candidates } })
    }
    if (!blocked) {
      best = Math.min(best, topMoves, bottomMoves)
      frames.push({ phase: 'record', activeLine: L('if (!blocked) best = Math.min'), pythonLine: P('best = min'), message: `${target} works. Its cheapest side costs ${Math.min(topMoves, bottomMoves)} rotation(s); best so far is ${best}.`, state: { target, index: n - 1, topMoves, bottomMoves, best: shown(), blocked, candidates } })
    }
  }

  const result = best === Infinity ? -1 : best
  frames.push({ phase: 'done', activeLine: L('return best === Infinity'), pythonLine: P('return best'), message: `Answer: ${result}.`, state: { target: null, index: -1, topMoves: 0, bottomMoves: 0, best: result, blocked: false, candidates } })
  return { input: { tops, bottoms }, result, frames }
}

export const code = `function minDominoRotations(tops, bottoms) {
  const candidates = [...new Set([tops[0], bottoms[0]])]
  let best = Infinity
  for (const target of candidates) {
    let topMoves = 0
    let bottomMoves = 0
    let blocked = false
    for (let i = 0; i < tops.length; i++) {
      if (tops[i] !== target && bottoms[i] !== target) {
        blocked = true
        break
      }
      if (tops[i] !== target) topMoves++
      if (bottoms[i] !== target) bottomMoves++
    }
    if (!blocked) best = Math.min(best, topMoves, bottomMoves)
  }
  return best === Infinity ? -1 : best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def min_domino_rotations(tops, bottoms):
    candidates = {tops[0], bottoms[0]}
    best = float("inf")
    for target in candidates:
        top_moves = bottom_moves = 0
        blocked = False
        for i in range(len(tops)):
            if tops[i] != target and bottoms[i] != target:
                blocked = True
                break
            if tops[i] != target:
                top_moves += 1
            if bottoms[i] != target:
                bottom_moves += 1
        if not blocked:
            best = min(best, top_moves, bottom_moves)
    return best if best != float("inf") else -1
`
