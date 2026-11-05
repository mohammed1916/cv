export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with score 0 before the first day. Each prefix score is remembered at its earliest position.' },
  { id: 'inspect', label: 'Score a day', description: 'A tiring day (more than 8 hours) adds 1. Any other day subtracts 1.' },
  { id: 'update', label: 'Record interval', description: 'A positive running score covers the whole prefix. Otherwise look for the earliest prefix that is one lower.' },
  { id: 'done', label: 'Answer', description: 'Return the longest well-performing interval found.' },
]

export function parseInput(text) {
  const hours = JSON.parse(text)
  if (!Array.isArray(hours) || hours.length < 1 || hours.length > 40) throw new Error('Enter a JSON array of 1 to 40 daily hour counts.')
  if (!hours.every(h => Number.isInteger(h) && h >= 0 && h <= 16)) throw new Error('Each day must be an integer number of hours from 0 to 16.')
  return hours
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function longestWPI(hours) {', 'def longest_wpi(hours):'],
  ['  const first = new Map([[0, -1]])', '    first = {0: -1}'],
  ['  let score = 0, best = 0', '    score = best = 0'],
  ['  for (let i = 0; i < hours.length; i++) {', '    for i, h in enumerate(hours):'],
  ['    score += hours[i] > 8 ? 1 : -1', '        score += 1 if h > 8 else -1'],
  ['    if (score > 0) {', '        if score > 0:'],
  ['      best = i + 1', '            best = i + 1'],
  ['    } else if (first.has(score - 1)) {', '        elif score - 1 in first:'],
  ['      best = Math.max(best, i - first.get(score - 1))', '            best = max(best, i - first[score - 1])'],
  ['    }', ''],
  ['    if (!first.has(score)) first.set(score, i)', '        first.setdefault(score, i)'],
  ['  }', ''],
  ['  return best', '    return best'],
  ['}', ''],
]
export const code = LINES.map(([js], index) => ({ line: index + 1, text: js }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const hours = input
  const frames = []
  const frame = (phase, activeLine, pythonLine, message, snapshot) => frames.push({ phase, activeLine, pythonLine, message, snapshot })
  const first = new Map([[0, -1]])
  const firstList = () => [...first.entries()].sort((a, b) => a[0] - b[0]).map(([score, index]) => ({ score, index }))
  let score = 0
  let best = 0

  frame('start', L('let score = 0'), P('score = best = 0'), 'Start with score 0 before any day. The earliest position of score 0 is "before day one".', { hours, index: -1, score, best, first: firstList(), note: null })
  for (let i = 0; i < hours.length; i++) {
    const h = hours[i]
    score += h > 8 ? 1 : -1
    frame('inspect', L('score += hours[i]'), P('score += 1 if h > 8'), `Day ${i + 1} has ${h} hours, ${h > 8 ? 'which is tiring' : 'which is not tiring'}. The running score becomes ${score}.`, { hours, index: i, score, best, first: firstList(), note: null })
    let note
    if (score > 0) {
      best = i + 1
      note = `The score ${score} is positive, so the whole prefix up to day ${i + 1} is a valid interval of length ${i + 1}.`
      frame('update', L('if (score > 0) {'), P('if score > 0:'), note, { hours, index: i, score, best, first: firstList(), note })
    } else if (first.has(score - 1)) {
      const start = first.get(score - 1)
      const length = i - start
      best = Math.max(best, length)
      note = `Score ${score - 1} was first seen before day ${start + 2}. The days after it up to day ${i + 1} have one more tiring day than other days, a length of ${length}.`
      frame('update', L('} else if (first.has'), P('elif score - 1 in first:'), note, { hours, index: i, score, best, first: firstList(), note })
    } else {
      note = `The score ${score} is not positive, and score ${score - 1} has not appeared, so no interval ends here.`
      frame('update', L('} else if (first.has'), P('elif score - 1 in first:'), note, { hours, index: i, score, best, first: firstList(), note })
    }
    if (!first.has(score)) {
      first.set(score, i)
      frame('update', L('if (!first.has(score))'), P('first.setdefault(score, i)'), `Score ${score} is new, so remember day ${i + 1} as its earliest position.`, { hours, index: i, score, best, first: firstList(), note: null })
    }
  }
  frame('done', L('return best'), P('return best'), `The longest well-performing interval has length ${best}.`, { hours, index: hours.length, score, best, first: firstList(), note: null })
  return { input, result: best, frames }
}
