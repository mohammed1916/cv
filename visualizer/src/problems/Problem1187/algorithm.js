export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.arr1) || !Array.isArray(input.arr2)) throw new Error('Use an object with "arr1" and "arr2" arrays.')
  const { arr1, arr2 } = input
  if (arr1.length < 1 || arr1.length > 8 || arr2.length < 1 || arr2.length > 8) throw new Error('arr1 and arr2 each hold 1 to 8 integers.')
  if ([...arr1, ...arr2].some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('Values are integers from 0 to 20.')
  return { arr1, arr2 }
}

const shown = v => (v === -Infinity ? '-inf' : v)

export function buildTrace(input) {
  const { arr1, arr2 } = input
  const ordered = [...new Set(arr2)].sort((a, b) => a - b)
  let states = new Map([[-Infinity, 0]])
  const frames = [{ phase: 'start', activeLine: L('set states to one entry'), index: -1, value: null, states: [[-Infinity, 0]], result: null, message: 'Start with no previous value and no replacements.' }]
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
    frames.push({ phase: 'step', activeLine: L('keep it'), index, value, states: [...states].map(([last, ops]) => [shown(last), ops]), result: null, message: `Position ${index} (value ${value}) leaves ${states.size} possible last value(s).` })
    if (states.size === 0) {
      frames.push({ phase: 'done', activeLine: L('return minus one'), index, value, states: [], result: -1, message: 'No way to make the array strictly increasing.' })
      return { input, result: -1, frames }
    }
  }
  const result = Math.min(...states.values())
  frames.push({ phase: 'done', activeLine: L('return the smallest'), index: arr1.length, value: null, states: [...states].map(([last, ops]) => [shown(last), ops]), result, message: `The fewest replacements is ${result}.` })
  return { input, result, frames }
}

export const code = `fewest replacements to make arr1 strictly increasing
  set states to one entry: no last value with zero replacements
  for each value in arr1 in order
    start an empty set of new states
    for each state with a last value and a replacement count
      if the value is greater than the last value then keep it with the same count
      replace the value with the smallest number in arr2 greater than the last value, costing one more
    set states to the new states
    if no states remain then return minus one
  return the smallest replacement count among the states`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(arr1, arr2):
    ordered = sorted(set(arr2))
    states = {float('-inf'): 0}
    for value in arr1:
        nxt = {}
        for last, ops in states.items():
            if value > last:
                nxt[value] = min(nxt.get(value, ops), ops)
            replacement = next((v for v in ordered if v > last), None)
            if replacement is not None:
                nxt[replacement] = min(nxt.get(replacement, ops + 1), ops + 1)
        states = nxt
        if not states:
            return -1
    return min(states.values())
`
