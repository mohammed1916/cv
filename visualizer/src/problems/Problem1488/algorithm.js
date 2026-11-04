export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.rains) || input.rains.length < 1 || input.rains.length > 12) throw new Error('Use {"rains": [...]} with 1 to 12 entries.')
  if (input.rains.some(v => !Number.isInteger(v) || v < 0 || v > 5)) throw new Error('Each entry is 0 for a dry day or a lake number from 1 to 5.')
  return { rains: input.rains }
}

export function buildTrace({ rains }) {
  const ans = rains.map(r => (r === 0 ? 1 : -1))
  const full = new Map()
  const dry = []
  let failed = false
  const frames = [{ phase: 'start', activeLine: L('const ans'), pythonLine: 3, day: null, ans: [...ans], full: [], message: 'Dry days default to 1 until a lake needs one.' }]
  const PY = { 'dry.push(day)': 8, 'return []': 13, 'ans[dry[i]] = lake': 14, 'full.set(lake, day)': 16 }
  const snap = (phase, line, day, message) => frames.push({ phase, activeLine: L(line), pythonLine: PY[line], day, ans: [...ans], full: [...full.keys()], dryLeft: [...dry], lastRain: [...full.entries()], message })
  for (let day = 0; day < rains.length && !failed; day++) {
    const lake = rains[day]
    if (lake === 0) {
      dry.push(day)
      snap('dry', 'dry.push(day)', day, `Day ${day} is dry; keep it for a later flood.`)
      continue
    }
    if (full.has(lake)) {
      const i = dry.findIndex(d => d > full.get(lake))
      if (i === -1) {
        failed = true
        snap('fail', 'return []', day, `Lake ${lake} would flood on day ${day}.`)
        continue
      }
      const used = dry[i]
      ans[used] = lake
      dry.splice(i, 1)
      snap('use', 'ans[dry[i]] = lake', day, `Dry day ${used} empties lake ${lake} before it rains again.`)
    }
    full.set(lake, day)
    snap('rain', 'full.set(lake, day)', day, `Rain on lake ${lake} on day ${day}.`)
  }
  const result = failed ? [] : ans
  frames.push({ phase: 'done', activeLine: L('return ans'), pythonLine: failed ? 13 : 17, day: null, ans: [...ans], full: [...full.keys()], message: failed ? 'No valid plan: a flood cannot be avoided.' : 'Every flood is avoided.' })
  return { input: { rains }, result, frames }
}

const CODE = [
  'function avoidFlood(rains) {',
  '  const ans = rains.map(r => (r === 0 ? 1 : -1))',
  '  const full = new Map()',
  '  const dry = []',
  '  for (let day = 0; day < rains.length; day++) {',
  '    const lake = rains[day]',
  '    if (lake === 0) {',
  '      dry.push(day)',
  '      continue',
  '    }',
  '    if (full.has(lake)) {',
  '      const i = dry.findIndex(d => d > full.get(lake))',
  '      if (i === -1) return []',
  '      ans[dry[i]] = lake',
  '      dry.splice(i, 1)',
  '    }',
  '    full.set(lake, day)',
  '  }',
  '  return ans',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(text => text.includes(s)) + 1

export const python = `def avoid_flood(rains):
    import bisect
    answer = [1 if lake == 0 else -1 for lake in rains]
    last_rain = {}
    dry_days = []
    for day, lake in enumerate(rains):
        if lake == 0:
            dry_days.append(day)
            continue
        if lake in last_rain:
            i = bisect.bisect_right(dry_days, last_rain[lake])
            if i == len(dry_days):
                return []
            answer[dry_days[i]] = lake
            del dry_days[i]
        last_rain[lake] = day
    return answer
`
