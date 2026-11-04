const NAME = /^[a-z]{1,10}$/
const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data)) throw new Error('Use {"keyName": [...], "keyTime": [...]}.')
  const { keyName, keyTime } = data
  if (!Array.isArray(keyName) || !Array.isArray(keyTime) || keyName.length !== keyTime.length) throw new Error('keyName and keyTime must be arrays of the same length.')
  if (keyName.length < 1 || keyName.length > 20) throw new Error('Use 1 to 20 swipes.')
  if (keyName.some(n => typeof n !== 'string' || !NAME.test(n))) throw new Error('Names are 1 to 10 lowercase letters.')
  if (keyTime.some(t => typeof t !== 'string' || !CLOCK.test(t))) throw new Error('Times are HH:MM in 24-hour format, such as "09:30".')
  return { keyName, keyTime }
}

const toMinutes = clock => {
  const [h, m] = clock.split(':').map(Number)
  return h * 60 + m
}

export function buildTrace(input) {
  const { keyName, keyTime } = input
  const frames = []
  const groups = new Map()
  const alerts = []
  frames.push({ phase: 'start', pythonLine: 2, activeLine: L('const groups'), name: null, times: [], flagged: -1, alerts: [], message: 'Read every swipe. Times become minutes since midnight so that differences are simple subtraction.' })
  keyName.forEach((name, i) => {
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(toMinutes(keyTime[i]))
  })
  frames.push({ phase: 'group', pythonLine: 5, activeLine: L('groups.get(name).push'), name: null, times: [], flagged: -1, alerts: [], message: `Grouped ${keyTime.length} swipes under ${groups.size} name(s).` })
  for (const [name, raw] of groups) {
    const times = [...raw].sort((a, b) => a - b)
    frames.push({ phase: 'sort', pythonLine: 8, activeLine: L('const times = [...raw]'), name, times, flagged: -1, alerts: [...alerts], message: `${name}: sorted swipes ${times.join(', ')}.` })
    let flagged = false
    for (let i = 0; i + 2 < times.length && !flagged; i++) {
      const span = times[i + 2] - times[i]
      const hit = span <= 60
      frames.push({ phase: 'window', pythonLine: 10, activeLine: L('if (times[i + 2]'), name, times, flagged: i, alerts: [...alerts], span,
        message: `${name}: swipes ${i + 1} to ${i + 3} span ${span} minutes. ${hit ? 'At most 60, so this is an alert.' : 'More than 60, so keep looking.'}` })
      if (hit) {
        alerts.push(name)
        flagged = true
        frames.push({ phase: 'alert', pythonLine: 11, activeLine: L('alerts.push(name)'), name, times, flagged: i, alerts: [...alerts], span, message: `${name} is added to the alert list.` })
      }
    }
  }
  const result = [...alerts].sort()
  frames.push({ phase: 'done', pythonLine: 13, activeLine: L('return alerts'), name: null, times: [], flagged: -1, alerts: result, message: `Sorted alerts: ${result.length ? result.join(', ') : 'none'}.` })
  return { input, result, frames }
}

export const code = [
  "function alertNames(keyName, keyTime) {",
  "  const groups = new Map();",
  "  keyName.forEach((name, i) => {",
  "    const [h, m] = keyTime[i].split(':').map(Number);",
  "    if (!groups.has(name)) groups.set(name, []);",
  "    groups.get(name).push(h * 60 + m);",
  "  });",
  "  const alerts = [];",
  "  for (const [name, raw] of groups) {",
  "    const times = [...raw].sort((a, b) => a - b);",
  "    for (let i = 0; i + 2 < times.length; i++) {",
  "      if (times[i + 2] - times[i] <= 60) {",
  "        alerts.push(name);",
  "        break;",
  "      }",
  "    }",
  "  }",
  "  return alerts.sort();",
  "}",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def alert_names(keyName, keyTime):
    groups = {}
    for name, clock in zip(keyName, keyTime):
        hours, minutes = clock.split(':')
        groups.setdefault(name, []).append(int(hours) * 60 + int(minutes))
    alerts = []
    for name in groups:
        times = sorted(groups[name])
        for i in range(len(times) - 2):
            if times[i + 2] - times[i] <= 60:
                alerts.append(name)
                break
    return sorted(alerts)
`
