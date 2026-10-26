export const code = `def carFleet(target, position, speed):
    cars = sorted(zip(position, speed), reverse=True)
    fleets = 0
    slowest = 0
    for p, s in cars:
        t = (target - p) / s
        if t > slowest:
            fleets += 1
            slowest = t
    return fleets`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = (s) => code.findIndex((c) => c.text.includes(s)) + 1

export function parseInput(text) {
  let v
  try { v = JSON.parse(text) } catch { throw new Error('Input must be valid JSON: {"target": n, "position": [...], "speed": [...]}') }
  if (!v || typeof v !== 'object' || !Number.isInteger(v.target) || !Array.isArray(v.position) || !Array.isArray(v.speed)) throw new Error('Input must be an object with integer "target" and arrays "position", "speed".')
  const { target, position, speed } = v
  const n = position.length
  if (n < 1 || n > 30 || speed.length !== n) throw new Error('position and speed must have the same length, 1 to 30 (visualization cap).')
  if (target < 1 || target > 1000000) throw new Error('target must be in [1, 1000000].')
  if (!position.every((p) => Number.isInteger(p) && p >= 0 && p < target)) throw new Error('Each position must be an integer in [0, target).')
  if (new Set(position).size !== n) throw new Error('Positions must be distinct.')
  if (!speed.every((s) => Number.isInteger(s) && s >= 1 && s <= 1000000)) throw new Error('Each speed must be an integer in [1, 1000000].')
  return { target, position: [...position], speed: [...speed] }
}

export function buildTrace({ target, position, speed }) {
  const cars = position.map((p, i) => ({ id: i, p, s: speed[i] })).sort((a, b) => b.p - a.p)
  const frames = []
  let fleets = 0
  let slowest = null // {num, den} exact rational
  const fmt = (r) => (r ? Number((r.num / r.den).toFixed(4)) : 0)
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, index: -1, fleets, slowest: fmt(slowest), leaders: leaders.slice(), ...extra })
  const leaders = []
  push('start', L('cars = sorted'), `Sort cars by position from the closest to the target down to the farthest: [${cars.map((c) => `(${c.p},${c.s})`).join(', ')}].`)
  cars.forEach((c, k) => {
    const t = { num: target - c.p, den: c.s }
    push('time', L('t = '), `Car at ${c.p} with speed ${c.s} needs (${target} - ${c.p}) / ${c.s} = ${fmt(t)} hours to reach the target alone.`, { index: k, time: fmt(t) })
    const later = !slowest || t.num * slowest.den > slowest.num * t.den
    if (later) {
      fleets++; slowest = t; leaders.push(k)
      push('new', L('fleets += 1'), `${fmt(t)} is greater than the slowest fleet ahead, so this car can never catch it: it leads a new fleet. Fleets = ${fleets}.`, { index: k, time: fmt(t) })
    } else {
      push('merge', L('if t > slowest'), `${fmt(t)} is not greater than ${fmt(slowest)}: it catches the fleet ahead before the target and must slow down to join it.`, { index: k, time: fmt(t) })
    }
  })
  push('done', L('return fleets'), `Done: ${fleets} fleet${fleets === 1 ? '' : 's'} arrive at the target.`)
  return { input: { target, position, speed }, result: fleets, cars, frames }
}
