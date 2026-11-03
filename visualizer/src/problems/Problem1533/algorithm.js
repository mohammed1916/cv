export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.array)) throw new Error('Use an object with an array list.')
  const values = input.array
  if (values.length < 2 || values.length > 20) throw new Error('The visualization accepts 2 to 20 elements.')
  if (!values.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('Elements are integers between -1000 and 1000.')
  const top = Math.max(...values)
  const count = values.filter(v => v === top).length
  const below = values.filter(v => v < top)
  if (count !== 1 || below.some(v => v !== below[0])) throw new Error('Exactly one element must be larger, and all others equal.')
  return { array: values }
}

const sumRange = (values, l, r) => values.slice(l, r + 1).reduce((a, b) => a + b, 0)

export const code = `find the index of the single larger element
  set lo to 0 and hi to the last index
  while lo is less than hi
    half is the length of [lo, hi] divided by 2
    compare the sum of [lo, lo + half - 1] with the sum of [lo + half, lo + 2 * half - 1]
    if the left sum is greater then the larger element is in the left half: hi = lo + half - 1
    else if the left sum is less then the larger element is in the right half: lo = lo + half
    else the sums are equal, so the leftover index hi holds the larger element: lo = hi
  return lo`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `class ArrayReader:
    """Stand-in reader: compare_sub reports how two equal-length ranges compare."""
    def __init__(self, values):
        self._values = values
        self.queries = 0

    def length(self):
        return len(self._values)

    def compare_sub(self, l, r, x, y):
        self.queries += 1
        left = sum(self._values[l:r + 1])
        right = sum(self._values[x:y + 1])
        return (left > right) - (left < right)

def find_large_index(reader):
    lo, hi = 0, reader.length() - 1
    while lo < hi:
        half = (hi - lo + 1) // 2
        result = reader.compare_sub(lo, lo + half - 1, lo + half, lo + 2 * half - 1)
        if result > 0:
            hi = lo + half - 1
        elif result < 0:
            lo = lo + half
        else:
            lo = hi
    return lo

if __name__ == "__main__":
    reader = ArrayReader([3, 3, 3, 9, 3, 3, 3])
    print(find_large_index(reader), reader.queries)
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ array }) {
  const frames = []
  let lo = 0
  let hi = array.length - 1
  let queries = 0
  let left = null
  let right = null
  let cmp = null
  let answer = null
  const push = (frame) => frames.push({ lo, hi, left, right, cmp, queries, answer, ...frame })

  push({ pythonLine: P('lo, hi = 0, reader.length() - 1'), phase: 'start', activeLine: L('set lo to 0'), message: `Search indices 0 to ${hi}.` })
  while (lo < hi) {
    const half = Math.floor((hi - lo + 1) / 2)
    left = [lo, lo + half - 1]
    right = [lo + half, lo + 2 * half - 1]
    push({ pythonLine: P('half = (hi - lo + 1) // 2'), phase: 'window', activeLine: L('half is the length'), message: `Split [${lo}, ${hi}] into two halves of ${half}.` })
    queries += 1
    cmp = Math.sign(sumRange(array, left[0], left[1]) - sumRange(array, right[0], right[1]))
    const side = cmp > 0 ? 'left' : cmp < 0 ? 'right' : 'equal'
    push({ pythonLine: P('result = reader.compare_sub'), phase: 'compare', activeLine: L('compare the sum of'), message: cmp > 0 ? 'The left half sums higher, so the big element is on the left.' : cmp < 0 ? 'The right half sums higher, so the big element is on the right.' : 'The halves tie, so the big element is the single leftover index.' })
    if (side === 'left') {
      hi = lo + half - 1
      push({ pythonLine: P('hi = lo + half - 1'), phase: 'narrow', activeLine: L('if the left sum is greater'), message: `Keep the left half: indices ${lo} to ${hi}.` })
    } else if (side === 'right') {
      lo = lo + half
      push({ pythonLine: P('lo = lo + half'), phase: 'narrow', activeLine: L('else if the left sum is less'), message: `Keep the right half: indices ${lo} to ${hi}.` })
    } else {
      lo = hi
      push({ pythonLine: P('lo = hi'), phase: 'narrow', activeLine: L('else the sums are equal'), message: `The leftover index ${hi} holds the larger element.` })
    }
    left = null
    right = null
    cmp = null
  }
  answer = lo
  push({ pythonLine: P('return lo'), phase: 'done', activeLine: L('return lo'), message: `Index ${answer} holds the larger element after ${queries} comparison${queries === 1 ? '' : 's'}.` })
  return { input: { array }, result: answer, frames, queries }
}
