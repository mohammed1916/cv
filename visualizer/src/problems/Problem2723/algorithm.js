const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'Object with a, b (integers) and aMs, bMs (delays from 0 to 1000)'
export const URL = 'https://leetcode.com/problems/add-two-promises/'
export const COMPLEXITY = 'O(1): two values, one sum. The delays only decide which value is ready first.'
export const EXAMPLES = [
  { label: 'Example', input: '{"a":2,"b":5,"aMs":30,"bMs":10}' },
  { label: 'Equal delays', input: '{"a":-4,"b":9,"aMs":0,"bMs":0}' },
]
export const WHY = [
  'Both promises are waiting at the same time, so the total is ready when the slower one settles.',
  'The sum is only computed after both values are known; the code never reads an unfinished value.',
]
export function parseInput(text) {
  const input = JSON.parse(text)
  const ok = ['a', 'b'].every(k => Number.isInteger(input?.[k]))
  const okMs = ['aMs', 'bMs'].every(k => Number.isInteger(input?.[k]) && input[k] >= 0 && input[k] <= 1000)
  if (!ok || !okMs) throw new Error('Use integers for a and b, and delays aMs and bMs from 0 to 1000.')
  return input
}
export function buildTrace(input) {
  const { a, b, aMs, bMs } = input
  const frames = [frame('setup', 1, 'Both promises start waiting.', { a: null, b: null })]
  const first = aMs <= bMs ? 'a' : 'b'
  const firstMs = Math.min(aMs, bMs)
  frames.push(frame('step', 2, `${first} settles first at ${firstMs}ms.`, { time: firstMs, a: aMs <= firstMs ? a : null, b: bMs <= firstMs ? b : null }))
  const last = Math.max(aMs, bMs)
  frames.push(frame('step', 3, `The other value settles at ${last}ms; both are known now.`, { time: last, a, b }))
  frames.push(frame('done', 4, `Return ${a} + ${b} = ${a + b}.`, { a, b, sum: a + b }))
  return { input, result: a + b, frames }
}
export const code = lines(`wait for promise a and promise b to both resolve
read the resolved value of a
read the resolved value of b
return a plus b`)
export const python = `def add_two(a, b):
    total = a.value + b.value
    return total`
