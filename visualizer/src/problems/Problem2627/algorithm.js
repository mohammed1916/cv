export const code = [
  'function debounceRuns(wait, calls) {',
  '  const runs = []',
  '  for (let i = 0; i < calls.length; i++) {',
  '    const t = calls[i]',
  '    const next = calls[i + 1]',
  '    if (next !== undefined && next < t + wait) continue',
  '    runs.push(t + wait)',
  '  }',
  '  return runs',
  '}',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def debounce_runs(wait, calls):
    runs = []
    for i, t in enumerate(calls):
        nxt = calls[i + 1] if i + 1 < len(calls) else None
        if nxt is not None and nxt < t + wait:
            continue
        runs.append(t + wait)
    return runs`

const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
const pyAt = phrase => python.split('\n').findIndex(line => line.includes(phrase)) + 1
function step(frames, phase, line, pyLine, message, view) { frames.push({ phase, activeLine: at(line), pythonLine: pyAt(pyLine), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input.wait) || input.wait < 1 || input.wait > 1000) throw new Error('wait is a whole number of milliseconds from 1 to 1000.')
  if (!Array.isArray(input.calls) || input.calls.length < 1 || input.calls.length > 10) throw new Error('calls has 1 to 10 times.')
  let previous = -1
  for (const t of input.calls) {
    if (!Number.isInteger(t) || t < previous || t > 5000) throw new Error('calls are whole times in order, up to 5000.')
    previous = t
  }
  return { wait: input.wait, calls: input.calls }
}

export function buildTrace({ wait, calls }) {
  const frames = []
  const runs = []
  const outcomes = []
  const view = (focus) => ({ title: 'Call times (ms)', rows: calls.map(t => `call at ${t}`), calls: calls.slice(), wait, focus, outcomes: outcomes.slice(), runs: runs.slice(), summary: `runs: ${JSON.stringify(runs)}` })
  for (let i = 0; i < calls.length; i++) {
    const t = calls[i]
    const next = calls[i + 1]
    step(frames, 'call', 'for (let i = 0', 'for i, t in enumerate', `Call at ${t} ms.`, view(i))
    if (next !== undefined && next < t + wait) {
      outcomes.push('skip')
      step(frames, 'skip', 'if (next !== undefined', 'if nxt is not None', `Call at ${next} ms arrives within ${wait} ms, so this one is skipped.`, view(i))
    } else {
      runs.push(t + wait)
      outcomes.push('run')
      step(frames, 'run', 'runs.push(t + wait)', 'runs.append(t + wait)', `Run scheduled at ${t + wait} ms.`, view(i))
    }
  }
  step(frames, 'done', 'return runs', 'return runs', `Runs at ${runs.join(', ') || 'none'}.`, view(-1))
  return { result: runs, frames }
}
