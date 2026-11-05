// LeetCode 1936: climb greedily. A gap larger than dist needs ceil(gap / dist) - 1 inserted rungs.
const SOURCE = [
  "function addRungs(rungs, dist) {",
  "  let prev = 0, added = 0",
  "  for (const rung of rungs) {",
  "    const gap = rung - prev",
  "    if (gap > dist) added += Math.ceil(gap / dist) - 1",
  "    prev = rung",
  "  }",
  "  return added",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `from math import ceil

def add_rungs(rungs, dist):
    prev = 0
    added = 0
    for rung in rungs:
        gap = rung - prev
        if gap > dist:
            added += ceil(gap / dist) - 1
        prev = rung
    return added
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'climb', label: 'Climb', description: 'Measure each gap and add rungs only where the gap is too wide.' },
  { id: 'done', label: 'Result', description: 'Rungs that must be added.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"rungs":[2,5,9],"dist":3}.') }
  const { rungs, dist } = input || {}
  if (!Array.isArray(rungs) || rungs.length < 1 || rungs.length > 10) throw new Error('rungs holds 1 to 10 heights.')
  if (!rungs.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Rung heights are integers from 1 to 100.')
  for (let i = 1; i < rungs.length; i++) if (rungs[i] <= rungs[i - 1]) throw new Error('rungs must be strictly increasing.')
  if (!Number.isInteger(dist) || dist < 1 || dist > 50) throw new Error('dist is an integer from 1 to 50.')
  return { rungs, dist }
}

export function buildTrace({ rungs, dist }) {
  const frames = []
  let prev = 0
  let added = 0
  for (const rung of rungs) {
    const gap = rung - prev
    const need = gap > dist ? Math.ceil(gap / dist) - 1 : 0
    added += need
    frames.push({ phase: 'climb', activeLine: L('const gap ='), pythonLine: P('gap = rung'), message: need ? `Gap ${gap} from ${prev} to ${rung} is more than ${dist}: add ${need} rung(s).` : `Gap ${gap} from ${prev} to ${rung} is reachable as is.`, from: prev, to: rung, gap, need, added, rungs, dist })
    prev = rung
  }
  frames.push({ phase: 'done', activeLine: L('return added'), pythonLine: P('return added'), message: `${added} rung(s) must be added.`, from: -1, to: -1, gap: 0, need: 0, added, rungs, dist })
  return { input: { rungs, dist }, result: added, frames }
}
