function isBits(list) {
  return Array.isArray(list) && list.every(value => value === 0 || value === 1)
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  if (!isBits(nums1) || !isBits(nums2)) throw new Error('nums1 and nums2 hold only 0 and 1.')
  if (nums1.length > 8) throw new Error('nums1 has 0 to 8 entries in this visualization.')
  if (nums2.length < 1 || nums2.length > 8) throw new Error('nums2 has 1 to 8 entries in this visualization.')
  return { nums1, nums2 }
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Nothing placed, so the largest integer used is 0.' },
  { id: 'edge', label: 'One array', description: 'Only one array has started, so there is one way in.' },
  { id: 'fill', label: 'Compare', description: 'Either array could have placed its entry last; keep the smaller maximum.' },
  { id: 'done', label: 'Result', description: 'The corner cell holds the answer.' },
]

export const code = `smallest possible largest integer
  set f[0][0] to 0, nothing is placed yet
  fill the left edge: only nums1 has entries
  fill the top edge: only nums2 has entries
  for every other cell (i, j)
    option 1: nums1[i-1] goes last, next right-parity integer after f[i-1][j]
    option 2: nums2[j-1] goes last, next right-parity integer after f[i][j-1]
    f[i][j] is the smaller option
  return f[m][n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def min_largest(nums1, nums2):
    def next_value(x, want):
        return x + 1 if (x + 1) % 2 == want else x + 2

    m, n = len(nums1), len(nums2)
    f = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        f[i][0] = next_value(f[i - 1][0], nums1[i - 1])
    for j in range(1, n + 1):
        f[0][j] = next_value(f[0][j - 1], nums2[j - 1])
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            from_top = next_value(f[i - 1][j], nums1[i - 1])
            from_left = next_value(f[i][j - 1], nums2[j - 1])
            f[i][j] = min(from_top, from_left)
    return f[m][n]
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

// Smallest integer above x whose parity matches want (0 even, 1 odd).
export function nextValue(x, want) {
  return (x + 1) % 2 === want ? x + 1 : x + 2
}

const parityWord = want => (want === 0 ? 'even' : 'odd')

export function buildTrace({ nums1, nums2 }) {
  const m = nums1.length, n = nums2.length
  const f = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null))
  // Which array placed the last integer for each cell: 1, 2, or 0 at the empty start.
  const last = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const frames = []
  const copyTable = () => f.map(row => [...row])

  // Walk back from (i, j) to recover real integers for the two prefixes.
  const placementFor = (i, j) => {
    const a = Array(i).fill(null), b = Array(j).fill(null)
    let r = i, c = j
    const path = [[r, c]]
    while (r > 0 || c > 0) {
      if (last[r][c] === 1) { a[r - 1] = f[r][c]; r-- } else { b[c - 1] = f[r][c]; c-- }
      path.push([r, c])
    }
    return { a, b, path: path.reverse() }
  }

  f[0][0] = 0
  frames.push({
    phase: 'start', activeLine: L('set f[0][0]'), pythonLine: P('f = [[0]'), values: copyTable(), target: [0, 0], sources: [],
    placement: placementFor(0, 0), recurrence: 'f[0][0] = 0', why: 'With nothing placed, the largest integer used so far is 0.',
    message: 'Before placing anything the maximum is 0.',
  })

  for (let i = 1; i <= m; i++) {
    const want = nums1[i - 1]
    f[i][0] = nextValue(f[i - 1][0], want)
    last[i][0] = 1
    frames.push({
      phase: 'edge', activeLine: L('fill the left edge'), pythonLine: P('f[i][0] = next_value'), values: copyTable(), target: [i, 0],
      sources: [{ cell: [i - 1, 0], note: `nums1[${i - 1}] is ${parityWord(want)}`, chosen: true }], placement: placementFor(i, 0),
      recurrence: `next ${parityWord(want)} after ${f[i - 1][0]} is ${f[i][0]}`, why: 'nums2 has not started, so nums1 must have placed this entry last.',
      message: `nums1[${i - 1}] is ${want}, so it needs the next ${parityWord(want)} integer after ${f[i - 1][0]}: ${f[i][0]}.`,
    })
  }
  for (let j = 1; j <= n; j++) {
    const want = nums2[j - 1]
    f[0][j] = nextValue(f[0][j - 1], want)
    last[0][j] = 2
    frames.push({
      phase: 'edge', activeLine: L('fill the top edge'), pythonLine: P('f[0][j] = next_value'), values: copyTable(), target: [0, j],
      sources: [{ cell: [0, j - 1], note: `nums2[${j - 1}] is ${parityWord(want)}`, chosen: true }], placement: placementFor(0, j),
      recurrence: `next ${parityWord(want)} after ${f[0][j - 1]} is ${f[0][j]}`, why: 'nums1 has not started, so nums2 must have placed this entry last.',
      message: `nums2[${j - 1}] is ${want}, so it needs the next ${parityWord(want)} integer after ${f[0][j - 1]}: ${f[0][j]}.`,
    })
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const fromTop = nextValue(f[i - 1][j], nums1[i - 1])
      const fromLeft = nextValue(f[i][j - 1], nums2[j - 1])
      const useTop = fromTop <= fromLeft
      f[i][j] = useTop ? fromTop : fromLeft
      last[i][j] = useTop ? 1 : 2
      frames.push({
        phase: 'fill', activeLine: L('f[i][j] is the smaller'), pythonLine: P('f[i][j] = min'), values: copyTable(), target: [i, j],
        sources: [
          { cell: [i - 1, j], note: `nums1[${i - 1}] last gives ${fromTop}`, chosen: useTop },
          { cell: [i, j - 1], note: `nums2[${j - 1}] last gives ${fromLeft}`, chosen: !useTop },
        ],
        placement: placementFor(i, j), fromTop, fromLeft,
        recurrence: `min(${fromTop}, ${fromLeft}) = ${f[i][j]}`, why: 'Whichever entry goes last must exceed everything already placed, so it takes the next integer of its own parity.',
        message: `Last entry from nums1 gives ${fromTop}; from nums2 gives ${fromLeft}. Keep ${f[i][j]}.`,
      })
    }
  }
  const result = f[m][n]
  const placement = placementFor(m, n)
  frames.push({
    phase: 'done', activeLine: L('return f[m][n]'), pythonLine: P('return f[m][n]'), values: copyTable(), target: [m, n], sources: [],
    placement, recurrence: `answer = f[${m}][${n}] = ${result}`, why: 'Both arrays are fully placed in this cell.',
    message: `Return ${result}. One valid filling: nums1 = [${placement.a.join(', ')}], nums2 = [${placement.b.join(', ')}].`,
  })
  return { input: { nums1, nums2 }, result, frames }
}
