export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.arr1) || !Array.isArray(input.arr2)) throw new Error('Use an object with "arr1" and "arr2" arrays.')
  const { arr1, arr2 } = input
  if (arr1.length < 1 || arr1.length > 8 || arr2.length < 1 || arr2.length > 8) throw new Error('arr1 and arr2 each hold 1 to 8 integers.')
  if ([...arr1, ...arr2].some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('Values are integers from 0 to 20.')
  return { arr1, arr2 }
}

const shown = v => (v === -Infinity ? '-inf' : v)

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function minOperations(arr1, arr2) {', 'def min_operations(arr1, arr2):'],
  ['  const ordered = [...new Set(arr2)].sort((a, b) => a - b)', '    ordered = sorted(set(arr2))'],
  ['  let states = new Map([[-Infinity, 0]])', "    states = {float('-inf'): 0}"],
  ['  for (const value of arr1) {', '    for value in arr1:'],
  ['    const next = new Map()', '        nxt = {}'],
  ['    for (const [last, ops] of states) {', '        for last, ops in states.items():'],
  ['      if (value > last) next.set(value, Math.min(next.get(value) ?? Infinity, ops))', '            if value > last: nxt[value] = min(nxt.get(value, ops), ops)'],
  ['      const replacement = ordered.find(v => v > last)', '            replacement = next((v for v in ordered if v > last), None)'],
  ['      if (replacement !== undefined) next.set(replacement, Math.min(next.get(replacement) ?? Infinity, ops + 1))', '            if replacement is not None: nxt[replacement] = min(nxt.get(replacement, ops + 1), ops + 1)'],
  ['    }', ''],
  ['    states = next', '        states = nxt'],
  ['    if (states.size === 0) return -1', '        if not states: return -1'],
  ['  }', ''],
  ['  return Math.min(...states.values())', '    return min(states.values())'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { arr1, arr2 } = input
  const ordered = [...new Set(arr2)].sort((a, b) => a - b)
  let states = new Map([[-Infinity, 0]])
  const frames = [{ phase: 'start', activeLine: L('let states = new Map'), pythonLine: P("states = {float"), index: -1, value: null, states: [[-Infinity, 0]], result: null, message: 'Start with no previous value and no replacements.' }]
  for (let index = 0; index < arr1.length; index++) {
    const value = arr1[index]
    const next = new Map()
    const relax = (last, ops) => { if (!next.has(last) || ops < next.get(last)) next.set(last, ops) }
    for (const [last, ops] of states) {
      if (value > last) relax(value, ops)
      const replacement = ordered.find(v => v > last)
      if (replacement !== undefined) relax(replacement, ops + 1)
    }
    states = next
    frames.push({ phase: 'step', activeLine: L('if (value > last)'), pythonLine: P('nxt[value] = min'), index, value, states: [...states].map(([last, ops]) => [shown(last), ops]), result: null, message: `Position ${index} (value ${value}) leaves ${states.size} possible last value(s).` })
    if (states.size === 0) {
      frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: P('return -1'), index, value, states: [], result: -1, message: 'No way to make the array strictly increasing.' })
      return { input, result: -1, frames }
    }
  }
  const result = Math.min(...states.values())
  frames.push({ phase: 'done', activeLine: L('return Math.min'), pythonLine: P('return min(states.values())'), index: arr1.length, value: null, states: [...states].map(([last, ops]) => [shown(last), ops]), result, message: `The fewest replacements is ${result}.` })
  return { input, result, frames }
}
