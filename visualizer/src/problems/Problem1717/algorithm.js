// Remove the more valuable pair first with a stack, then the other pair from what is left.
const JS_LINES = [
  { text: 'const [first, second] = x >= y ? ["ab", "ba"] : ["ba", "ab"]', py: 'if x >= y:' },
  { text: 'const [gainFirst, gainSecond] = x >= y ? [x, y] : [y, x]', py: "first, second, gain_first, gain_second = 'ab'" },
  { text: 'let score = 0', py: 'score = 0' },
  { text: 'const a = removePairs(s, first)', py: 'rest, taken = remove_pairs(s, first)' },
  { text: 'score += a.taken * gainFirst', py: 'score += taken * gain_first' },
  { text: 'const b = removePairs(a.rest, second)', py: 'rest, taken = remove_pairs(rest, second)' },
  { text: 'score += b.taken * gainSecond', py: 'score += taken * gain_second' },
  { text: 'return score', py: 'return score' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def maximumGain(s, x, y):
    if x >= y:
        first, second, gain_first, gain_second = 'ab', 'ba', x, y
    else:
        first, second, gain_first, gain_second = 'ba', 'ab', y, x
    score = 0
    rest, taken = remove_pairs(s, first)
    score += taken * gain_first
    rest, taken = remove_pairs(rest, second)
    score += taken * gain_second
    return score

def remove_pairs(text, pair):
    stack = []
    taken = 0
    for c in text:
        if stack and stack[-1] + c == pair:
            stack.pop()
            taken += 1
        else:
            stack.append(c)
    return ''.join(stack), taken
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return score')]))

export const phases = [
  { id: 'choose', label: 'Choose order', description: 'Remove the pair worth more points first.' },
  { id: 'first', label: 'First pass', description: 'The stack removes each more valuable pair it can form.' },
  { id: 'second', label: 'Second pass', description: 'The remaining string gives the less valuable pairs.' },
  { id: 'done', label: 'Result', description: 'The total points from both passes.' },
]

export const examples = [
  { label: 'Ba worth more', input: '{"s":"abbbaaba","x":4,"y":6}' },
  { label: 'Ab worth more', input: '{"s":"aabbab","x":5,"y":2}' },
  { label: 'Single a', input: '{"s":"a","x":3,"y":1}' },
  { label: 'Equal scores', input: '{"s":"ab","x":2,"y":2}' },
  { label: 'No pair to remove', input: '{"s":"aaaa","x":9,"y":1}' },
  { label: 'Long run: 30 letters', input: '{"s":"baaabaabbabbbaabbaaaabaabbabba","x":5000,"y":7000}' },
]

export const complexity = 'O(n) time and O(n) space for a string of length n.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string' || !Number.isInteger(input.x) || !Number.isInteger(input.y)) throw new Error('Use an object with a string s and integers x and y.')
  const { s, x, y } = input
  if (s.length < 1 || s.length > 30) throw new Error('s has 1 to 30 characters (visual cap).')
  if (!/^[ab]+$/.test(s)) throw new Error('s uses a and b only.')
  if (x < 0 || x > 10000 || y < 0 || y > 10000) throw new Error('x and y are from 0 to 10000.')
  return { s, x, y }
}

function removePairs(text, pair, frames, phase, line, kept) {
  const stack = []
  let taken = 0
  for (const c of text) {
    if (stack.length && stack[stack.length - 1] + c === pair) {
      stack.pop()
      taken++
      frames.push({ phase, activeLine: line, stack: [...stack], message: `Pair "${pair}" removed; ${taken} so far.`, snapshot: { taken: kept + taken, stack: [...stack] } })
    } else {
      stack.push(c)
      frames.push({ phase, activeLine: line, stack: [...stack], message: `Push "${c}" onto the stack.`, snapshot: { taken: kept + taken, stack: [...stack] } })
    }
  }
  return { rest: stack.join(''), taken }
}

export function buildTrace({ s, x, y }) {
  const frames = []
  const [first, second] = x >= y ? ['ab', 'ba'] : ['ba', 'ab']
  const [gainFirst, gainSecond] = x >= y ? [x, y] : [y, x]
  frames.push({ phase: 'choose', activeLine: 1, stack: [], message: `Pair "${first}" is worth ${gainFirst}; "${second}" is worth ${gainSecond}.`, snapshot: { taken: 0, stack: [] } })
  const a = removePairs(s, first, frames, 'first', 3, 0)
  const scoreA = a.taken * gainFirst
  const b = removePairs(a.rest, second, frames, 'second', 6, a.taken)
  const score = scoreA + b.taken * gainSecond
  frames.push({ phase: 'done', activeLine: 7, stack: [], result: score, message: `Score ${score}: ${a.taken} × ${gainFirst} + ${b.taken} × ${gainSecond}.`, snapshot: { taken: a.taken + b.taken, stack: [], result: score } })
  return { input: { s, x, y }, result: score, frames }
}
