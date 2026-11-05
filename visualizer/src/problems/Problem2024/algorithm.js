export const phases = [
  { id: 'start', label: 'Choose letter', description: 'Try making a run of T answers, then a run of F answers.' },
  { id: 'window', label: 'Window l to r', description: 'Extend r one question at a time; when more than k questions would need flipping, move l forward.' },
  { id: 'best', label: 'Best run', description: 'The window is valid while it needs at most k flips; keep the longest.' },
  { id: 'done', label: 'Result', description: 'Return the longest run over both letters.' },
]

export const code = `function maxConsecutiveAnswers(answerKey, k) {
  let best = 0
  for (const letter of ['T', 'F']) {
    let left = 0
    let flips = 0
    for (let right = 0; right < answerKey.length; right++) {
      if (answerKey[right] !== letter) flips++
      while (flips > k) {
        if (answerKey[left] !== letter) flips--
        left++
      }
      best = Math.max(best, right - left + 1)
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_consecutive_answers(answer_key, k):
    best = 0
    for letter in ['T', 'F']:
        left = 0
        flips = 0
        for right in range(len(answer_key)):
            if answer_key[right] != letter:
                flips += 1
            while flips > k:
                if answer_key[left] != letter:
                    flips -= 1
                left += 1
            best = max(best, right - left + 1)
    return best
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"answerKey":"TTFT","k":1}.') }
  const { answerKey, k } = obj || {}
  if (typeof answerKey !== 'string' || answerKey.length < 1 || answerKey.length > 40 || !/^[TF]+$/.test(answerKey)) throw new Error('answerKey must be 1 to 40 letters, each T or F.')
  if (!Number.isInteger(k) || k < 0 || k > answerKey.length) throw new Error('k must be a whole number from 0 to the key length.')
  return { answerKey, k }
}

export function buildTrace({ answerKey, k }) {
  const frames = []
  let best = 0
  let bestWindow = [0, -1]
  let bestLetter = null
  const add = (phase, c, p, message, letter, left, right, flips) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { answerKey, k, letter, l: left, r: right, flips, best, bestWindow, bestLetter },
  })
  add('start', "for (const letter of ['T', 'F'])", "for letter in ['T', 'F']", 'Try runs of T first, then runs of F.', 'T', -1, -1, 0)
  for (const letter of ['T', 'F']) {
    let left = 0, flips = 0
    for (let right = 0; right < answerKey.length; right++) {
      if (answerKey[right] !== letter) flips++
      while (flips > k) {
        if (answerKey[left] !== letter) flips--
        left++
      }
      const length = right - left + 1
      if (length > best) { best = length; bestWindow = [left, right]; bestLetter = letter }
      add('window', 'while (flips > k)', 'while flips > k', `Window ${left} to ${right} for ${letter}: ${flips} flip(s) needed, length ${length}.`, letter, left, right, flips)
    }
  }
  add('done', 'return best', 'return best', `Longest run: ${best}.`, bestLetter, bestWindow[0], bestWindow[1], 0)
  return { input: { answerKey, k }, result: best, frames }
}
