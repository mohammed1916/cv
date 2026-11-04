const CODE = [
  'let r = 0, e = Infinity',
  'const costs = []',
  'for (let i = 0; i < regular.length; i++) {',
  '  const newR = Math.min(r, e) + regular[i]',
  '  const newE = Math.min(e, r + expressCost) + express[i]',
  '  r = newR',
  '  e = newE',
  '  costs.push(Math.min(r, e))',
  '}',
  'return costs',
]

const PY = [
  'def minimum_costs(regular, express, express_cost):',
  '    r = 0',
  "    e = float('inf')",
  '    costs = []',
  '    for i in range(len(regular)):',
  '        new_r = min(r, e) + regular[i]',
  '        new_e = min(e, r + express_cost) + express[i]',
  '        r, e = new_r, new_e',
  '        costs.append(min(r, e))',
  '    return costs',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin on the regular line at stop zero.' },
  { id: 'stop', label: 'Stop', description: 'Choose the cheapest way to stand on each line here.' },
  { id: 'done', label: 'Result', description: 'Every stop has a cheapest cost.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with regular, express and expressCost.')
  const { regular, express, expressCost } = input
  if (!Array.isArray(regular) || !Array.isArray(express) || regular.length !== express.length) throw new Error('regular and express must be lists of the same length.')
  if (regular.length < 1 || regular.length > 20) throw new Error('The visualization caps the stop count at 1 to 20.')
  const valid = v => Number.isInteger(v) && v >= 1 && v <= 100
  if (!regular.every(valid) || !express.every(valid)) throw new Error('Line costs are integers from 1 to 100 in this visualization.')
  if (!Number.isInteger(expressCost) || expressCost < 1 || expressCost > 100) throw new Error('expressCost is an integer from 1 to 100 in this visualization.')
  return { regular, express, expressCost }
}

export function buildTrace({ regular, express, expressCost }) {
  const frames = []
  const costs = []
  let r = 0
  let e = Infinity
  const show = v => (v === Infinity ? 'inf' : v)
  frames.push({ pythonLine: pyLine('r = 0'), phase: 'start', activeLine: codeLine('let r = 0, e = Infinity'), stop: -1, r, e, newR: null, newE: null, costs: [], message: 'Start on the regular line at stop 0 with cost 0. Express is not yet reachable.' })
  for (let i = 0; i < regular.length; i++) {
    const newR = Math.min(r, e) + regular[i]
    const newE = Math.min(e, r + expressCost) + express[i]
    frames.push({ pythonLine: pyLine('new_r = min(r, e) + regular[i]'), phase: 'stop', activeLine: codeLine('const newR = Math.min(r, e) + regular[i]'), stop: i, r, e, newR, newE: null, costs: [...costs], message: `Stop ${i}: regular line costs ${regular[i]} more. Coming from ${show(r)} on regular or ${show(e)} on express (switching back is free), the best is ${newR}.` })
    frames.push({ pythonLine: pyLine('new_e = min(e, r + express_cost) + express[i]'), phase: 'stop', activeLine: codeLine('const newE = Math.min(e, r + expressCost) + express[i]'), stop: i, r, e, newR, newE, costs: [...costs], message: `Stop ${i}: express line costs ${express[i]} more. Switching from regular costs ${expressCost}, so the best is ${newE}.` })
    r = newR
    e = newE
    costs.push(Math.min(r, e))
    frames.push({ pythonLine: pyLine('costs.append(min(r, e))'), phase: 'stop', activeLine: codeLine('costs.push(Math.min(r, e))'), stop: i, r, e, newR: r, newE: e, costs: [...costs], message: `Cheapest cost to reach stop ${i} is ${costs[i]}.` })
  }
  frames.push({ pythonLine: pyLine('return costs'), phase: 'done', activeLine: codeLine('return costs'), stop: -1, r, e, newR: null, newE: null, costs: [...costs], message: `Cheapest costs to reach each stop: ${costs.join(', ')}.` })
  return { input: { regular, express, expressCost }, result: costs, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
