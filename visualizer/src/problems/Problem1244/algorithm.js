export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 20) throw new Error('Use an object with ops, 1 to 20 operations.')
  for (const op of input.ops) {
    if (op[0] === 'add' && Number.isInteger(op[1]) && op[1] > 0 && Number.isInteger(op[2]) && op[2] > 0 && op[2] <= 100) continue
    if (op[0] === 'top' && Number.isInteger(op[1]) && op[1] > 0) continue
    if (op[0] === 'reset' && Number.isInteger(op[1]) && op[1] > 0) continue
    throw new Error('Use ["add", id, score], ["top", k] or ["reset", id] with positive integers.')
  }
  return input
}

export function buildTrace({ ops }) {
  const scores = new Map()
  const answers = []
  const state = () => [...scores].map(([id, s]) => `player ${id}: ${s}`)
  const frames = [{ phase: 'start', pythonLine: PL('scores = {}'), activeLine: L('const scores = new Map'), state: [], message: 'The board is empty.' }]
  for (const op of ops) {
    if (op[0] === 'add') {
      scores.set(op[1], (scores.get(op[1]) || 0) + op[2])
      frames.push({ phase: 'add', pythonLine: PL('scores[op[1]] = scores.get'), activeLine: L('scores.set('), state: state(), message: `Player ${op[1]} gains ${op[2]}.` })
    } else if (op[0] === 'top') {
      const best = [...scores.values()].sort((a, b) => b - a).slice(0, op[1])
      const total = best.reduce((a, b) => a + b, 0)
      answers.push(total)
      frames.push({ phase: 'top', pythonLine: PL('answers.append(sum(best))'), activeLine: L('.sort((a, b)'), state: [...state(), `top ${op[1]} sum: ${total}`], message: `The top ${op[1]} scores add to ${total}.` })
    } else {
      scores.delete(op[1])
      frames.push({ phase: 'reset', pythonLine: PL('scores.pop(op[1], None)'), activeLine: L('scores.delete('), state: state(), message: `Player ${op[1]} is removed.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: PL('return answers'), activeLine: L('return answers'), state: state(), message: 'All operations are finished.' })
  return { input: { ops }, result: answers, frames }
}

export const code = `function leaderboard(ops) {
  const scores = new Map()
  const answers = []
  for (const op of ops) {
    if (op[0] === 'add') {
      scores.set(op[1], (scores.get(op[1]) ?? 0) + op[2])
    } else if (op[0] === 'top') {
      const best = [...scores.values()].sort((a, b) => b - a).slice(0, op[1])
      answers.push(best.reduce((a, b) => a + b, 0))
    } else {
      scores.delete(op[1])
    }
  }
  return answers
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def leaderboard(ops):
    scores = {}
    answers = []
    for op in ops:
        if op[0] == "add":
            scores[op[1]] = scores.get(op[1], 0) + op[2]
        elif op[0] == "top":
            best = sorted(scores.values(), reverse=True)[: op[1]]
            answers.append(sum(best))
        else:
            scores.pop(op[1], None)
    return answers
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
