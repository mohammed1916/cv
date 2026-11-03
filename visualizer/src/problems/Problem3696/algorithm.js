// Maximum distance between unequal words, version I.
// Reading used: distance is j - i for indices i < j whose words differ; 0 when no such pair exists.
// Two anchors do the work: the first word and the last word. The farthest differing partner of
// words[0] and of words[n - 1] gives the best pair.

const CODE_TEXT = `FUNCTION maxUnequalDistance(words)
    n ← number of words
    best ← 0
    FOR j from n - 1 down to 1
        IF words[j] ≠ words[0] THEN best ← j; STOP this scan
    FOR i from 0 up to n - 2
        IF words[i] ≠ words[n - 1] THEN best ← max(best, n - 1 - i); STOP this scan
    RETURN best`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `def max_unequal_distance(words):
    n = len(words)
    best = 0
    for j in range(n - 1, 0, -1):
        if words[j] != words[0]:
            best = j
            break
    for i in range(0, n - 1):
        if words[i] != words[n - 1]:
            best = max(best, n - 1 - i)
            break
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
  { id: 'setup', label: 'Anchors', description: 'Name the first and last words as anchors.' },
  { id: 'right', label: 'Right scan', description: 'Walk from the end toward the first word.' },
  { id: 'left', label: 'Left scan', description: 'Walk from the start toward the last word.' },
  { id: 'done', label: 'Answer', description: 'Report the larger distance, or zero.' },
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
  let best = 0
  let pair = null
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message, best, pair, anchors: [0, n - 1],
    scan: null, found: null, ...extra,
  })
  push('setup', 'n ← number of words', 'n = len(words)', `Anchors: words[0] = "${words[0]}" and words[${n - 1}] = "${words[n - 1]}".`)
  push('setup', 'best ← 0', 'best = 0', 'Best distance starts at zero.')
  let found = false
  for (let j = n - 1; j >= 1 && !found; j -= 1) {
    if (words[j] !== words[0]) {
      found = true
      best = j
      pair = [0, j]
      push('right', 'IF words[j] ≠ words[0]', 'if words[j] != words[0]', `words[${j}] differs from the first word: pair (0, ${j}) has distance ${j}.`, { scan: j, found: true })
      break
    }
    push('right', 'FOR j from n - 1 down to 1', 'for j in range(n - 1, 0, -1)', `words[${j}] = "${words[j]}" matches the first word; keep scanning inward.`, { scan: j, found: false })
  }
  if (!found) push('right', 'FOR j from n - 1 down to 1', 'for j in range(n - 1, 0, -1)', 'Every word matches the first word, so this scan finds nothing.', { scan: null, found: false })
  found = false
  for (let i = 0; i <= n - 2 && !found; i += 1) {
    if (words[i] !== words[n - 1]) {
      found = true
      const distance = n - 1 - i
      if (distance > best) { best = distance; pair = [i, n - 1] }
      push('left', 'IF words[i] ≠ words[n - 1]', 'if words[i] != words[n - 1]', `words[${i}] differs from the last word: pair (${i}, ${n - 1}) has distance ${distance}.`, { scan: i, found: true })
      break
    }
    push('left', 'FOR i from 0 up to n - 2', 'for i in range(0, n - 1)', `words[${i}] = "${words[i]}" matches the last word; keep scanning inward.`, { scan: i, found: false })
  }
  if (!found) push('left', 'FOR i from 0 up to n - 2', 'for i in range(0, n - 1)', 'Every word matches the last word, so this scan finds nothing.', { scan: null, found: false })
  push('done', 'RETURN best', 'return best', `Largest unequal distance: ${best}.`, { best, pair: best > 0 ? pair : null })
  return { input: words, result: best, frames }
}
