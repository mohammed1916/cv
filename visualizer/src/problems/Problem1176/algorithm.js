export const phases = [
  { id: 'setup', label: 'First window', description: 'Add up the first window of values.' },
  { id: 'slide', label: 'Slide', description: 'Move the window one step right: add the entering value and remove the leaving one.' },
  { id: 'score', label: 'Score window', description: 'Compare the window total with both limits and update the score.' },
  { id: 'done', label: 'Complete', description: 'Return the final score.' },
]

const CODE = [
  'function windowScore(values, window, low, high) {',
  '  let total = values.slice(0, window).reduce((a, b) => a + b, 0), score = 0',
  '  for (let start = 0; start <= values.length - window; start++) {',
  '    if (start > 0) total += values[start + window - 1] - values[start - 1]',
  '    if (total > high) score += 1',
  '    else if (total < low) score -= 1',
  '  }',
  '  return score',
  '}',
]
const PY = [
  'def window_score(values, window, low, high):',
  '    total = sum(values[:window])',
  '    score = 0',
  '    for start in range(len(values) - window + 1):',
  '        if start > 0:',
  '            total += values[start + window - 1] - values[start - 1]',
  '        if total > high:',
  '            score += 1',
  '        elif total < low:',
  '            score -= 1',
  '    return score',
]

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n')

const L = { init: 2, loop: 3, slide: 4, high: 5, low: 6, ret: 8 }
const P = { init: 2, loop: 4, slide: 6, high: 7, low: 9, ret: 11 }

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"values": [1, 2, 3], "window": 2, "low": 3, "high": 5}.') }
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with values, window, low and high.')
  const { values, window, low, high } = input
  if (!Array.isArray(values) || values.length < 1 || values.length > 50 || !values.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) {
    throw new Error('values is a list of 1 to 50 whole numbers from 0 to 1000.')
  }
  if (!Number.isInteger(window) || window < 1 || window > values.length) throw new Error('window must be a whole number from 1 to the length of values.')
  if (!Number.isInteger(low) || !Number.isInteger(high) || low < 0 || low > high) throw new Error('low and high must be whole numbers with 0 ≤ low ≤ high.')
  return { values, window, low, high }
}

export function buildTrace({ values, window, low, high }) {
  const n = values.length
  const sums = []
  const frames = []
  const state = { values, window, low, high, start: null, total: null, verdict: null, score: 0, sums }
  const push = (phase, key, message) => frames.push({
    phase, activeLine: L[key], pythonLine: P[key], message,
    snapshot: { ...state, sums: [...sums] },
  })

  let total = 0
  for (let i = 0; i < window; i++) total += values[i]
  Object.assign(state, { start: 0, total })
  push('setup', 'init', `The first window has ${window} values and totals ${total}.`)

  for (let start = 0; start <= n - window; start++) {
    if (start > 0) {
      const entering = values[start + window - 1]
      const leaving = values[start - 1]
      total += entering - leaving
      Object.assign(state, { start, total })
      push('slide', 'slide', `The window starting at index ${start} adds ${entering} and drops ${leaving}, so its total is ${total}.`)
    }
    let verdict = 'inside'
    if (total > high) { verdict = 'above'; state.score += 1 } else if (total < low) { verdict = 'below'; state.score -= 1 }
    sums.push(total)
    Object.assign(state, { start, total, verdict })
    const key = verdict === 'above' ? 'high' : verdict === 'below' ? 'low' : 'loop'
    const reason = verdict === 'above'
      ? `${total} is above ${high}, so the score goes up by 1.`
      : verdict === 'below'
        ? `${total} is below ${low}, so the score goes down by 1.`
        : `${total} lies within [${low}, ${high}], so the score stays the same.`
    push('score', key, `Window at index ${start}: ${reason} Score is now ${state.score}.`)
  }

  Object.assign(state, { start: null, verdict: null })
  push('done', 'ret', `Final score: ${state.score}.`)
  return { input: { values, window, low, high }, result: state.score, frames }
}

export const inputLabel = 'JSON with values, window, low and high, e.g. {"values":[1,2,3],"window":2,"low":3,"high":5}'
export const complexity = 'O(n) time: each window total is updated from the previous one with one addition and one subtraction. The visualization caps the input at 50 values.'
export const examples = [
  { label: 'Mixed days', input: '{"values":[6,1,4,4,2,7,1],"window":3,"low":10,"high":12}' },
  { label: 'Always inside', input: '{"values":[3,3,3],"window":2,"low":5,"high":9}' },
  { label: 'Single day', input: '{"values":[9,2],"window":1,"low":3,"high":8}' },
]
