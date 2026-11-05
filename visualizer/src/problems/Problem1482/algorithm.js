export const phases = [
  { id: 'start', label: 'Start', description: 'Read the garden. A day is the answer only if m bouquets of k adjacent bloomed flowers fit.' },
  { id: 'check', label: 'Enough flowers', description: 'If m times k is more than the number of flowers, no day can work, so return -1.' },
  { id: 'probe', label: 'Test the middle day', description: 'Pick the middle day of the search range [lo, hi] and test whether m bouquets can be made by then.' },
  { id: 'scan', label: 'Scan flowers', description: 'Walk the garden: bloomed flowers extend a run, and a run of k makes one bouquet.' },
  { id: 'feasible', label: 'Feasible', description: 'The middle day works, so the answer is this day or earlier: move hi down to it.' },
  { id: 'infeasible', label: 'Not feasible', description: 'The middle day is too early, so the answer is later: move lo just above it.' },
  { id: 'done', label: 'Complete', description: 'lo equals hi: the earliest day that works.' },
]

export const examples = [
  { label: 'Feasible in the middle', input: '{"bloomDay":[7,3,9,2,8,4,6,5],"m":2,"k":3}' },
  { label: 'Too few flowers', input: '{"bloomDay":[4,9,2],"m":2,"k":2}' },
  { label: 'Single bouquet', input: '{"bloomDay":[5,1,4],"m":1,"k":2}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.bloomDay) || !Number.isInteger(data.m) || !Number.isInteger(data.k)) {
    throw new Error('Use an object with an integer array bloomDay and integers m and k, for example {"bloomDay":[1,3,2],"m":1,"k":2}.')
  }
  if (data.bloomDay.length < 1 || data.bloomDay.length > 60) throw new Error('bloomDay must have 1 to 60 flowers in this visualization.')
  if (!data.bloomDay.every(v => Number.isInteger(v) && v >= 1 && v <= 1000000000)) throw new Error('Every bloom day must be an integer from 1 to 1000000000.')
  if (data.m < 1 || data.m > 60) throw new Error('m must be from 1 to 60.')
  if (data.k < 1 || data.k > 60) throw new Error('k must be from 1 to 60.')
  return { bloomDay: data.bloomDay, m: data.m, k: data.k }
}

export function buildTrace({ bloomDay, m, k }) {
  const n = bloomDay.length
  const frames = []
  const snap = (lo, hi, mid, extra = {}) => ({ bloomDay, lo, hi, mid, ...extra })
  frames.push({ phase: 'start', activeLine: L('function minDays'), pythonLine: P('def min_days'), snapshot: snap(null, null, null),
    message: `We need ${m} bouquets of ${k} adjacent flowers; each flower can be picked only after it blooms. The garden has ${n} flowers.` })
  if (m * k > n) {
    frames.push({ phase: 'check', activeLine: L('if (m * k > n)'), pythonLine: P('if m * k > n'), snapshot: snap(null, null, null),
      message: `${m} bouquets need ${m * k} flowers, but the garden has only ${n}. No day can work, so the answer is -1.` })
    frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: P('return -1'), snapshot: snap(null, null, null), message: 'The answer is -1.', result: -1 })
    for (const f of frames) f.scene = f.snapshot
    return { input: { bloomDay, m, k }, result: -1, frames }
  }
  const canMake = day => {
    let bouquets = 0, run = 0
    for (const bloom of bloomDay) {
      run = bloom <= day ? run + 1 : 0
      if (run === k) { bouquets++; run = 0 }
    }
    return bouquets >= m
  }
  let lo = Math.min(...bloomDay), hi = Math.max(...bloomDay)
  frames.push({ phase: 'probe', activeLine: L('let lo = Math.min'), pythonLine: P('lo, hi = min'), snapshot: snap(lo, hi, null),
    message: `The answer lies between the earliest day ${lo} and the latest day ${hi}.` })
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    frames.push({ phase: 'probe', activeLine: L('const mid ='), pythonLine: P('mid = (lo + hi)'), snapshot: snap(lo, hi, mid),
      message: `Test day ${mid}, the middle of [${lo}, ${hi}].` })
    if (canMake(mid)) {
      hi = mid
      frames.push({ phase: 'feasible', activeLine: L('hi = mid'), pythonLine: P('hi = mid'), snapshot: snap(lo, hi, mid, { ok: true }),
        message: `Day ${mid} makes ${m} bouquets, so the answer is ${mid} or earlier: hi becomes ${hi}.` })
    } else {
      lo = mid + 1
      frames.push({ phase: 'infeasible', activeLine: L('lo = mid + 1'), pythonLine: P('lo = mid + 1'), snapshot: snap(lo, hi, mid, { ok: false }),
        message: `Day ${mid} is too early for ${m} bouquets, so lo becomes ${lo}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return lo'), pythonLine: P('return lo'), snapshot: snap(lo, hi, null, { result: lo }),
    message: `lo equals hi, so the earliest working day is ${lo}.`, result: lo })
  for (const f of frames) f.scene = f.snapshot
  return { input: { bloomDay, m, k }, result: lo, frames }
}

export const code = `function minDays(bloomDay, m, k) {
  if (m * k > bloomDay.length) return -1
  const canMake = day => {
    let bouquets = 0, run = 0
    for (const bloom of bloomDay) { run = bloom <= day ? run + 1 : 0; if (run === k) { bouquets++; run = 0 } }
    return bouquets >= m
  }
  let lo = Math.min(...bloomDay), hi = Math.max(...bloomDay)
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (canMake(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_days(bloom_day, m, k):
    if m * k > len(bloom_day):
        return -1

    def can_make(day):
        bouquets = run = 0
        for bloom in bloom_day:
            run = run + 1 if bloom <= day else 0
            if run == k:
                bouquets += 1
                run = 0
        return bouquets >= m

    lo, hi = min(bloom_day), max(bloom_day)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_make(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
