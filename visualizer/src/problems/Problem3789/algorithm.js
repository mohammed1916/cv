const COST = { min: 1, max: 1000000 }
const NEED = { min: 0, max: 1000000000 }

function integerIn(value, { min, max }) {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with cost1, cost2, costBoth, need1 and need2.')
  const { cost1, cost2, costBoth, need1, need2 } = input
  for (const [name, value] of [['cost1', cost1], ['cost2', cost2], ['costBoth', costBoth]]) {
    if (!integerIn(value, COST)) throw new Error(`${name} is an integer from 1 to 1000000.`)
  }
  for (const [name, value] of [['need1', need1], ['need2', need2]]) {
    if (!integerIn(value, NEED)) throw new Error(`${name} is an integer from 0 to 1000000000.`)
  }
  return { cost1, cost2, costBoth, need1, need2 }
}

export function buildTrace({ cost1, cost2, costBoth, need1, need2 }) {
  const frames = []
  let best = null
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('best cost is unset'), both: -1, total: null, best: null, message: 'Start with no best cost.' })
  for (const both of [0, need1, need2]) {
    const only1 = Math.max(0, need1 - both)
    const only2 = Math.max(0, need2 - both)
    const total = both * costBoth + only1 * cost1 + only2 * cost2
    frames.push({ pythonLine: 3, phase: 'candidate', activeLine: L('for each number both'), both, total: null, best, message: `Try ${both} unit${both === 1 ? '' : 's'} that supply both requirements.` })
    frames.push({ pythonLine: 5, phase: 'split', activeLine: L('only2 is the larger'), both, total: null, best, message: `Buy ${only1} unit${only1 === 1 ? '' : 's'} for requirement 1 and ${only2} for requirement 2.` })
    frames.push({ pythonLine: 6, phase: 'cost', activeLine: L('total is'), both, total, best, message: `Total cost is ${total}.` })
    const better = best === null || total < best
    frames.push({ pythonLine: 7, phase: 'compare', activeLine: L('if best is unset'), both, total, best, message: better ? `${total} beats ${best === null ? 'no cost yet' : best}.` : `${total} is not below ${best}.` })
    if (better) {
      best = total
      frames.push({ pythonLine: 8, phase: 'update', activeLine: L('then best becomes total'), both, total, best, message: `Keep ${total} as the best cost.` })
    }
  }
  frames.push({ pythonLine: 9, phase: 'done', activeLine: L('return best'), both: -1, total: null, best, message: `Minimum cost is ${best}.` })
  return { input: { cost1, cost2, costBoth, need1, need2 }, result: best, frames }
}

export const code = `minimum cost to supply need1 and need2
  best cost is unset
  for each number both of combined units in 0, need1, need2
    only1 is the larger of 0 and need1 minus both
    only2 is the larger of 0 and need2 minus both
    total is both times costBoth plus only1 times cost1 plus only2 times cost2
    if best is unset or total is less than best then best becomes total
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_cost(cost1, cost2, cost_both, need1, need2):
    best = None
    for both in (0, need1, need2):
        only1 = max(0, need1 - both)
        only2 = max(0, need2 - both)
        total = both * cost_both + only1 * cost1 + only2 * cost2
        if best is None or total < best:
            best = total
    return best
`
