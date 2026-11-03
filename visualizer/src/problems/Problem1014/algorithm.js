export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"values": [8, 1, 5, 2, 6]}.')
  const { values } = input
  if (!Array.isArray(values) || values.length < 2 || values.length > 12 || !values.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('values is a list of 2 to 12 integers from 1 to 1000.')
  return { values }
}

export function buildTrace({ values }) {
  let left = values[0]
  let leftIndex = 0
  let best = -Infinity
  let bestPair = null
  const frames = [{ phase: 'start', activeLine: L('left = values[0]'), pythonLine: P('left = values'), message: `Seed the best left contribution with index 0: value ${values[0]} plus position 0.`, state: { j: -1, score: null, best: null, bestPair: null, left, leftIndex } }]

  for (let j = 1; j < values.length; j++) {
    const score = left + values[j] - j
    if (score > best) {
      best = score
      bestPair = [leftIndex, j]
    }
    frames.push({ phase: 'score', activeLine: L('best = max(best, left'), pythonLine: P('best = max'), message: `Pair (${leftIndex}, ${j}) scores ${left} + ${values[j]} - ${j} = ${score}. Best so far is ${best}.`, state: { j, score, best, bestPair, left, leftIndex } })
    if (values[j] + j > left) {
      left = values[j] + j
      leftIndex = j
    }
    frames.push({ phase: 'left', activeLine: L('left = max(left'), pythonLine: P('left = max(left'), message: `Index ${j} can serve as a left spot later, with contribution ${values[j] + j}. The strongest left contribution is now ${left}.`, state: { j, score, best, bestPair, left, leftIndex } })
  }

  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), message: `Best pair score is ${best}.`, state: { j: values.length - 1, score: null, best, bestPair, left, leftIndex } })
  return { input: { values }, result: best, frames }
}

export const code = `best sightseeing score (values):
  left = values[0] + 0, left index = 0
  best = negative infinity
  for j from 1 to the last index:
    best = max(best, left + values[j] - j)
    left = max(left, values[j] + j), remembering its index
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def max_sightseeing_score(values):
    left = values[0]
    best = float('-inf')
    for j in range(1, len(values)):
        best = max(best, left + values[j] - j)
        left = max(left, values[j] + j)
    return best
`
