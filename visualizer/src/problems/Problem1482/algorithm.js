export const phases = [
  { id: 'start', label: 'Start', description: 'Read the garden and the bouquet requirement.' },
  { id: 'check', label: 'Feasibility', description: 'Stop early when there are not enough flowers for all bouquets.' },
  { id: 'probe', label: 'Test a day', description: 'Pick the midpoint day of the remaining range and test it.' },
  { id: 'scan', label: 'Scan flowers', description: 'Walk the garden and count runs of bloomed flowers.' },
  { id: 'decide', label: 'Narrow range', description: 'Keep the half of the range that can contain the answer.' },
  { id: 'done', label: 'Complete', description: 'The earliest day that works.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.bloomDay) || !Number.isInteger(data.m) || !Number.isInteger(data.k)) {
    throw new Error('Use an object with an integer array bloomDay and integers m and k, for example {"bloomDay":[1,3,2],"m":1,"k":2}.')
  }
  if (data.bloomDay.length < 1 || data.bloomDay.length > 60) throw new Error('bloomDay must have 1 to 60 flowers in this visualization.')
  if (!data.bloomDay.every(v => Number.isInteger(v) && v >= 1 && v <= 1000000000)) throw new Error('Every bloom day must be an integer from 1 to 1000000000.')
  if (data.m < 1 || data.m > 60) throw new Error('m must be from 1 to 60.')
  if (data.k < 1 || data.k > 60) throw new Error('k must be from 1 to 60.')
  return { bloomDay: data.bloomDay, m: data.m, k: data.k }
}

export const code = `earliest day for m bouquets (bloomDay, m, k):
  if m * k is more than the number of flowers: return -1
  lo = earliest bloom day, hi = latest bloom day
  while lo < hi:
    mid = (lo + hi) // 2
    if can make m bouquets by day mid: hi = mid
    else: lo = mid + 1
  return lo

can make m bouquets by day (day):
  bouquets = 0, run = 0
  for each bloom in bloomDay:
    if bloom <= day: run = run + 1
    else: run = 0
    if run equals k: bouquets = bouquets + 1, run = 0
  return bouquets >= m`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def min_days(bloom_day, m, k):
    n = len(bloom_day)
    if m * k > n:
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

export function buildTrace({ bloomDay, m, k }) {
  const n = bloomDay.length
  const frames = []
  const base = { bloomDay, lo: null, hi: null, mid: null, index: -1, bloomed: null, run: 0, bouquets: 0 }
  frames.push({
    phase: 'start', activeLine: L('earliest day for m bouquets'), pythonLine: P('def min_days'),
    message: `We need ${m} bouquets of ${k} adjacent flowers, and each flower can be picked only after it blooms. The garden has ${n} flowers.`,
    scene: { ...base },
  })
  if (m * k > n) {
    frames.push({
      phase: 'check', activeLine: L('if m * k is more'), pythonLine: P('if m * k > n'),
      message: `${m} bouquets need ${m * k} flowers, but the garden has only ${n}. No day can work, so the answer is -1.`,
      scene: { ...base },
    })
    frames.push({
      phase: 'done', activeLine: L('return -1'),pythonLine: P('return -1'),
      message: 'The answer is -1.',
      scene: { ...base }, result: -1,
    })
    return { input: { bloomDay, m, k }, result: -1, frames }
  }
  frames.push({
    phase: 'check', activeLine: L('if m * k is more'), pythonLine: P('if m * k > n'),
    message: `${m * k} flowers are needed and ${n} are available, so a solution may exist. Check the days with a binary search.`,
    scene: { ...base },
  })

  // Lo and hi bound the answer: no day before the earliest bloom can help, and the latest bloom always works.
  let lo = Math.min(...bloomDay)
  let hi = Math.max(...bloomDay)
  frames.push({
    phase: 'probe', activeLine: L('lo = earliest bloom day'), pythonLine: P('lo, hi = min'),
    message: `The answer lies between ${lo} and ${hi}, the earliest and latest bloom days.`,
    scene: { ...base, lo, hi },
  })

  const canMake = day => {
    let bouquets = 0
    let run = 0
    for (let i = 0; i < n; i++) {
      const bloomed = bloomDay[i] <= day
      run = bloomed ? run + 1 : 0
      frames.push({
        phase: 'scan', activeLine: L('if bloom <= day'), pythonLine: P('run = run + 1 if bloom'),
        message: `On day ${day}, flower ${i} ${bloomed ? `has bloomed (it opens on day ${bloomDay[i]}), so the run of open flowers grows to ${run}` : `has not bloomed yet (it opens on day ${bloomDay[i]}), so the run of open flowers resets`}.`,
        scene: { bloomDay, lo, hi, mid: day, index: i, bloomed, run, bouquets },
      })
      if (run === k) {
        bouquets += 1
        run = 0
        frames.push({
          phase: 'scan', activeLine: L('bouquets = bouquets + 1'), pythonLine: P('bouquets += 1'),
          message: `${k} open flowers in a row make one bouquet. Bouquets so far on day ${day}: ${bouquets} of ${m}.`,
          scene: { bloomDay, lo, hi, mid: day, index: i, bloomed: true, run: 0, bouquets },
        })
      }
    }
    return bouquets >= m
  }

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    frames.push({
      phase: 'probe', activeLine: L('mid = (lo + hi)'), pythonLine: P('mid = (lo + hi)'),
      message: `Test day ${mid}: can we make ${m} bouquets by then?`,
      scene: { bloomDay, lo, hi, mid, index: -1, bloomed: null, run: 0, bouquets: 0 },
    })
    const feasible = canMake(mid)
    if (feasible) {
      hi = mid
      frames.push({
        phase: 'decide', activeLine: L('hi = mid'), pythonLine: P('hi = mid'),
        message: `Day ${mid} is enough, so the answer is at most ${mid}. Search the earlier half: hi becomes ${hi}.`,
        scene: { bloomDay, lo, hi, mid, index: -1, bloomed: null, run: 0, bouquets: 0, feasible },
      })
    } else {
      lo = mid + 1
      frames.push({
        phase: 'decide', activeLine: L('lo = mid + 1'), pythonLine: P('lo = mid + 1'),
        message: `Day ${mid} is not enough, so the answer is later than ${mid}. lo becomes ${lo}.`,
        scene: { bloomDay, lo, hi, mid, index: -1, bloomed: null, run: 0, bouquets: 0, feasible },
      })
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return lo'), pythonLine: P('return lo'),
    message: `lo and hi meet at day ${lo}, the earliest day that makes ${m} bouquets.`,
    scene: { ...base, lo, hi, mid: null }, result: lo,
  })
  return { input: { bloomDay, m, k }, result: lo, frames }
}
