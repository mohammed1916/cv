// Maximum balls in a box: the box of a ball is the sum of its digits; count the balls per box and take the largest count.
const JS_LINES = [
  { text: 'const counts = new Map()', py: 'counts = Counter' },
  { text: 'for (let ball = lowLimit; ball <= highLimit; ball++) {', py: 'for ball in range' },
  { text: 'const box = digitSum(ball)', py: 'box = digit_sum' },
  { text: 'counts.set(box, (counts.get(box) ?? 0) + 1)', py: 'counts[box]' },
  { text: '}', py: null },
  { text: 'return Math.max(...counts.values())', py: 'return max(' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `from collections import Counter

def digit_sum(x):
    return sum(int(c) for c in str(x))

def countBalls(lowLimit, highLimit):
    counts = Counter()
    for ball in range(lowLimit, highLimit + 1):
        box = digit_sum(ball)
        counts[box] += 1
    return max(counts.values())
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return max(')]))

export const phases = [
  { id: 'ball', label: 'Ball', description: 'Take the next ball number.' },
  { id: 'box', label: 'Box', description: 'Its box is the sum of its digits.' },
  { id: 'count', label: 'Count', description: 'The box gains one ball.' },
  { id: 'done', label: 'Result', description: 'The largest count over all boxes.' },
]

export const examples = [
  { label: 'Short range', input: '{"lowLimit":5,"highLimit":15}' },
  { label: 'Ten to twenty', input: '{"lowLimit":10,"highLimit":20}' },
]

export const complexity = 'O(n * d) time for n balls with d digits each, and O(d * 9) space for the box sums.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.lowLimit) || !Number.isInteger(input.highLimit)) throw new Error('Use an object with integer lowLimit and highLimit.')
  const { lowLimit, highLimit } = input
  if (lowLimit < 1 || highLimit > 200 || lowLimit > highLimit) throw new Error('Use 1 <= lowLimit <= highLimit <= 200 (visual cap).')
  return { lowLimit, highLimit }
}

const digitSum = x => String(x).split('').reduce((s, c) => s + Number(c), 0)

export function buildTrace({ lowLimit, highLimit }) {
  const frames = []
  const counts = new Map()
  const snap = extra => ({ counts: Object.fromEntries(counts), ...extra })
  for (let ball = lowLimit; ball <= highLimit; ball++) {
    const box = digitSum(ball)
    frames.push({ phase: 'box', activeLine: 3, ball, box, message: `Ball ${ball} goes in box ${box}.`, snapshot: snap({}) })
    counts.set(box, (counts.get(box) ?? 0) + 1)
    frames.push({ phase: 'count', activeLine: 4, ball, box, message: `Box ${box} now has ${counts.get(box)}.`, snapshot: snap({}) })
  }
  const result = Math.max(...counts.values())
  frames.push({ phase: 'done', activeLine: 6, ball: null, box: null, result, message: `Largest box holds ${result} balls.`, snapshot: snap({ result }) })
  return { input: { lowLimit, highLimit }, result, frames }
}
