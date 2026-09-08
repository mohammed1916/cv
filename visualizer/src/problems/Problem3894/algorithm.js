export function parseInput(text) {
  const timer = JSON.parse(text)
  if (!Number.isInteger(timer) || timer < 0 || timer > 1000) throw new Error('Enter an integer timer from 0 to 1000.')
  return timer
}
export function buildTrace(timer) {
  const frames = [{ phase: 'start', checked: 0, result: null, activeLine: 1, message: `Classify timer ${timer}. Playback evaluates rules; it does not count the timer down.` }]
  const checks = [timer === 0, timer === 30, timer > 30 && timer <= 90]
  const names = ['Green', 'Orange', 'Red'], expressions = ['timer == 0', 'timer == 30', '30 < timer <= 90']
  let result = 'Invalid'
  for (let i = 0; i < 3; i++) {
    frames.push({ phase: ['green', 'orange', 'red'][i], checked: i + 1, result: checks[i] ? names[i] : null, activeLine: 2 + 2 * i,
      message: `${expressions[i]} is ${checks[i]}. ${checks[i] ? `Select ${names[i]}; later rules are skipped.` : 'Continue to the next rule.'}` })
    if (checks[i]) { result = names[i]; break }
  }
  frames.push({ phase: 'done', checked: frames.at(-1).checked, result, activeLine: result === 'Invalid' ? 8 : 3 + 2 * names.indexOf(result), message: `Return "${result}".${result === 'Invalid' ? ' The input is within bounds, but no signal condition matched.' : ''}` })
  return { input: timer, checks, result, frames }
}
export const code = `def signalColor(timer):
    if timer == 0:
        return "Green"
    if timer == 30:
        return "Orange"
    if 30 < timer <= 90:
        return "Red"
    return "Invalid"`.split('\n').map((text, index) => ({ line: index + 1, text }))
