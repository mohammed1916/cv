// Each operation adds or subtracts two, so an element never changes parity.
// Its cheapest palindrome is therefore the nearest palindrome of the same parity,
// checked on both sides. Each step of two costs one operation.

const MAX_LENGTH = 12
const MAX_VALUE = 1000000000

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error('Use an array of 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error('Each value is an integer from 1 to 1000000000.')
  return nums
}

let cached = null
export function buildPalindromes() {
  if (cached) return cached
  const out = []
  for (let length = 1; length <= 10; length++) {
    const half = Math.ceil(length / 2)
    for (let head = 10 ** (half - 1); head < 10 ** half; head++) {
      const digits = String(head)
      const tail = digits.slice(0, length - half).split('').reverse().join('')
      out.push(Number(digits + tail))
    }
  }
  cached = out.sort((a, b) => a - b)
  return cached
}

// Nearest palindromes at or around x that share x's parity. Returns nulls only if none exist.
export function nearestSameParity(palins, x) {
  let lo = 0
  let hi = palins.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (palins[mid] < x) lo = mid + 1
    else hi = mid
  }
  let below = null
  let above = null
  for (let i = lo - 1; i >= 0; i--) {
    if ((palins[i] - x) % 2 === 0) { below = palins[i]; break }
  }
  for (let i = lo; i < palins.length; i++) {
    if ((palins[i] - x) % 2 === 0) { above = palins[i]; break }
  }
  return { below, above }
}

const parityWord = x => (x % 2 === 0 ? 'even' : 'odd')

export function buildTrace(nums) {
  const palins = buildPalindromes()
  const frames = []
  const costs = []
  let total = 0
  frames.push({
    phase: 'setup', activeLine: L('palins ← every'), pythonLine: P('palins = build_palindromes()'),
    index: -1, x: null, below: null, above: null, chosen: null, cost: null, costs: [], total,
    message: 'A sorted list of positive palindromes is ready. Each element is handled on its own.',
  })
  nums.forEach((x, index) => {
    const { below, above } = nearestSameParity(palins, x)
    const options = []
    if (below !== null) options.push({ target: below, cost: (x - below) / 2 })
    if (above !== null) options.push({ target: above, cost: (above - x) / 2 })
    const best = options.reduce((a, b) => (b.cost < a.cost ? b : a))
    frames.push({
      phase: 'search', activeLine: L('below ← largest'), pythonLine: P('below, above = nearest'),
      index, x, below, above, chosen: null, cost: null, costs: [...costs], total,
      message: `${x} is ${parityWord(x)}. Nearest same-parity palindromes: ${below} below and ${above} above.`,
    })
    costs.push(best.cost)
    total += best.cost
    frames.push({
      phase: 'add', activeLine: L('total ← total + cost'), pythonLine: P('total += min(options)'),
      index, x, below, above, chosen: best.target, cost: best.cost, costs: [...costs], total,
      message: `${x} becomes ${best.target} for ${best.cost} operation${best.cost === 1 ? '' : 's'}; running total ${total}.`,
    })
  })
  frames.push({
    phase: 'done', activeLine: L('RETURN total'), pythonLine: P('return total'),
    index: -1, x: null, below: null, above: null, chosen: null, cost: null, costs: [...costs], total,
    message: `Minimum total operations: ${total}.`,
  })
  return { input: nums, result: total, frames }
}

export const code = `FUNCTION minOperations(nums)
    palins ← every positive palindrome in increasing order
    total ← 0
    FOR each x in nums
        below ← largest palindrome ≤ x with the same parity as x
        above ← smallest palindrome ≥ x with the same parity as x
        cost ← smaller of (x − below) / 2 and (above − x) / 2
        total ← total + cost
    RETURN total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import bisect
import json
import sys


def build_palindromes():
    out = []
    for length in range(1, 11):
        half = (length + 1) // 2
        for head in range(10 ** (half - 1), 10 ** half):
            digits = str(head)
            tail = digits[: length - half][::-1]
            out.append(int(digits + tail))
    return sorted(out)


def nearest_same_parity(palins, x):
    idx = bisect.bisect_left(palins, x)
    below = None
    i = idx - 1
    while i >= 0:
        if (palins[i] - x) % 2 == 0:
            below = palins[i]
            break
        i -= 1
    above = None
    i = idx
    while i < len(palins):
        if (palins[i] - x) % 2 == 0:
            above = palins[i]
            break
        i += 1
    return below, above


def min_operations(nums):
    palins = build_palindromes()
    total = 0
    for x in nums:
        below, above = nearest_same_parity(palins, x)
        options = []
        if below is not None:
            options.append((x - below) // 2)
        if above is not None:
            options.append((above - x) // 2)
        total += min(options)
    return total


if __name__ == "__main__":
    print(min_operations(json.loads(sys.stdin.read())))
`
