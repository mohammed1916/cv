const MAX_LENGTH = 24
const MOD = 1_000_000_007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 5 || nums.length > MAX_LENGTH) throw new Error(`nums has 5 to ${MAX_LENGTH} entries.`)
  for (const value of nums) {
    if (!Number.isInteger(value) || Math.abs(value) > 1e9) throw new Error('Each entry is an integer between -1000000000 and 1000000000.')
  }
  return { nums }
}

const c2 = k => (k * (k - 1)) / 2

// Spelled out value by value for the display: how many pairs from `side` avoid x and a and differ from each other.
function breakdown(pickSide, otherSide, x, xOnPickSide) {
  const rows = []
  for (const [a, count] of pickSide) {
    if (a === x || count === 0) continue
    const usable = [...otherSide].filter(([v, c]) => v !== x && v !== a && c > 0).map(([, c]) => c)
    let pairs = 0
    for (let p = 0; p < usable.length; p++) for (let q = p + 1; q < usable.length; q++) pairs += usable[p] * usable[q]
    rows.push({ other: a, copies: count, pairs, ways: xOnPickSide * count * pairs })
  }
  return rows
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  const left = new Map(nums.map(v => [v, 0]))
  const right = new Map(nums.map(v => [v, 0]))
  for (const v of nums) right.set(v, right.get(v) + 1)
  const values = [...left.keys()].sort((a, b) => a - b)
  let sumL2 = 0
  let sumR2 = 0
  for (const c of right.values()) sumR2 += c * c
  let lr = 0
  let lr2 = 0
  let l2r = 0
  let answer = 0

  const change = (x, dl, dr) => {
    let a = left.get(x)
    let b = right.get(x)
    sumL2 -= a * a; sumR2 -= b * b; lr -= a * b; lr2 -= a * b * b; l2r -= a * a * b
    a += dl
    b += dr
    left.set(x, a)
    right.set(x, b)
    sumL2 += a * a; sumR2 += b * b; lr += a * b; lr2 += a * b * b; l2r += a * a * b
  }

  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine: L(activeLine), pythonLine: P(pythonLine), message,
    at: -1, x: null, answer, freq: values.map(value => ({ value, left: left.get(value), right: right.get(value) })),
    totals: { sumL2, sumR2, lr, lr2, l2r }, cases: null, rows: null, gained: null, ...extra,
  })

  push('start', 'count every value as on the right', 'right = Counter(nums)', 'All values start on the right. The middle will slide across, and only the running totals change.')
  nums.forEach((x, at) => {
    change(x, 0, -1)
    const l = at
    const r = n - 1 - at
    const lx = left.get(x)
    const rx = right.get(x)
    const la = l - lx
    const ra = r - rx
    push('take', 'this position is the middle', 'change(x, 0, -1)', `Make index ${at} the middle. Remove its ${x} from the right, leaving ${l} on the left and ${r} on the right.`, { at, x })
    if (l >= 2 && r >= 2) {
      const many = lx * la * rx * ra + c2(lx) * c2(ra) + c2(la) * c2(rx) + c2(lx) * rx * ra + lx * la * c2(rx) + c2(lx) * c2(rx)
      const lrOther = lr - lx * rx
      const lr2Other = lr2 - lx * rx * rx
      const l2rOther = l2r - lx * lx * rx
      const q = sumR2 - rx * rx
      const p = sumL2 - lx * lx
      const oneLeft = lx * ((la * (ra * ra - q)) / 2 - ra * lrOther + lr2Other)
      const oneRight = rx * ((ra * (la * la - p)) / 2 - la * lrOther + l2rOther)
      const shape = { lx, rx, la, ra, total: c2(l) * c2(r) }
      const raw = [
        [c2(la) * c2(ra), rx * ra * c2(la), c2(rx) * c2(la)],
        [lx * la * c2(ra), lx * la * rx * ra, lx * la * c2(rx)],
        [c2(lx) * c2(ra), c2(lx) * rx * ra, c2(lx) * c2(rx)],
      ]
      const cases = (leftValid, rightValid) => ({ ...shape, raw, oneLeft: leftValid, oneRight: rightValid, many })
      push('many', 'picks with at least two more', 'many = lx * la * rx * ra', `Using ${x} at least twice among the other four makes it appear three or more times, and nothing else can catch it: ${many} picks are all good.`, { at, x, cases: cases(null, null) })
      push('oneLeft', 'one more on the left', 'one_left = lx', lx === 0
        ? `No ${x} on the left, so this case adds nothing.`
        : `One more ${x} from the left makes it appear twice. The other three must all differ, or a value ties it: ${oneLeft} of ${raw[1][0]} picks qualify.`,
      { at, x, cases: cases(oneLeft, null), rows: { side: 'left', list: breakdown(left, right, x, lx) } })
      push('oneRight', 'one more on the right', 'one_right = rx', rx === 0
        ? `No ${x} on the right, so this case adds nothing.`
        : `The mirror case, with the extra ${x} from the right: ${oneRight} of ${raw[0][1]} picks qualify.`,
      { at, x, cases: cases(oneLeft, oneRight), rows: { side: 'right', list: breakdown(right, left, x, rx) } })
      const gained = many + oneLeft + oneRight
      answer = (answer + gained) % MOD
      push('add', 'add the good picks', 'answer = (answer', `Middle at index ${at} contributes ${many} + ${oneLeft} + ${oneRight} = ${gained}. The running answer is ${answer}.`, { at, x, cases: cases(oneLeft, oneRight), gained })
    } else {
      push('skip', 'if two elements exist', 'if i >= 2', `Index ${at} is too close to an end to have two elements on both sides. It contributes nothing.`, { at, x })
    }
    change(x, 1, 0)
    push('move', 'move this value to the left', 'change(x, 1, 0)', `Its ${x} now counts as a left element, ready for the next middle.`, { at, x })
  })
  push('done', 'return the total', 'return answer', `Every middle has been counted. The answer is ${answer}.`)
  return { input: { nums }, result: answer, frames }
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Count every value on the right.' },
  { id: 'take', label: 'Middle', description: 'Fix the next index as the middle.' },
  { id: 'skip', label: 'Too close', description: 'Fewer than two elements on one side.' },
  { id: 'many', label: 'Three or more', description: 'x appears at least three times: always good.' },
  { id: 'oneLeft', label: 'Twice, left', description: 'x appears twice with its copy on the left.' },
  { id: 'oneRight', label: 'Twice, right', description: 'x appears twice with its copy on the right.' },
  { id: 'add', label: 'Add', description: 'Add this middle’s good picks.' },
  { id: 'move', label: 'Move', description: 'Move the middle value to the left counts.' },
  { id: 'done', label: 'Result', description: 'Return the total.' },
]

export const code = `count size-5 picks whose middle value is the only most frequent one
  count every value as on the right and clear the running sums
  for each index i with value x: this position is the middle, removed from the right
    if two elements exist on both sides
      count picks with at least two more copies of x
      count picks with one more on the left and three different others
      count picks with one more on the right and three different others
      add the good picks to the answer
    move this value to the left counts, updating the running sums
  return the total modulo 1,000,000,007`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `from collections import Counter

MOD = 10**9 + 7

def c2(k):
    return k * (k - 1) // 2

def count_middle_mode_subsequences(nums):
    n = len(nums)
    left = Counter()
    right = Counter(nums)
    sum_l2 = 0
    sum_r2 = sum(c * c for c in right.values())
    lr = lr2 = l2r = 0
    answer = 0

    def change(x, dl, dr):
        nonlocal sum_l2, sum_r2, lr, lr2, l2r
        a, b = left[x], right[x]
        sum_l2 -= a * a
        sum_r2 -= b * b
        lr -= a * b
        lr2 -= a * b * b
        l2r -= a * a * b
        a, b = a + dl, b + dr
        left[x], right[x] = a, b
        sum_l2 += a * a
        sum_r2 += b * b
        lr += a * b
        lr2 += a * b * b
        l2r += a * a * b

    for i, x in enumerate(nums):
        change(x, 0, -1)
        if i >= 2 and n - 1 - i >= 2:
            lx, rx = left[x], right[x]
            la, ra = i - lx, n - 1 - i - rx
            many = lx * la * rx * ra + c2(lx) * c2(ra) + c2(la) * c2(rx) \\
                + c2(lx) * rx * ra + lx * la * c2(rx) + c2(lx) * c2(rx)
            lr_other = lr - lx * rx
            lr2_other = lr2 - lx * rx * rx
            l2r_other = l2r - lx * lx * rx
            q = sum_r2 - rx * rx
            p = sum_l2 - lx * lx
            one_left = lx * (la * (ra * ra - q) // 2 - ra * lr_other + lr2_other)
            one_right = rx * (ra * (la * la - p) // 2 - la * lr_other + l2r_other)
            answer = (answer + many + one_left + one_right) % MOD
        change(x, 1, 0)
    return answer
`

const pythonLines = python.split('\n')
const P = s => {
  const index = pythonLines.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
