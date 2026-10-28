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
  const frames = [{ phase: 'start', activeLine: L('set every dry day to 1'), day: null, ans: [...ans], full: [], message: 'Dry days default to 1 until a lake needs one.' }]
  const snap = (phase, line, day, message) => frames.push({ phase, activeLine: L(line), day, ans: [...ans], full: [...full.keys()], message })
  for (let day = 0; day < rains.length && !failed; day++) {
    const lake = rains[day]
    if (lake === 0) {
      dry.push(day)
      snap('dry', 'remember this dry day', day, `Day ${day} is dry; keep it for a later flood.`)
      continue
    }
    if (full.has(lake)) {
      const i = dry.findIndex(d => d > full.get(lake))
      if (i === -1) {
        failed = true
        snap('fail', 'stop and return', day, `Lake ${lake} would flood on day ${day}.`)
        continue
      }
      const used = dry[i]
      ans[used] = lake
      dry.splice(i, 1)
      snap('use', 'use the earliest dry day', day, `Dry day ${used} empties lake ${lake} before it rains again.`)
    }
    full.set(lake, day)
    snap('rain', 'mark the lake as full', day, `Rain on lake ${lake} on day ${day}.`)
  }
  const result = failed ? [] : ans
  frames.push({ phase: 'done', activeLine: L('return the answer'), day: null, ans: [...ans], full: [...full.keys()], message: failed ? 'No valid plan: a flood cannot be avoided.' : 'Every flood is avoided.' })
  return { input: { rains }, result, frames }
}

export const code = `avoid flooding the city
  set every dry day to 1 as a default
  for each day in order
    if the day is dry then
      remember this dry day for a later flood
    otherwise
      if the lake is already full then
        if no dry day is left after the lake last rained then
          stop and return an empty answer
        use the earliest dry day after that rain to dry the lake
      mark the lake as full
  return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
