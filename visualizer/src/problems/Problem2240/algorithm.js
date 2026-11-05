export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with total, cost1 and cost2.')
  const { total, cost1, cost2 } = input
  for (const [name, v] of [['total', total], ['cost1', cost1], ['cost2', cost2]]) {
    if (!Number.isInteger(v) || v < 1 || v > 30) throw new Error(`${name} is an integer from 1 to 30.`)
  }
  return { total, cost1, cost2 }
}

export function buildTrace({ total, cost1, cost2 }) {
  const frames = []
  const rows = []
  let ways = 0
  const maxPens = Math.floor(total / cost1)
  frames.push({ pythonLine: PL('ways = 0'), phase: 'setup', activeLine: CL('let ways'), pens: -1, left: total, pencils: 0, rows: [], ways, message: `Up to ${maxPens} pens fit into ${total}. Count the pencil choices for each.` })
  for (let pens = 0; pens <= maxPens; pens++) {
    const left = total - pens * cost1
    const pencils = Math.floor(left / cost2) + 1
    ways += pencils
    rows.push({ pens, left, pencils, ways })
    frames.push({ pythonLine: PL('for pens in range'), phase: 'count', activeLine: CL('for (let pens'), pens, left, pencils, rows: [...rows], ways, message: `${pens} pen${pens === 1 ? '' : 's'} leave ${left}, which buys 0 to ${pencils - 1} pencils: ${pencils} way${pencils === 1 ? '' : 's'}.` })
  }
  frames.push({ pythonLine: PL('return ways'), phase: 'done', activeLine: CL('return ways'), pens: -1, left: 0, pencils: 0, rows, ways, message: `${ways} distinct ways in total.` })
  return { input: { total, cost1, cost2 }, result: ways, frames }
}

export const code = `function waysToBuy(total, cost1, cost2) {
  let ways = 0;
  const maxPens = Math.floor(total / cost1);
  for (let pens = 0; pens <= maxPens; pens++) {
    const left = total - pens * cost1;
    ways += Math.floor(left / cost2) + 1;
  }
  return ways;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def ways_to_buy(total, cost1, cost2):
    ways = 0
    max_pens = total // cost1
    for pens in range(max_pens + 1):
        left = total - pens * cost1
        ways += left // cost2 + 1
    return ways
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
