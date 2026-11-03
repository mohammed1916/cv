// Maximum distance between unequal words, version II (larger limits).
// Reading used: distance is j - i for indices i < j whose words differ; 0 when every word is equal.
// One pass: for each j, the earliest partner is index 0 when words[j] differs from words[0];
// otherwise it is the first index whose word differs from words[0], provided that index comes before j.

const CODE_TEXT = `FUNCTION maxUnequalDistance(words)
    n ← number of words
    first ← first index whose word differs from words[0], or none
    best ← 0
    FOR j from 1 to n - 1
        IF words[j] ≠ words[0] THEN i ← 0
        ELSE IF first exists AND first < j THEN i ← first
        ELSE CONTINUE
        best ← max(best, j - i)
    RETURN best`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `def max_unequal_distance(words):
    n = len(words)
    first = next((k for k in range(n) if words[k] != words[0]), None)
    best = 0
    for j in range(1, n):
        if words[j] != words[0]:
            i = 0
        elif first is not None and first < j:
            i = first
        else:
            continue
        best = max(best, j - i)
    return best


if __name__ == "__main__":
    import json
    import sys
    print(json.dumps(max_unequal_distance(json.loads(sys.stdin.read()))))
`

const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'setup', label: 'Reference', description: 'Find the first word that differs from words[0].' },
  { id: 'sweep', label: 'Sweep', description: 'Move j left to right and pick its earliest unequal partner.' },
  { id: 'done', label: 'Answer', description: 'Report the largest distance seen.' },
]

export function parseInput(text) {
  const words = JSON.parse(text)
  if (!Array.isArray(words) || words.length < 1 || words.length > 12) throw new Error('Use a list of 1 to 12 words.')
  if (!words.every(w => typeof w === 'string' && /^[a-z]{1,8}$/.test(w))) throw new Error('Each word is 1 to 8 lowercase letters.')
  return words
}

export function buildTrace(words) {
  const n = words.length
  const frames = []
  let first = null
  for (let k = 0; k < n; k += 1) {
    if (words[k] !== words[0]) { first = k; break }
  }
  let best = 0
  let pair = null
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message, best, pair, first, j: -1, partner: null, ...extra,
  })
  push('setup', 'first ← first index', 'first = next', first === null ? 'Every word equals words[0]; no reference partner exists.' : `First word unlike words[0] is at index ${first}.`)
  push('setup', 'best ← 0', 'best = 0', 'Best distance starts at zero.')
  for (let j = 1; j < n; j += 1) {
    let i = null
    if (words[j] !== words[0]) {
      i = 0
      push('sweep', 'IF words[j] ≠ words[0] THEN i ← 0', 'if words[j] != words[0]', `words[${j}] differs from words[0]; the earliest partner is index 0.`, { j, partner: 0 })
    } else if (first !== null && first < j) {
      i = first
      push('sweep', 'ELSE IF first exists AND first < j', 'elif first is not None', `words[${j}] matches words[0]; the earliest unlike word is at ${first}.`, { j, partner: first })
    } else {
      push('sweep', 'ELSE CONTINUE', 'continue', `words[${j}] matches words[0] and no unlike word comes before it.`, { j, partner: null })
      continue
    }
    const distance = j - i
    if (distance > best) { best = distance; pair = [i, j] }
    push('sweep', 'best ← max(best, j - i)', 'best = max(best, j - i)', `Pair (${i}, ${j}) has distance ${distance}; best is ${best}.`, { j, partner: i, best, pair })
  }
  push('done', 'RETURN best', 'return best', `Largest unequal distance: ${best}.`, { j: -1, partner: null, best, pair: best > 0 ? pair : null })
  return { input: words, result: best, frames }
}
