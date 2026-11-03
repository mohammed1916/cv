export const phases = [
  { id: 'scan', label: 'Read letter', description: 'Read the next letter of the sound stream.' },
  { id: 'start', label: 'New frog', description: 'A c starts a croak. Use a new frog, or reuse one that has just finished.' },
  { id: 'advance', label: 'Advance', description: 'An r, o or a must continue a frog that has said the letter before it.' },
  { id: 'finish', label: 'Finish', description: 'A k ends a croak, so that frog is free to start another one.' },
  { id: 'count', label: 'Count frogs', description: 'Frogs in the middle of a croak are the ones that must be present at this moment.' },
  { id: 'check', label: 'Invalid', description: 'No frog is waiting for this letter, so the sound cannot be a sequence of croaks.' },
  { id: 'result', label: 'Result', description: 'Return the largest number of simultaneous frogs, or -1 when the stream is invalid or incomplete.' },
]

export const python = `def min_number_of_frogs(sound):
    stage = {"c": 0, "r": 1, "o": 2, "a": 3, "k": 4}
    waiting = [0, 0, 0, 0]
    best = 0
    for ch in sound:
        i = stage[ch]
        if i == 0:
            waiting[0] += 1
        elif i == 4:
            if waiting[3] == 0:
                return -1
            waiting[3] -= 1
        else:
            if waiting[i - 1] == 0:
                return -1
            waiting[i - 1] -= 1
            waiting[i] += 1
        best = max(best, sum(waiting))
    return best if sum(waiting) == 0 else -1`

const pythonLines = python.split('\n')
export const code = pythonLines.map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = Object.fromEntries(pythonLines.map((_, index) => [index + 1, index + 1]))

const LETTERS = 'croak'

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON string of the letters c, r, o, a and k.') }
  if (typeof value !== 'string' || value.length < 1 || value.length > 500) throw new Error('Enter a JSON string of 1 to 500 characters.')
  if (![...value].every(ch => LETTERS.includes(ch))) throw new Error('Only the letters c, r, o, a and k can appear.')
  return value
}

export function buildTrace(sound) {
  const frames = []
  const waiting = [0, 0, 0, 0]
  let best = 0
  const push = (phase, activeLine, message, current = -1) => frames.push({
    phase, activeLine, message,
    snapshot: { current, waiting: [...waiting], frogs: waiting.reduce((a, b) => a + b, 0), best },
  })

  push('scan', 6, `${sound.length} letters to read. Every frog must say c, r, o, a and k in that order.`)
  for (let idx = 0; idx < sound.length; idx++) {
    const ch = sound[idx]
    const i = LETTERS.indexOf(ch)
    push('scan', 6, `Read "${ch}" at position ${idx + 1}.`, idx)
    if (i === 0) {
      waiting[0] += 1
      push('start', 8, `"c" starts a croak. Frogs waiting after c: ${waiting[0]}.`, idx)
    } else if (i === 4) {
      if (waiting[3] === 0) {
        push('check', 10, `"k" needs a frog that has said a. None is waiting, so the stream is invalid.`, idx)
        push('result', 11, 'Return -1.', idx)
        return { input: sound, result: -1, frames }
      }
      waiting[3] -= 1
      push('finish', 12, `"k" finishes one croak. A frog that said a is now free.`, idx)
    } else {
      if (waiting[i - 1] === 0) {
        push('check', 14, `"${ch}" needs a frog that has said ${LETTERS[i - 1]}. None is waiting, so the stream is invalid.`, idx)
        push('result', 15, 'Return -1.', idx)
        return { input: sound, result: -1, frames }
      }
      waiting[i - 1] -= 1
      waiting[i] += 1
      push('advance', 16, `"${ch}" moves one frog from waiting for ${LETTERS[i]} to waiting for ${LETTERS[i + 1]}.`, idx)
    }
    best = Math.max(best, waiting.reduce((a, b) => a + b, 0))
    push('count', 18, `Frogs in the middle of a croak: ${waiting.reduce((a, b) => a + b, 0)}. The largest so far is ${best}.`, idx)
  }

  const complete = waiting.every(v => v === 0)
  const result = complete ? best : -1
  push('result', 19, complete
    ? `Every croak finished. The minimum number of frogs is ${best}.`
    : 'Some croak never finished, so the stream is invalid. Return -1.')
  return { input: sound, result, frames }
}
