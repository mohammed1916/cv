export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || !Array.isArray(input.d) || !Array.isArray(input.r)) throw new Error('Use an object with d and r.')
  const { d, r } = input
  if (d.length !== 2 || r.length !== 2) throw new Error('d and r each hold two numbers.')
  if (!d.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Each d is an integer from 1 to 20.')
  if (!r.every(v => Number.isInteger(v) && v >= 2 && v <= 10)) throw new Error('Each r is an integer from 2 to 10.')
  return { d, r }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

// A total time T works when each drone has enough free hours, and together the two drones
// have enough hours in which at least one of them is free (Hall's condition for two drones).
export function buildTrace({ d, r }) {
  const frames = []
  const lcm = (r[0] * r[1]) / gcd(r[0], r[1])
  const freeCount = (T, step) => T - Math.floor(T / step)
  frames.push({ pythonLine: P('lcm = '), phase: 'setup', activeLine: L('const lcm'), time: 0, free: [0, 0], both: 0, feasible: null, message: `Both drones are blocked together every ${lcm} hours.` })
  let answer = -1
  for (let T = 1; T <= 1000 && answer < 0; T++) {
    const free = [freeCount(T, r[0]), freeCount(T, r[1])]
    const either = T - Math.floor(T / lcm)
    const ok = d[0] <= free[0] && d[1] <= free[1] && d[0] + d[1] <= either
    frames.push({ pythonLine: P('if d[0] <= free1'), phase: 'check', activeLine: L('if (d[0] <= free1'), time: T, free, both: either, feasible: ok, message: `T = ${T}: drone free hours ${free[0]} and ${free[1]}, hours with a free drone ${either}. ${ok ? 'Enough room.' : 'Not enough room.'}` })
    if (ok) answer = T
  }
  frames.push({ pythonLine: P('return t'), phase: 'done', activeLine: L('return T'), time: answer, free: [], both: 0, feasible: true, message: `Minimum total time: ${answer}.` })
  return { input: { d, r }, result: answer, frames }
}

export const code = `function minTimeToCompleteAllDeliveries(d, r) {
  const lcm = (r[0] * r[1]) / gcd(r[0], r[1])
  for (let T = 1; ; T++) {
    const free1 = T - Math.floor(T / r[0])
    const free2 = T - Math.floor(T / r[1])
    const either = T - Math.floor(T / lcm)
    if (d[0] <= free1 && d[1] <= free2 && d[0] + d[1] <= either) return T
  }
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

export const python = `from math import gcd

def min_time(d, r):
    lcm = r[0] * r[1] // gcd(r[0], r[1])
    t = 1
    while True:
        free1 = t - t // r[0]
        free2 = t - t // r[1]
        either = t - t // lcm
        if d[0] <= free1 and d[1] <= free2 and d[0] + d[1] <= either:
            return t
        t += 1
`
