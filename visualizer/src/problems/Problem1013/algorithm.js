export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [1, 2, 3, 0, 0, 0]}.')
  const { arr } = input
  if (!Array.isArray(arr) || arr.length < 3 || arr.length > 12 || !arr.every(v => Number.isInteger(v) && v >= -10 && v <= 10)) throw new Error('arr is a list of 3 to 12 integers from -10 to 10.')
  return { arr }
}

export function buildTrace({ arr }) {
  const n = arr.length
  const total = arr.reduce((a, b) => a + b, 0)
  const frames = []
  frames.push({ phase: 'start', activeLine: L('total = sum'), pythonLine: P('total = sum'), message: `The whole array sums to ${total}.`, state: { total, target: null, index: -1, running: 0, closed: 0 } })
  if (total % 3 !== 0) {
    frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return False'), message: `${total} is not divisible by 3, so three equal parts are impossible.`, state: { total, target: null, index: -1, running: 0, closed: 0 } })
    return { input: { arr }, result: false, frames }
  }
  const target = total / 3
  let running = 0
  let closed = 0
  frames.push({ phase: 'scan', activeLine: L('target = total'), pythonLine: P('target = total'), message: `Each part must sum to ${target}. Close a part as soon as the running sum reaches it.`, state: { total, target, index: -1, running, closed } })
  for (let k = 0; k < n - 1; k++) {
    running += arr[k]
    if (running === target) {
      closed++
      frames.push({ phase: 'close', activeLine: L('closed += 1'), pythonLine: P('parts += 1'), message: `Prefix through index ${k} sums to ${target}. Part ${closed} closes here.`, state: { total, target, index: k, running, closed } })
      running = 0
    } else {
      frames.push({ phase: 'scan', activeLine: L('running += arr[k]'), pythonLine: P('running +='), message: `Index ${k} adds ${arr[k]}; the running sum is ${running}.`, state: { total, target, index: k, running, closed } })
    }
  }
  const result = closed >= 2
  frames.push({ phase: 'done', activeLine: L('return closed >= 2'), pythonLine: P('return parts'), message: result ? `Two parts closed before the last element, so the rest is a nonempty third part of ${target}.` : `Only ${closed} part(s) closed before the last element, so no valid pair of cuts exists.`, state: { total, target, index: n - 1, running, closed } })
  return { input: { arr }, result, frames }
}

export const code = `three equal parts (arr):
  total = sum of arr
  if total is not divisible by 3:
    return false
  target = total / 3
  running = 0; closed = 0
  for each index k from 0 to the second last index:
    running += arr[k]
    if running == target:
      closed += 1
      running = 0
  return closed >= 2`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def can_three_parts_equal_sum(arr):
    total = sum(arr)
    if total % 3:
        return False
    target = total // 3
    parts = running = 0
    for k in range(len(arr) - 1):
        running += arr[k]
        if running == target:
            parts += 1
            running = 0
    return parts >= 2
`
