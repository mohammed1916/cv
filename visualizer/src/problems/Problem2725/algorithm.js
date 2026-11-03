const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'Object with periodMs (1 to 200) and cancelMs (0 to 1000)'
export const URL = 'https://leetcode.com/problems/interval-cancellation/'
export const COMPLEXITY = 'O(calls) time: the function runs once per period until the cancel time, and nothing is scheduled after it.'
export const EXAMPLES = [
  { label: 'Example', input: '{"periodMs":20,"cancelMs":70}' },
  { label: 'Cancel on a tick', input: '{"periodMs":50,"cancelMs":50}' },
]
export const WHY = [
  'The function is called immediately at time 0 and then again after each period.',
  'A cancel at a given time stops every call scheduled at or after that time. This model treats the cancel time as exclusive, so a tick exactly at cancelMs does not run.',
]
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.periodMs) || input.periodMs < 1 || input.periodMs > 200) throw new Error('periodMs is an integer from 1 to 200.')
  if (!Number.isInteger(input?.cancelMs) || input.cancelMs < 0 || input.cancelMs > 1000) throw new Error('cancelMs is an integer from 0 to 1000.')
  return input
}
export function buildTrace({ periodMs, cancelMs }) {
  const calls = []
  const frames = [frame('setup', 1, `Call now and every ${periodMs}ms. Cancel at ${cancelMs}ms.`, { calls })]
  for (let t = 0; t < cancelMs; t += periodMs) {
    calls.push(t)
    frames.push(frame('step', 2, `Call at ${t}ms.`, { time: t, calls: [...calls] }))
  }
  frames.push(frame('step', 3, `Cancelled at ${cancelMs}ms; later calls are dropped.`, { time: cancelMs, calls: [...calls] }))
  frames.push(frame('done', 4, `${calls.length} calls happened.`, { calls }))
  return { input: { periodMs, cancelMs }, result: calls, frames }
}
export const code = lines(`call the function now at time 0
while the next scheduled time is before the cancel time
  wait one period and call the function
stop when the cancel function runs
return the number of calls`)
export const python = `def interval_calls(period, cancel_at):
    calls = []
    t = 0
    while t < cancel_at:
        calls.append(t)
        t += period
    return calls`
