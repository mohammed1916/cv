export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.garbage) || input.garbage.length < 2 || input.garbage.length > 8) throw new Error('Use an object with garbage: an array of 2 to 8 houses.')
  if (input.garbage.some(g => typeof g !== 'string' || !/^[MPG]{1,4}$/.test(g))) throw new Error('Each house holds 1 to 4 characters, each M, P or G.')
  if (!Array.isArray(input.travel) || input.travel.length !== input.garbage.length - 1) throw new Error('travel has one entry per road, so its length is one less than garbage.')
  if (input.travel.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each travel time is an integer from 1 to 10.')
  return { garbage: input.garbage, travel: input.travel }
}

export function buildTrace(input) {
  const { garbage, travel } = input
  const n = garbage.length
  let total = 0
  for (const g of garbage) total += g.length
  // roadTo[i] is the time for a truck to drive from house 0 to house i.
  const roadTo = [0]
  for (let i = 0; i < n - 1; i++) roadTo.push(roadTo[i] + travel[i])
  const frames = [{ phase: 'pickup', activeLine: L('total += house.length'), pythonLine: P(`total = sum(len(g)`), index: -1, total, truck: null, message: 'Count every piece of garbage. Each piece costs one minute.' }]
  for (let i = 0; i < n; i++) {
    total = frames[frames.length - 1].total
    frames.push({ phase: 'pickup', activeLine: L('total += house.length'), pythonLine: P(`total = sum(len(g)`), index: i, total, truck: null, message: `House ${i} holds ${garbage[i]}.` })
  }
  let running = total
  const driving = []
  for (const type of ['M', 'P', 'G']) {
    let last = -1
    for (let i = 0; i < n; i++) if (garbage[i].includes(type)) last = i
    if (last < 0) {
      frames.push({ phase: 'truck', activeLine: L('if (last >= 0)'), pythonLine: P(`if last >= 0:`), index: -1, total: running, truck: type, message: `No ${type} garbage, so that truck stays home.` })
      continue
    }
    running += roadTo[last]
    driving.push({ type, last, time: roadTo[last] })
    frames.push({ phase: 'truck', activeLine: L('total += roadTo[last]'), pythonLine: P(`total += road_to[last]`), index: last, total: running, truck: type, message: `The ${type} truck drives to house ${last} for ${roadTo[last]} minute(s).` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P(`return total`), index: n, total: running, truck: null, message: `Total minutes: ${running}.` })
  return { input, result: running, frames }
}

export const code = `function minGarbageTime(garbage, travel) {
  let total = 0
  for (const house of garbage) total += house.length // every piece costs one minute
  const roadTo = [0] // roadTo[i]: minutes to drive from house 0 to house i
  for (let i = 0; i < travel.length; i++) roadTo.push(roadTo[i] + travel[i])
  for (const type of ['M', 'P', 'G']) {
    let last = -1
    for (let i = 0; i < garbage.length; i++) if (garbage[i].includes(type)) last = i
    if (last >= 0) total += roadTo[last] // this truck drives to its last stop once
  }
  return total // return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def min_garbage_time(garbage, travel):
    total = sum(len(g) for g in garbage)
    road_to = [0]
    for i in range(len(garbage) - 1):
        road_to.append(road_to[-1] + travel[i])
    for kind in 'MPG':
        last = -1
        for i, g in enumerate(garbage):
            if kind in g:
                last = i
        if last >= 0:
            total += road_to[last]
    return total
`
