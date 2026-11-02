const POSITIVE = /^\d+$/

function readList(input, key) {
  const value = input[key]
  if (!Array.isArray(value) || value.length < 1 || value.length > 5) throw new Error(`${key} has 1 to 5 entries.`)
  for (const item of value) {
    if (typeof item !== 'number' || !Number.isInteger(item) || item < 1 || item > 1000) throw new Error(`${key} holds integers from 1 to 1000.`)
  }
  return value
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the four ride lists.')
  const landStart = readList(input, 'landStartTime')
  const landDuration = readList(input, 'landDuration')
  const waterStart = readList(input, 'waterStartTime')
  const waterDuration = readList(input, 'waterDuration')
  if (landStart.length !== landDuration.length) throw new Error('Land lists must have equal length.')
  if (waterStart.length !== waterDuration.length) throw new Error('Water lists must have equal length.')
  return { landStartTime: landStart, landDuration, waterStartTime: waterStart, waterDuration }
}

export function buildTrace({ landStartTime, landDuration, waterStartTime, waterDuration }) {
  const frames = []
  let best = Infinity
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('set best to infinity'), land: -1, water: -1, best, value: null, message: 'Start with no finish time found.' })
  for (let i = 0; i < landStartTime.length; i++) {
    for (let j = 0; j < waterStartTime.length; j++) {
      frames.push({ pythonLine: 4, phase: 'pair', activeLine: L('for each water ride'), land: i, water: j, best, value: null, message: `Pair land ${i} with water ${j}.` })
      const landEnd = landStartTime[i] + landDuration[i]
      const landFirst = Math.max(waterStartTime[j], landEnd) + waterDuration[j]
      frames.push({ pythonLine: 5, phase: 'land-first', activeLine: L('land first finishes'), land: i, water: j, best, value: landFirst, message: `Land first: land ends ${landEnd}, water ends ${landFirst}.` })
      const waterEnd = waterStartTime[j] + waterDuration[j]
      const waterFirst = Math.max(landStartTime[i], waterEnd) + landDuration[i]
      frames.push({ pythonLine: 6, phase: 'water-first', activeLine: L('water first finishes'), land: i, water: j, best, value: waterFirst, message: `Water first: water ends ${waterEnd}, land ends ${waterFirst}.` })
      best = Math.min(best, landFirst, waterFirst)
      frames.push({ pythonLine: 7, phase: 'keep', activeLine: L('keep the smallest'), land: i, water: j, best, value: best, message: `Best finish so far is ${best}.` })
    }
  }
  frames.push({ pythonLine: 8, phase: 'done', activeLine: L('return best'), land: -1, water: -1, best, value: best, message: `Earliest finish time is ${best}.` })
  return { input: { landStartTime, landDuration, waterStartTime, waterDuration }, result: best, frames }
}

export const code = `earliest finish time for one land ride and one water ride
  set best to infinity
  for each land ride i
    for each water ride j
      land first finishes at max(water start j, land end i) plus water duration j
      water first finishes at max(land start i, water end j) plus land duration i
      keep the smallest of both finish times in best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def earliest_finish(land_start, land_duration, water_start, water_duration):
    best = float('inf')
    for i in range(len(land_start)):
        for j in range(len(water_start)):
            land_first = max(water_start[j], land_start[i] + land_duration[i]) + water_duration[j]
            water_first = max(land_start[i], water_start[j] + water_duration[j]) + land_duration[i]
            best = min(best, land_first, water_first)
    return best
`
