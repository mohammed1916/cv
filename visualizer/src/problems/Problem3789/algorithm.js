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

// Pseudocode and Python are both 1:1 with the frame line numbers. Lookups throw if a text is missing.
export const code = [
  'minimum cost to supply need1 and need2',
  'best cost is unset',
  'for each count both of combined units in 0, need1, need2',
  'only1 is the larger of 0 and need1 minus both',
  'only2 is the larger of 0 and need2 minus both',
  'total is both times costBoth plus only1 times cost1 plus only2 times cost2',
  'if best is unset or total is less than best',
  'then best becomes total',
  'return best',
].map((text, index) => ({ line: index + 1, text }))

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
const PYTHON_LINES = python.trim().split('\n')

export function lineOf(text) {
  const found = code.find(line => line.text === text)
  if (!found) throw new Error(`Missing pseudocode line: ${text}`)
  return found.line
}

export function pythonLineOf(text) {
  const index = PYTHON_LINES.findIndex(line => line.trim() === text)
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const L = {
  start: lineOf('best cost is unset'),
  candidate: lineOf('for each count both of combined units in 0, need1, need2'),
  only1: lineOf('only1 is the larger of 0 and need1 minus both'),
  only2: lineOf('only2 is the larger of 0 and need2 minus both'),
  total: lineOf('total is both times costBoth plus only1 times cost1 plus only2 times cost2'),
  compare: lineOf('if best is unset or total is less than best'),
  update: lineOf('then best becomes total'),
  done: lineOf('return best'),
}
const P = {
  start: pythonLineOf('best = None'),
  candidate: pythonLineOf('for both in (0, need1, need2):'),
  only1: pythonLineOf('only1 = max(0, need1 - both)'),
  only2: pythonLineOf('only2 = max(0, need2 - both)'),
  total: pythonLineOf('total = both * cost_both + only1 * cost1 + only2 * cost2'),
  compare: pythonLineOf('if best is None or total < best:'),
  update: pythonLineOf('best = total'),
  done: pythonLineOf('return best'),
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// Each frame carries: the candidate under test, every finished candidate row, the best row index and the winning plan.
export function buildTrace({ cost1, cost2, costBoth, need1, need2 }) {
  const frames = []
  const rows = []
  let best = null
  let bestIndex = null
  let plan = null
  const push = frame => frames.push({
    need1, need2, cost1, cost2, costBoth,
    candidate: null, rows: rows.map(row => ({ ...row })), best, bestIndex,
    plan: plan ? { ...plan } : null, both: -1, total: null,
    ...frame,
  })

  push({ pythonLine: P.start, phase: 'start', activeLine: L.start, message: 'Start with no best cost. The plan is not known yet.' })

  for (const both of [0, need1, need2]) {
    const index = rows.length
    const only1 = Math.max(0, need1 - both)
    const only2 = Math.max(0, need2 - both)
    const coverage1 = both + only1
    const coverage2 = both + only2
    const candidate = {
      index, both, only1, only2, coverage1, coverage2,
      excess1: coverage1 - need1, excess2: coverage2 - need2,
      costBoth: both * costBoth, cost1Part: only1 * cost1, cost2Part: only2 * cost2,
    }
    const total = candidate.costBoth + candidate.cost1Part + candidate.cost2Part
    candidate.total = total

    push({ pythonLine: P.candidate, phase: 'candidate', activeLine: L.candidate, both, candidate: { ...candidate, total: null, stage: 'candidate' },
      message: `Try ${plural(both, 'combined unit')}, which covers ${both} of each requirement.` })
    push({ pythonLine: P.only1, phase: 'split', activeLine: L.only1, both, candidate: { ...candidate, total: null, stage: 'only1' },
      message: `Need 1 still needs ${only1} single unit${only1 === 1 ? '' : 's'}: ${need1} minus ${both}.` })
    push({ pythonLine: P.only2, phase: 'split', activeLine: L.only2, both, candidate: { ...candidate, total: null, stage: 'only2' },
      message: `Need 2 still needs ${only2} single unit${only2 === 1 ? '' : 's'}: ${need2} minus ${both}.` })
    push({ pythonLine: P.total, phase: 'cost', activeLine: L.total, both, total, candidate: { ...candidate, stage: 'cost' },
      message: `Total = ${candidate.costBoth} + ${candidate.cost1Part} + ${candidate.cost2Part} = ${total}.` })

    const better = best === null || total < best
    rows.push({ ...candidate, isBest: false, wasBetter: better })
    push({ pythonLine: P.compare, phase: 'compare', activeLine: L.compare, both, total, candidate: { ...candidate, stage: 'compare', better },
      message: better
        ? `${total} is ${best === null ? 'the first cost' : `below ${best}`}, so it is a new candidate best.`
        : `${total} is not below the best ${best}; keep the earlier plan.` })
    if (better) {
      best = total
      bestIndex = index
      for (const row of rows) row.isBest = false
      rows[index].isBest = true
      plan = { both, only1, only2, coverage1, coverage2, excess1: candidate.excess1, excess2: candidate.excess2, total }
      push({ pythonLine: P.update, phase: 'update', activeLine: L.update, both, total, candidate: { ...candidate, stage: 'update' },
        message: `Save this plan: ${plural(both, 'combined unit')} plus ${only1} and ${only2} single units, total ${total}.` })
    }
  }

  push({ pythonLine: P.done, phase: 'done', activeLine: L.done, both: plan.both, total: best, candidate: null,
    message: `Minimum cost is ${best}. The winning plan is kept above.` })
  return { input: { cost1, cost2, costBoth, need1, need2 }, result: best, plan, frames }
}
