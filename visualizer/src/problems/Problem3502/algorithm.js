export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || !Array.isArray(input.cost)) throw new Error('Use an object such as {"cost": [5,3,4]}.')
  const { cost } = input
  if (cost.length < 1 || cost.length > 100) throw new Error('cost needs 1 to 100 entries.')
  if (cost.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each cost is an integer from 1 to 100.')
  return { cost }
}

export function buildTrace({ cost }) {
  const input = { cost }
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), index: -1, best: null, message: 'No payment is known yet. Track the cheapest cost seen so far.' }]
  let best = null
  const answer = []
  for (let i = 0; i < cost.length; i++) {
    if (best === null || cost[i] < best) {
      best = cost[i]
      frames.push({ phase: 'update', activeLine: L('if best is nothing'), index: i, best, message: `Cost ${cost[i]} at position ${i} is the new cheapest.` })
    } else {
      frames.push({ phase: 'keep', activeLine: L('if best is nothing'), index: i, best, message: `Cost ${cost[i]} is not cheaper, so the cheapest stays ${best}.` })
    }
    answer.push(best)
    frames.push({ phase: 'record', activeLine: L('add best to the end'), index: i, best, message: `Position ${i} can be reached for ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), index: cost.length - 1, best, message: `Answers: ${answer.join(', ')}.` })
  return { input, result: answer, frames }
}

export const code = `minimum cost to reach every position
  set best to nothing
  set answer to an empty list
  for each index i from 0 to the last index
    if best is nothing or cost[i] is smaller than best
      set best to cost[i]
    add best to the end of answer
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_costs(cost):
    answer = []
    best = None
    for value in cost:
        if best is None or value < best:
            best = value
        answer.append(best)
    return answer
`
