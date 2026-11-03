// Teaching model written for this visualizer. The sample words and wording are original.
export const phases = [
  { id: 'count', label: 'Count', description: 'Tally the letters of s and of t.' },
  { id: 'compare', label: 'Compare', description: 'For each letter, check whether t has more copies than s.' },
  { id: 'add', label: 'Add surplus', description: 'Each surplus copy in t needs one change.' },
  { id: 'done', label: 'Result', description: 'The total surplus is the minimum number of changes.' },
]

const CODE = [
  'minimum steps(s, t):',
  '  count the letters of s and of t',
  '  steps = 0',
  '  for each letter c from a to z:',
  '    if t has more c than s:',
  '      steps += the extra c in t',
  '  return steps',
]
const PYTHON = `def min_steps(s, t):
    count_s, count_t = Counter(s), Counter(t)
    steps = 0
    for letter in ascii_lowercase:
        if count_t[letter] > count_s[letter]:
            steps += count_t[letter] - count_s[letter]
    return steps`
const PY = PYTHON.split('\n')
const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing solver line: ${text}`)
  return index + 1
}
const L = text => at(CODE, text)
const P = text => at(PY, text)

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string' || typeof input.t !== 'string') throw new Error('Enter a JSON object with string fields s and t.')
  if (input.s.length !== input.t.length) throw new Error('s and t must have the same length.')
  if (input.s.length < 1 || input.s.length > 20) throw new Error('Use 1 to 20 letters.')
  if (!/^[a-z]+$/.test(input.s + input.t)) throw new Error('Use lowercase letters a to z only.')
  return { s: input.s, t: input.t }
}

export function buildTrace(input) {
  const { s, t } = input
  const countS = Object.fromEntries([...LETTERS].map(c => [c, 0]))
  const countT = Object.fromEntries([...LETTERS].map(c => [c, 0]))
  for (const ch of s) countS[ch] += 1
  for (const ch of t) countT[ch] += 1
  let steps = 0
  const frames = []
  const snap = (letter = null, extra = 0) => ({ s, t, countS: { ...countS }, countT: { ...countT }, letter, extra, steps })

  frames.push({
    phase: 'count', activeLine: L('count the letters'), pythonLine: P('count_s, count_t'),
    message: `Tally both words. s = "${s}" and t = "${t}" both have ${s.length} letters, so a change can fix one mismatch at a time.`,
    snapshot: snap(),
  })
  for (const c of LETTERS) {
    if (!countS[c] && !countT[c]) continue
    const extra = countT[c] - countS[c]
    frames.push({
      phase: 'compare', activeLine: L('if t has more c'), pythonLine: P('if count_t'),
      message: `Letter ${c}: t has ${countT[c]} and s has ${countS[c]}. ${extra > 0 ? `t has ${extra} more, so those are surplus.` : 'No surplus here.'}`,
      snapshot: snap(c),
    })
    if (extra > 0) {
      steps += extra
      frames.push({
        phase: 'add', activeLine: L('steps += the extra'), pythonLine: P('steps +='),
        message: `Add ${extra} to the step count. Each surplus ${c} in t is changed to a letter that s has more of than t does.`,
        snapshot: snap(c, extra),
      })
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return steps'), pythonLine: P('return steps'),
    message: `Every surplus copy needs one change, so ${steps} step${steps === 1 ? '' : 's'} is the minimum.`,
    snapshot: snap(),
  })
  return { input, result: steps, frames }
}
