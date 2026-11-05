// LeetCode 1953: the largest project caps the weeks; if it outnumbers the rest by more than one, only rest + 1 of its milestones fit.
const SOURCE = [
  "function numberOfWeeks(milestones) {",
  "  const total = milestones.reduce((a, b) => a + b, 0)",
  "  const largest = Math.max(...milestones)",
  "  const rest = total - largest",
  "  if (largest > rest + 1) return 2 * rest + 1",
  "  return total",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def number_of_weeks(milestones):
    total = sum(milestones)
    largest = max(milestones)
    rest = total - largest
    if largest > rest + 1:
        return 2 * rest + 1
    return total
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'measure', label: 'Measure', description: 'Find the total and the largest project.' },
  { id: 'decide', label: 'Decide', description: 'Compare the largest project with everything else.' },
  { id: 'done', label: 'Result', description: 'The number of weeks.' },
]

export function parseInput(text) {
  let milestones
  try { milestones = JSON.parse(text) } catch { throw new Error('Enter a JSON array of positive integers, for example [4,1,1].') }
  if (!Array.isArray(milestones) || milestones.length < 1 || milestones.length > 8) throw new Error('Use 1 to 8 projects for the visualization.')
  if (!milestones.every(v => Number.isInteger(v) && v >= 1 && v <= 30)) throw new Error('Each project has 1 to 30 milestones.')
  return { milestones }
}

export function buildTrace({ milestones }) {
  const frames = []
  const total = milestones.reduce((a, b) => a + b, 0)
  frames.push({ phase: 'measure', activeLine: L('const total ='), pythonLine: P('total = sum'), message: `Total milestones: ${total}.`, milestones, total, largest: null, rest: null, result: null })
  const largest = Math.max(...milestones)
  const rest = total - largest
  frames.push({ phase: 'measure', activeLine: L('const largest ='), pythonLine: P('largest = max'), message: `Largest project has ${largest}; the others have ${rest} together.`, milestones, total, largest, rest, result: null })
  const capped = largest > rest + 1
  frames.push({ phase: 'decide', activeLine: L('largest > rest + 1'), pythonLine: P('largest > rest + 1'), message: capped ? `${largest} > ${rest} + 1, so the largest project is capped at ${rest + 1} separated weeks.` : `${largest} <= ${rest} + 1, so every milestone can be worked.`, milestones, total, largest, rest, result: null, capped })
  const result = capped ? 2 * rest + 1 : total
  frames.push({ phase: 'done', activeLine: L('return'), pythonLine: P('return 2 * rest'), message: `Maximum weeks: ${result}.`, milestones, total, largest, rest, result, capped })
  return { input: { milestones }, result, frames }
}
