// LeetCode 3221: Maximum Array Hopping Score II.
// The recurrence from Problem 3205 is best[j] = max over i < j of best[i] - i * nums[j], plus j * nums[j].
// Each earlier index i is a line y = -i * x + best[i]. Lines arrive with decreasing slopes, so the useful
// lines form an upper hull; a landing value nums[j] is a query x on that hull, answered by binary search.

const CODE_TEXT = `function maxHopScore(nums) {
  const n = nums.length
  const best = [0]
  const hull = [{ m: 0, b: 0 }]
  const value = (line, x) => line.m * x + line.b
  const useless = (l1, l2, l3) => (l3.b - l2.b) * (l1.m - l2.m) >= (l2.b - l1.b) * (l2.m - l3.m)
  for (let j = 1; j < n; j++) {
    const x = nums[j]
    let lo = 0
    let hi = hull.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (value(hull[mid], x) < value(hull[mid + 1], x)) lo = mid + 1
      else hi = mid
    }
    best[j] = value(hull[lo], x) + j * x
    const line = { m: -j, b: best[j] }
    while (hull.length >= 2 && useless(hull[hull.length - 2], hull[hull.length - 1], line)) {
      hull.pop()
    }
    hull.push(line)
  }
  return best[n - 1]
}`.split('\n')
export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

export const python = `def max_hop_score(nums):
    n = len(nums)
    best = [0] * n
    hull = [(0, 0)]  # line for index i is (slope, intercept) = (-i, best[i])

    def value(line, x):
        return line[0] * x + line[1]

    def useless(l1, l2, l3):
        # slopes l1 > l2 > l3: l2 is never the maximum once l3 is added
        return (l3[1] - l2[1]) * (l1[0] - l2[0]) >= (l2[1] - l1[1]) * (l2[0] - l3[0])

    for j in range(1, n):
        x = nums[j]
        lo, hi = 0, len(hull) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if value(hull[mid], x) < value(hull[mid + 1], x):
                lo = mid + 1
            else:
                hi = mid
        best[j] = value(hull[lo], x) + j * x
        line = (-j, best[j])
        while len(hull) >= 2 and useless(hull[-2], hull[-1], line):
            hull.pop()
        hull.append(line)
    return best[n - 1]


if __name__ == "__main__":
    import json, sys
    print(max_hop_score(json.loads(sys.stdin.read())))
`

const PY_LINES = python.split('\n')
const L = s => { const n = code.findIndex(c => c.text.includes(s)) + 1; if (!n) throw new Error(`Missing pseudocode line: ${s}`); return n }
const P = s => { const n = PY_LINES.findIndex(l => l.includes(s)) + 1; if (!n) throw new Error(`Missing Python line: ${s}`); return n }

export const phases = [
  { id: 'start', label: 'Lines', description: 'Index 0 becomes the first line.' },
  { id: 'query', label: 'Query', description: 'Search the hull for the best line at x = nums[j].' },
  { id: 'extend', label: 'Extend', description: 'Turn the best line into best[j].' },
  { id: 'pop', label: 'Prune', description: 'Remove hull lines the new line makes useless.' },
  { id: 'add', label: 'Add', description: 'Add the line for index j.' },
  { id: 'done', label: 'Result', description: 'Report the score at the last index.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums is an array of 1 to 10 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) throw new Error('Each value is an integer from 0 to 100.')
  return nums.slice()
}

const value = (line, x) => line.m * x + line.b
const useless = (l1, l2, l3) => (l3.b - l2.b) * (l1.m - l2.m) >= (l2.b - l1.b) * (l2.m - l3.m)

export function buildTrace(nums) {
  const n = nums.length
  const best = Array(n).fill(null)
  const all = []
  const hull = []
  const frames = []
  const snap = extra => ({ nums, n, best: best.slice(), lines: all.map(l => ({ ...l })), hull: hull.map(l => l.i), ...extra })

  best[0] = 0
  const first = { i: 0, m: 0, b: 0 }
  all.push(first)
  hull.push(first)
  frames.push(snap({ phase: 'start', activeLine: L('const best = [0]'), pythonLine: P('best = [0] * n'), j: 0, x: null, lo: -1, hi: -1, mid: -1, chosen: -1, popped: -1, message: 'Index 0 becomes the first line: slope 0, intercept 0.' }))

  for (let j = 1; j < n; j++) {
    const x = nums[j]
    frames.push(snap({ phase: 'query', activeLine: L('const x = nums[j]'), pythonLine: P('x = nums[j]'), j, x, lo: 0, hi: hull.length - 1, mid: -1, chosen: -1, popped: -1, message: `Landing on ${j} queries the hull at x = ${x}.` }))
    let lo = 0
    let hi = hull.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      const left = value(hull[mid], x)
      const right = value(hull[mid + 1], x)
      if (left < right) lo = mid + 1
      else hi = mid
      frames.push(snap({ phase: 'query', activeLine: L('while (lo < hi)'), pythonLine: P('mid = (lo + hi)'), j, x, lo, hi, mid, chosen: -1, popped: -1, message: `Compare hull lines ${hull[mid].i} (${left}) and ${hull[mid + 1].i} (${right}) at x = ${x}; ${left < right ? 'move right' : 'keep the left side'}.` }))
    }
    const top = hull[lo]
    best[j] = value(top, x) + j * x
    frames.push(snap({ phase: 'extend', activeLine: L('best[j] = value(hull[lo], x)'), pythonLine: P('best[j] = value(hull[lo], x)'), j, x, lo, hi: lo, mid: -1, chosen: top.i, popped: -1, message: `Line ${top.i} gives ${value(top, x)} at x = ${x}; add ${j} * ${x} to get best[${j}] = ${best[j]}.` }))
    const line = { i: j, m: -j, b: best[j] }
    all.push(line)
    while (hull.length >= 2 && useless(hull[hull.length - 2], hull[hull.length - 1], line)) {
      const gone = hull.pop()
      frames.push(snap({ phase: 'pop', activeLine: L('hull.pop()'), pythonLine: P('hull.pop()'), j, x, lo: -1, hi: -1, mid: -1, chosen: -1, popped: gone.i, message: `Line ${gone.i} can never be the maximum once line ${j} is added; remove it.` }))
    }
    hull.push(line)
    frames.push(snap({ phase: 'add', activeLine: L('hull.push(line)'), pythonLine: P('hull.append(line)'), j, x, lo: -1, hi: -1, mid: -1, chosen: -1, popped: -1, message: `Line ${j} has slope ${-j} and intercept ${best[j]}; the hull now holds ${hull.length} line${hull.length === 1 ? '' : 's'}.` }))
  }
  const answer = best[n - 1]
  frames.push(snap({ phase: 'done', activeLine: L('return best[n - 1]'), pythonLine: P('return best[n - 1]'), j: n - 1, x: null, lo: -1, hi: -1, mid: -1, chosen: -1, popped: -1, message: `Best score reaching index ${n - 1}: ${answer}.` }))
  return { input: nums, result: answer, frames }
}
