const line = (text) => text.split('\n').map((t, index) => ({ line: index + 1, text: t }))

export const code = line(`set answer to 0
for each range [l, r]
  total = 0
  for x from l to r
    total = total + base-4 digit count of x
  low = base-4 digit count of l
  answer = answer + max(low, ceil(total / 2))
return answer`)

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def digits4(x):
    count = 0
    while x > 0:
        x //= 4
        count += 1
    return count
def min_operations(ranges):
    answer = 0
    for l, r in ranges:
        total = 0
        for x in range(l, r + 1):
            total += digits4(x)
        low = digits4(l)
        answer += max(low, (total + 1) // 2)
    return answer`

const MAX_RANGES = 6
const MAX_VALUE = 60

export function digits4(x) {
  let count = 0
  for (let v = x; v > 0; v = Math.floor(v / 4)) count++
  return count
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a ranges list.')
  const { ranges } = input
  if (!Array.isArray(ranges) || ranges.length < 1 || ranges.length > MAX_RANGES) throw new Error(`ranges has 1 to ${MAX_RANGES} pairs.`)
  for (const pair of ranges) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger)) throw new Error('Each range is a pair of integers [l, r].')
    const [l, r] = pair
    if (l < 1 || r < l || r > MAX_VALUE) throw new Error(`Each range needs 1 <= l <= r <= ${MAX_VALUE}.`)
  }
  return { ranges }
}

// Knowledge-derived model: a number x needs digits4(x) divisions before it reaches zero, and each
// operation removes two divisions in total. The smallest element l may need more operations than
// half the total, so the answer for one range is max(digits4(l), ceil(total / 2)).
export function buildTrace({ ranges }) {
  const frames = []
  let answer = 0
  frames.push({ pythonLine: 8, phase: 'range', activeLine: L('set answer'), x: -1, l: 0, r: 0, total: 0, low: null, ops: null, answer,
    message: 'Start with no operations counted.' })
  for (const [l, r] of ranges) {
    frames.push({ pythonLine: 9, phase: 'range', activeLine: L('for each range'), x: -1, l, r, total: 0, low: null, ops: null, answer,
      message: `Range [${l}, ${r}]: add up the base-4 digit counts.` })
    let total = 0
    for (let x = l; x <= r; x++) {
      total += digits4(x)
      frames.push({ pythonLine: 12, phase: 'digits', activeLine: L('total = total +'), x, l, r, total, low: null, ops: null, answer,
        message: `digits4(${x}) = ${digits4(x)}, running total ${total}.` })
    }
    const low = digits4(l)
    const half = Math.ceil(total / 2)
    const ops = Math.max(low, half)
    answer += ops
    frames.push({ pythonLine: 14, phase: 'bound', activeLine: L('answer = answer +'), x: -1, l, r, total, low, ops, answer,
      message: `max(${low}, ceil(${total} / 2) = ${half}) = ${ops}. Answer so far ${answer}.` })
  }
  frames.push({ pythonLine: 15, phase: 'done', activeLine: L('return answer'), x: -1, l: 0, r: 0, total: 0, low: null, ops: null, answer,
    message: `All ranges handled. Total operations ${answer}.` })
  return { input: { ranges }, frames, result: answer }
}
