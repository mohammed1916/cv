export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 50 || !/^[EL]+$/.test(s)) throw new Error('Use a JSON string of 1 to 50 letters, each E or L.')
  return s
}

export function buildTrace(s) {
  const frames = []
  let current = 0
  let best = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('current = 0; best = 0'), at: -1, current, best, message: 'No one is waiting yet.' })
  for (let i = 0; i < s.length; i++) {
    if (s[i] === 'E') {
      current += 1
      best = Math.max(best, current)
      frames.push({ pythonLine: 6, phase: 'arrive', activeLine: L('if the letter is E, current goes up'), at: i, current, best, message: `Arrival at ${i}: ${current} waiting, peak ${best}.` })
    } else {
      current -= 1
      frames.push({ pythonLine: 9, phase: 'leave', activeLine: L('otherwise current goes down'), at: i, current, best, message: `Departure at ${i}: ${current} waiting.` })
    }
  }
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return best'), at: -1, current, best, message: `${best} chairs are needed.` })
  return { input: s, result: best, frames }
}

export const code = `minimum chairs for the peak number of people waiting
  current = 0; best = 0
  for each letter in order
    if the letter is E, current goes up and best takes the larger value
    otherwise current goes down
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
