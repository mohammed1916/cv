// LeetCode 1228: Missing Number In Arithmetic Progression. The full progression has n + 1 terms
// and n gaps, so the common difference is (last - first) / n. Binary search finds the first
// index where the array stops matching first + index * step.

export const phases = [
  { id: 'setup', label: 'Array', description: 'Read the progression with one term removed.' },
  { id: 'step', label: 'Step', description: 'Recover the common difference from the endpoints.' },
  { id: 'match', label: 'Match', description: 'This index still follows the progression.' },
  { id: 'gap', label: 'Gap', description: 'This index is past the missing term.' },
  { id: 'done', label: 'Answer', description: 'Report the missing value.' },
]

export const code = `FUNCTION missingValue(arr)
    n ← length of arr
    step ← (arr[n-1] - arr[0]) / n
    lo ← 1; hi ← n - 1
    WHILE lo < hi
        mid ← floor((lo + hi) / 2)
        IF arr[mid] equals arr[0] + mid * step THEN lo ← mid + 1
        ELSE hi ← mid
    RETURN arr[0] + lo * step`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def missing_value(arr):
    n = len(arr)
    step = (arr[-1] - arr[0]) // n
    lo, hi = 1, n - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] == arr[0] + mid * step:
            lo = mid + 1
        else:
            hi = mid
    return arr[0] + lo * step


if __name__ == "__main__":
    import sys, json
    print(json.dumps(missing_value(json.loads(sys.stdin.read()))))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const arr = typeof text === 'string' ? JSON.parse(text) : text
  if (!Array.isArray(arr) || arr.length < 2 || arr.length > 20) throw new Error('Use an array of 2 to 20 integers.')
  if (!arr.every(Number.isInteger)) throw new Error('Every value is an integer.')
  const span = arr[arr.length - 1] - arr[0]
  if (span % arr.length !== 0) throw new Error('The endpoints do not fit one common difference.')
  const step = span / arr.length
  const gaps = arr.slice(1).map((value, k) => value - arr[k]).filter(diff => diff !== step)
  if (step !== 0 && (gaps.length !== 1 || gaps[0] !== 2 * step)) {
    throw new Error('The array must be one common difference with a single removed term.')
  }
  return arr
}

export function buildTrace(arr) {
  const frames = []
  const n = arr.length
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    arr: arr.slice(), step: null, lo: -1, hi: -1, mid: -1, expected: null, missing: null, ...extra,
  })

  emit('setup', 'n ← length of arr', 'n = len(arr)', `${n} values remain, so the full progression has ${n + 1} terms.`)
  const step = (arr[n - 1] - arr[0]) / n
  emit('step', 'step ← (arr[n-1] - arr[0]) / n', 'step = (arr[-1] - arr[0]) // n', `Common difference ${step} from the endpoints ${arr[0]} and ${arr[n - 1]}.`, { step })
  let lo = 1
  let hi = n - 1
  emit('match', 'lo ← 1; hi ← n - 1', 'lo, hi = 1, n - 1', `Search indices ${lo} to ${hi} for the first index that breaks the pattern.`, { step, lo, hi })
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const expected = arr[0] + mid * step
    if (arr[mid] === expected) {
      emit('match', 'IF arr[mid] equals arr[0] + mid * step', 'if arr[mid] == arr[0] + mid * step', `Index ${mid} holds ${arr[mid]}, which matches ${expected}; the gap is later.`, { step, lo, hi, mid, expected })
      lo = mid + 1
    } else {
      emit('gap', 'ELSE hi ← mid', 'hi = mid', `Index ${mid} holds ${arr[mid]} but should be ${expected}; the gap is at or before it.`, { step, lo, hi, mid, expected })
      hi = mid
    }
  }
  const missing = arr[0] + lo * step
  emit('done', 'RETURN arr[0] + lo * step', 'return arr[0] + lo * step', `The missing term is ${missing}.`, { step, lo, hi, missing })
  return { input: arr, result: missing, frames }
}
