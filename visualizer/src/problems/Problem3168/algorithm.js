export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 50 || !/^[EL]+$/.test(s)) throw new Error('Use a JSON string of 1 to 50 letters, each E or L.')
  return s
}

export function buildTrace(s) {
  const frames = []
  let current = 0
  let best = 0
  const history = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('let current = 0'), at: -1, current, best, history: [...history], message: 'No one is waiting yet.' })
  for (let i = 0; i < s.length; i++) {
    if (s[i] === 'E') {
      current += 1
      best = Math.max(best, current)
      history.push(current)
      frames.push({ pythonLine: 6, phase: 'arrive', activeLine: L("if (ch === 'E')"), at: i, current, best, history: [...history], message: `Arrival at ${i}: ${current} waiting, peak ${best}.` })
    } else {
      current -= 1
      history.push(current)
      frames.push({ pythonLine: 9, phase: 'leave', activeLine: L('current -= 1'), at: i, current, best, history: [...history], message: `Departure at ${i}: ${current} waiting.` })
    }
  }
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return best'), at: -1, current, best, history: [...history], message: `${best} chairs are needed.` })
  return { input: s, result: best, frames }
}

export const code = `function minChairs(s) {
  let current = 0
  let best = 0
  for (const ch of s) {
    if (ch === 'E') {
      current += 1
      best = Math.max(best, current)
    } else {
      current -= 1
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_chairs(s):
    current = 0
    best = 0
    for ch in s:
        if ch == "E":
            current += 1
            best = max(best, current)
        else:
            current -= 1
    return best
`
