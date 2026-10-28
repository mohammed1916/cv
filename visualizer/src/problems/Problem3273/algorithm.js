export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with power, damage and health.')
  const { power, damage, health } = data
  if (!Number.isInteger(power) || power < 1 || power > 20) throw new Error('power is an integer from 1 to 20.')
  if (!Array.isArray(damage) || damage.length < 1 || damage.length > 6) throw new Error('damage must have 1 to 6 entries.')
  if (!Array.isArray(health) || health.length !== damage.length) throw new Error('health must match damage in length.')
  if (damage.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Damage values are integers from 1 to 20.')
  if (health.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Health values are integers from 1 to 50.')
  return { power, damage, health }
}

export function buildTrace(input) {
  const { power, damage, health } = input
  const attacks = health.map(h => Math.ceil(h / power))
  const order = damage.map((_, i) => i).sort((a, b) => attacks[a] * damage[b] - attacks[b] * damage[a])
  let elapsed = 0
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('attacks needed'), index: -1, elapsed, total, order: [], message: 'Each enemy needs ceil(health / power) attacks. Sort by attacks divided by damage.' }]
  const done = []
  for (const i of order) {
    elapsed += attacks[i]
    total += damage[i] * elapsed
    done.push(i)
    frames.push({ phase: 'defeat', activeLine: L('add its damage times elapsed'), index: i, elapsed, total, order: [...done], message: `Defeat enemy ${i} at second ${elapsed}; it dealt ${damage[i]} per second until then. Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, elapsed, total, order: [...done], message: `Minimum damage: ${total}.` })
  return { input, result: total, frames }
}

export const code = `minimum total damage Bob takes:
  for each enemy find its attacks needed, which is health divided by power rounded up
  sort the enemies by attacks needed divided by damage, smallest first
  set elapsed to zero and total to zero
  for each enemy in that order
    add its attacks needed to elapsed
    add its damage times elapsed to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from fractions import Fraction

def minimum_damage_to_bob(power, damage, health):
    attacks = [(h + power - 1) // power for h in health]
    order = sorted(range(len(damage)), key=lambda i: Fraction(attacks[i], damage[i]))
    elapsed = 0
    total = 0
    for i in order:
        elapsed += attacks[i]
        total += damage[i] * elapsed
    return total
`
