export const phases = [
  { id: 'start', label: 'Empty balance', description: 'Start with an empty tally that maps each value to a running balance.' },
  { id: 'count-target', label: 'Add target values', description: 'Each value in target adds one to its balance.' },
  { id: 'count-arr', label: 'Remove arr values', description: 'Each value in arr subtracts one from its balance.' },
  { id: 'compare', label: 'Check balances', description: 'Every balance must be zero, meaning both arrays hold the same values with the same multiplicities.' },
  { id: 'done', label: 'Complete', description: 'Return true when the multisets match, and false at the first nonzero balance.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"target": [...], "arr": [...]}.')
  const { target, arr } = input
  const valid = a => Array.isArray(a) && a.length >= 1 && a.length <= 30 && a.every(v => Number.isInteger(v) && v >= 1 && v <= 20)
  if (!valid(target)) throw new Error('target is a list of 1 to 30 integers from 1 to 20.')
  if (!valid(arr)) throw new Error('arr is a list of 1 to 30 integers from 1 to 20.')
  if (target.length !== arr.length) throw new Error('target and arr must have the same length.')
  return { target, arr }
}

export function buildTrace({ target, arr }) {
  const balance = new Map()
  const entries = () => [...balance].map(([value, count]) => ({ value, count }))
  const frames = [{ phase: 'start', activeLine: L('const balance = new Map'), pythonLine: P('balance = {}'), snapshot: { entries: [], side: null, index: null, mismatch: null }, message: 'The balance map starts empty. Each value will count up for target and down for arr.' }]
  target.forEach((v, i) => {
    balance.set(v, (balance.get(v) ?? 0) + 1)
    frames.push({ phase: 'count-target', activeLine: L('for (const value of target)'), pythonLine: P('for value in target'), snapshot: { entries: entries(), side: 'target', index: i, mismatch: null }, message: `target[${i}] = ${v}: its balance rises to ${balance.get(v)}.` })
  })
  arr.forEach((v, i) => {
    balance.set(v, (balance.get(v) ?? 0) - 1)
    frames.push({ phase: 'count-arr', activeLine: L('for (const value of arr)'), pythonLine: P('for value in arr'), snapshot: { entries: entries(), side: 'arr', index: i, mismatch: null }, message: `arr[${i}] = ${v}: its balance falls to ${balance.get(v)}.` })
  })
  let mismatch = null
  for (const [value, count] of balance) {
    if (count !== 0) { mismatch = { value, count }; break }
  }
  frames.push({ phase: 'compare', activeLine: L('if (count !== 0)'), pythonLine: P('if count != 0'), snapshot: { entries: entries(), side: null, index: null, mismatch }, message: mismatch ? `Value ${mismatch.value} has balance ${mismatch.count}, so the multisets differ.` : 'Every balance is zero, so the two arrays hold the same values with the same counts.' })
  const result = mismatch === null
  frames.push({ phase: 'done', activeLine: L(result ? 'return true' : 'return false'), pythonLine: P(result ? 'return True' : 'return False'), snapshot: { entries: entries(), side: null, index: null, mismatch }, message: result ? 'Return true. Adjacent swaps can reach any order, so the target is reachable.' : 'Return false.' })
  return { input: { target, arr }, result, frames }
}

export const code = `function canBeEqual(target, arr) {
  const balance = new Map()
  for (const value of target) balance.set(value, (balance.get(value) ?? 0) + 1)
  for (const value of arr) balance.set(value, (balance.get(value) ?? 0) - 1)
  for (const count of balance.values()) {
    if (count !== 0) return false
  }
  return true
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def can_be_equal(target, arr):
    balance = {}
    for value in target:
        balance[value] = balance.get(value, 0) + 1
    for value in arr:
        balance[value] = balance.get(value, 0) - 1
    for count in balance.values():
        if count != 0: return False
    return True`
