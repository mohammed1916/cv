const CODE_TEXT = `list the runs of potholes, each run as a length
sort the runs by length in decreasing order
left = budget, repaired = 0
for each run in decreasing length
  if the run fits the budget whole, it costs length plus one
    repair the whole run and pay length plus one from left
  otherwise
    if at least two remain then repair left minus one potholes from this run
    stop after the partial repair
return repaired`

const PYTHON_TEXT = `def max_potholes(road, budget):
    runs = sorted((len(part) for part in road.split('.') if part), reverse=True)
    repaired = 0
    left = budget
    for length in runs:
        if left >= length + 1:
            left -= length + 1
            repaired += length
        else:
            if left >= 2:
                repaired += left - 1
            break
    return repaired`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON_TEXT
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`No pseudocode line: ${s}`); return i + 1 }
const PY = s => { const i = python.split('\n').findIndex(t => t.includes(s)); if (i < 0) throw new Error(`No python line: ${s}`); return i + 1 }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with road and budget.')
  const { road, budget } = input
  if (typeof road !== 'string' || road.length < 1 || road.length > 24 || !/^[x.]+$/.test(road)) throw new Error('road has 1 to 24 characters, each x or period.')
  if (!Number.isInteger(budget) || budget < 0 || budget > 60) throw new Error('budget is an integer from 0 to 60.')
  return { road, budget }
}

export function buildTrace({ road, budget }) {
  const frames = []
  const runs = []
  let start = -1
  for (let i = 0; i <= road.length; i++) {
    const isPothole = i < road.length && road[i] === 'x'
    if (isPothole && start < 0) start = i
    if (!isPothole && start >= 0) { runs.push({ start, length: i - start }); start = -1 }
  }
  const order = [...runs].sort((a, b) => b.length - a.length)
  let left = budget
  let repaired = 0
  frames.push({ phase: 'start', activeLine: L('list the runs'), pythonLine: PY('runs = sorted'), run: null, left, repaired, order: order.map(r => r.length), message: `${runs.length} run${runs.length === 1 ? '' : 's'} of potholes; budget ${budget}.` })
  for (const run of order) {
    if (left >= run.length + 1) {
      left -= run.length + 1
      repaired += run.length
      frames.push({ phase: 'full', activeLine: L('repair the whole run'), pythonLine: PY('repaired += length'), run: { start: run.start, length: run.length, taken: run.length }, left, repaired, order: order.map(r => r.length), message: `Fix the whole run of ${run.length} for ${run.length + 1}; ${left} budget left.` })
    } else {
      const part = left >= 2 ? left - 1 : 0
      repaired += part
      frames.push({ phase: 'partial', activeLine: L('repair left minus one'), pythonLine: PY('repaired += left - 1'), run: { start: run.start, length: run.length, taken: part }, left: 0, repaired, order: order.map(r => r.length), message: part > 0 ? `Only ${left} budget left: fix ${part} potholes of this run for ${part + 1}.` : `Only ${left} budget left, which cannot pay for any group.` })
      frames.push({ phase: 'stop', activeLine: L('stop after the partial'), pythonLine: PY('break'), run: null, left: 0, repaired, order: order.map(r => r.length), message: 'The next run cannot be fixed whole with the leftover budget, so stop.' })
      break
    }
  }
  frames.push({ phase: 'done', activeLine: L('return repaired'), pythonLine: PY('return repaired'), run: null, left, repaired, order: order.map(r => r.length), message: `At most ${repaired} potholes can be fixed.` })
  return { input: { road, budget }, result: repaired, frames }
}
