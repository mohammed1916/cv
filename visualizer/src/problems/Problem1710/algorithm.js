// Maximum units on a truck: take boxes of the most units per box first, until the truck is full.
const JS_LINES = [
  { text: 'const sorted = [...boxTypes].sort((a, b) => b[1] - a[1])', py: 'ordered = sorted' },
  { text: 'let units = 0, left = truckSize', py: 'units = 0' },
  { text: 'for (const [count, perBox] of sorted) {', py: 'for count, per in' },
  { text: 'const take = Math.min(count, left)', py: 'take = min' },
  { text: 'units += take * perBox', py: 'units += take * per' },
  { text: 'left -= take', py: 'left -= take' },
  { text: 'if (left === 0) break', py: 'if left == 0' },
  { text: '}', py: null },
  { text: 'return units', py: 'return units' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def maximumUnits(boxTypes, truckSize):
    ordered = sorted(boxTypes, key=lambda t: -t[1])
    units = 0
    left = truckSize
    for count, per in ordered:
        take = min(count, left)
        units += take * per
        left -= take
        if left == 0:
            break
    return units
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return units')]))

export const phases = [
  { id: 'sort', label: 'Sort', description: 'Order the box types by units per box, highest first.' },
  { id: 'load', label: 'Load', description: 'Load as many boxes of this type as the truck has room for.' },
  { id: 'full', label: 'Full', description: 'The truck is full: stop.' },
  { id: 'done', label: 'Result', description: 'The total units on the truck.' },
]

export const examples = [
  { label: 'Best density first', input: '{"boxTypes":[[4,2],[1,9],[3,5]],"truckSize":5}' },
  { label: 'Room for all', input: '{"boxTypes":[[2,3],[1,1]],"truckSize":10}' },
  { label: 'Single box type', input: '{"boxTypes":[[1,1]],"truckSize":1}' },
  { label: 'Truck too small for any box', input: '{"boxTypes":[[5,4]],"truckSize":3}' },
  { label: 'Equal density', input: '{"boxTypes":[[2,3],[3,3]],"truckSize":6}' },
  { label: 'Long run: 8 box types', input: '{"boxTypes":[[18,8],[14,20],[1,5],[9,6],[9,17],[14,16],[1,10],[9,11]],"truckSize":60}' },
]

export const complexity = 'O(m log m) time for m box types, dominated by the sort. Space is O(m).'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.boxTypes) || !Number.isInteger(input.truckSize)) throw new Error('Use an object with boxTypes and truckSize.')
  const { boxTypes, truckSize } = input
  if (boxTypes.length < 1 || boxTypes.length > 8) throw new Error('Use 1 to 8 box types (visual cap).')
  for (const [count, perBox] of boxTypes) {
    if (!Number.isInteger(count) || !Number.isInteger(perBox) || count < 1 || count > 20 || perBox < 1 || perBox > 20) throw new Error('Each box type is [count, units per box] with values from 1 to 20.')
  }
  if (truckSize < 1 || truckSize > 60) throw new Error('truckSize is from 1 to 60.')
  return { boxTypes, truckSize }
}

export function buildTrace({ boxTypes, truckSize }) {
  const frames = []
  const sorted = [...boxTypes].sort((a, b) => b[1] - a[1])
  let units = 0
  let left = truckSize
  const loaded = []
  const snap = extra => ({ units, left, loaded: [...loaded], ...extra })
  frames.push({ phase: 'sort', activeLine: 1, index: -1, sorted, message: `Order by units per box: ${sorted.map(([c, p]) => `${c}×${p}`).join(', ')}.`, snapshot: snap({}) })
  for (let i = 0; i < sorted.length; i++) {
    const [count, perBox] = sorted[i]
    const take = Math.min(count, left)
    units += take * perBox
    left -= take
    loaded.push({ type: i, take, perBox })
    frames.push({ phase: 'load', activeLine: 5, index: i, sorted, message: `Load ${take} box${take === 1 ? '' : 'es'} of ${perBox} units; ${left} room left.`, snapshot: snap({}) })
    if (left === 0) {
      frames.push({ phase: 'full', activeLine: 7, index: i, sorted, message: 'The truck is full.', snapshot: snap({}) })
      break
    }
  }
  frames.push({ phase: 'done', activeLine: 9, index: -1, sorted, result: units, message: `Total units ${units}.`, snapshot: snap({ result: units }) })
  return { input: { boxTypes, truckSize }, result: units, frames }
}
