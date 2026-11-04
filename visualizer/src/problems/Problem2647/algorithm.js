export const MAX_N = 12

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > MAX_N) throw new Error(`n is an integer from 1 to ${MAX_N} in this visualization.`)
  return { n }
}

export const cellKey = (row, j) => `${row},${j}`

/** Cells sharing a side with (row, j). Odd slots point up and touch the row below; even slots point down and touch the row above. */
export function neighbours(row, j, n) {
  const cells = []
  if (j > 1) cells.push([row, j - 1])
  if (j < 2 * row - 1) cells.push([row, j + 1])
  if (j % 2 === 0) cells.push([row - 1, j - 1])
  else if (row < n) cells.push([row + 1, j + 1])
  return cells
}

export const CYCLE = [
  { name: 'Every upward slot', detail: 'slots 1, 3, 5, …' },
  { name: 'Only slot 2', detail: 'one downward triangle' },
  { name: 'Upward slots from 3', detail: 'slots 3, 5, 7, …' },
  { name: 'Only slot 1', detail: 'the left corner of the row' },
]

function picksFor(row, cycle) {
  const picks = []
  if (cycle === 0) for (let j = 1; j < 2 * row; j += 2) picks.push(j)
  else if (cycle === 1) picks.push(2)
  else if (cycle === 2) for (let j = 3; j < 2 * row; j += 2) picks.push(j)
  else picks.push(1)
  return picks
}

export const code = `seed the single triangle in row 1, which has only one neighbour
start the four-step cycle at the bottom row
for each row from n up to 2
  step 0: seed every upward slot of the row
  step 1: seed only slot 2
  step 2: seed the upward slots from slot 3 onward
  step 3: seed only slot 1
  advance the cycle, wrapping after step 3
repeat a sweep over every triangle, top to bottom
  turn a white triangle red when two neighbours are red
stop once a sweep changes nothing
every triangle is red, so return the seeds`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def neighbours(row, j, n):
    cells = []
    if j > 1:
        cells.append((row, j - 1))
    if j < 2 * row - 1:
        cells.append((row, j + 1))
    if j % 2 == 0:
        cells.append((row - 1, j - 1))
    elif row < n:
        cells.append((row + 1, j + 1))
    return cells


def color_red(n):
    seeds = [(1, 1)]
    cycle = 0
    for row in range(n, 1, -1):
        if cycle == 0:
            picks = range(1, 2 * row, 2)
        elif cycle == 1:
            picks = [2]
        elif cycle == 2:
            picks = range(3, 2 * row, 2)
        else:
            picks = [1]
        seeds += [(row, j) for j in picks]
        cycle = (cycle + 1) % 4
    red = set(seeds)
    changed = True
    while changed:
        changed = False
        for row in range(1, n + 1):
            for j in range(1, 2 * row):
                if (row, j) not in red and sum(c in red for c in neighbours(row, j, n)) >= 2:
                    red.add((row, j))
                    changed = True
    assert len(red) == n * n
    return [list(cell) for cell in seeds]
`

const P = s => {
  const index = python.trim().split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'top', label: 'Top', description: 'The apex has one neighbour, so it can never be coloured later.' },
  { id: 'row', label: 'Row', description: 'Move up one row and read which step of the cycle applies.' },
  { id: 'seed', label: 'Seed', description: 'Colour a chosen triangle red before spreading starts.' },
  { id: 'sweep', label: 'Sweep', description: 'Begin a pass over all triangles.' },
  { id: 'check', label: 'Check', description: 'A white triangle has at least two red neighbours.' },
  { id: 'spread', label: 'Spread', description: 'That triangle turns red.' },
  { id: 'done', label: 'Result', description: 'Every triangle is red; report the seeds.' },
]

export function buildTrace({ n }) {
  const frames = []
  const seeds = [[1, 1]]
  const seedKeys = new Set([cellKey(1, 1)])
  const red = new Set(seedKeys)
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message,
    seeds: [...seedKeys], red: [...red], focus: null, support: [], row: null, cycle: null, pass: 0, ...extra,
  })

  push('top', L('seed the single'), P('seeds = [(1, 1)]'), 'Row 1 holds one triangle with a single neighbour. It can never collect two red neighbours, so it must start red.', { focus: [1, 1] })

  let cycle = 0
  for (let row = n; row > 1; row--) {
    const picks = picksFor(row, cycle)
    const stepLine = [L('step 0'), L('step 1'), L('step 2'), L('step 3')][cycle]
    const pyLine = [P('picks = range(1,'), P('picks = [2]'), P('picks = range(3,'), P('picks = [1]')][cycle]
    push('row', stepLine, pyLine, `Row ${row} is step ${cycle} of the cycle: ${CYCLE[cycle].name.toLowerCase()}, which is ${picks.length} triangle${picks.length === 1 ? '' : 's'}.`, { row, cycle })
    for (const j of picks) {
      seeds.push([row, j])
      seedKeys.add(cellKey(row, j))
      red.add(cellKey(row, j))
      push('seed', stepLine, P('seeds += '), `Seed (${row}, ${j}). The starting set now has ${seeds.length} triangle${seeds.length === 1 ? '' : 's'}.`, { row, cycle, focus: [row, j] })
    }
    cycle = (cycle + 1) % 4
  }

  let pass = 0
  let changed = true
  while (changed) {
    changed = false
    pass++
    push('sweep', L('repeat a sweep'), P('changed = False'), `Sweep ${pass}: scan rows from top to bottom. ${n * n - red.size} white triangle${n * n - red.size === 1 ? '' : 's'} left.`, { pass })
    for (let row = 1; row <= n; row++) {
      for (let j = 1; j < 2 * row; j++) {
        if (red.has(cellKey(row, j))) continue
        const support = neighbours(row, j, n).filter(([a, b]) => red.has(cellKey(a, b)))
        if (support.length < 2) continue
        push('check', L('turn a white'), P('not in red and sum'), `(${row}, ${j}) is white and has ${support.length} red neighbours, which meets the rule.`, { pass, focus: [row, j], support })
        red.add(cellKey(row, j))
        changed = true
        push('spread', L('turn a white'), P('red.add('), `(${row}, ${j}) turns red. ${n * n - red.size} white triangle${n * n - red.size === 1 ? '' : 's'} left.`, { pass, focus: [row, j], support })
      }
    }
    if (!changed) push('sweep', L('stop once'), P('while changed'), `Sweep ${pass} changed nothing, so spreading is over.`, { pass })
  }
  const allRed = red.size === n * n
  push('done', L('every triangle'), P('return [list(cell)'), `All ${red.size} triangles are red, starting from ${seeds.length} seed${seeds.length === 1 ? '' : 's'}.`, { pass })
  return { input: { n }, result: seeds, allRed, frames }
}
