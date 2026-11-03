export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with enemies and energy.')
  const { enemies, energy } = input
  if (!Array.isArray(enemies) || enemies.length < 1 || enemies.length > 8) throw new Error('enemies has 1 to 8 values.')
  if (!enemies.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Each enemy energy is an integer from 1 to 20.')
  if (!Number.isInteger(energy) || energy < 0 || energy > 40) throw new Error('energy is an integer from 0 to 40.')
  return { enemies, energy }
}

export function buildTrace({ enemies, energy }) {
  const e = [...enemies].sort((a, b) => a - b)
  const frames = []
  let cur = energy
  let points = 0
  let l = 0
  let r = e.length - 1
  const snap = (pythonLine, phase, activeLine, message) => frames.push({ pythonLine, phase, activeLine, low: l, high: r, points, energy: cur, message })
  snap(2, 'start', L('sort the energies'), `Sorted: ${e.join(', ')}. Start with ${cur} energy and 0 points.`)
  while (true) {
    if (cur >= e[l]) {
      const k = Math.floor(cur / e[l])
      points += k
      cur -= k * e[l]
      snap(5, 'point', L('spend energy on the cheapest'), `Gain ${k} point${k === 1 ? '' : 's'} with the enemy costing ${e[l]}. Energy left: ${cur}.`)
      continue
    }
    if (points >= 1 && r > l) {
      cur += e[r]
      snap(9, 'mark', L('mark the largest'), `Mark the enemy costing ${e[r]} to gain its energy. Energy is now ${cur}.`)
      r--
      continue
    }
    break
  }
  snap(12, 'done', L('return points'), `No more moves help. Final points: ${points}.`)
  return { input: { enemies, energy }, result: points, frames }
}

export const code = `maximum points after enemy battles
  sort the energies
  l = 0 is the cheapest unmarked enemy, r = last index is the largest
  points = 0, energy = energy
  repeat
    if energy >= e[l] then spend energy on the cheapest enemy for points
    else if points >= 1 and r > l then mark the largest enemy and gain its energy
    else stop
  return points`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_points(enemy_energies, current_energy):
    e = sorted(enemy_energies)
    l, r = 0, len(e) - 1
    points, energy = 0, current_energy
    while True:
        if energy >= e[l]:
            k = energy // e[l]
            points += k
            energy -= k * e[l]
        elif points >= 1 and r > l:
            energy += e[r]
            r -= 1
        else:
            break
    return points
`
