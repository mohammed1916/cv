// LeetCode 2214: Minimum Health to Beat Game.
// Health must stay above 0 through every level. The single armor use is best spent on the level with the largest
// hit, which absorbs min(armor, largest hit) damage. Starting health is total damage minus that absorbed amount, plus
// one so that health ends above 0.

const MAX_LEVELS = 10
const MAX_DAMAGE = 20
const MAX_ARMOR = 25

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"damage":[2,7,4,3],"armor":4}.') }
  if (!spec || !Array.isArray(spec.damage) || !Number.isInteger(spec.armor)) throw new Error('Give a damage array and an integer armor.')
  if (spec.damage.length < 1 || spec.damage.length > MAX_LEVELS) throw new Error(`Use 1 to ${MAX_LEVELS} levels.`)
  if (!spec.damage.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_DAMAGE)) throw new Error(`Each level hits for an integer from 1 to ${MAX_DAMAGE}.`)
  if (spec.armor < 1 || spec.armor > MAX_ARMOR) throw new Error(`armor is an integer from 1 to ${MAX_ARMOR}.`)
  return { damage: spec.damage, armor: spec.armor }
}

export const code = `FUNCTION minimumHealth(damage, armor)
    total ← sum of damage
    biggest ← max of damage
    absorbed ← min(biggest, armor)
    RETURN total - absorbed + 1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_health(damage, armor):
    total = sum(damage)
    biggest = max(damage)
    absorbed = min(biggest, armor)
    return total - absorbed + 1
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'total', label: 'Total hits', description: 'Add every level\'s damage.' },
  { id: 'armor', label: 'Armor', description: 'Use armor on the largest hit, up to its size.' },
  { id: 'done', label: 'Result', description: 'The starting health needed.' },
]

export function buildTrace({ damage, armor }) {
  const total = damage.reduce((a, b) => a + b, 0)
  const biggest = Math.max(...damage)
  const absorbed = Math.min(biggest, armor)
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, damage, armor, total, biggest, absorbed, ...extra })
  push('total', -1, L('total ← sum'), P('total = sum'), `Total damage over ${damage.length} level(s) is ${total}.`)
  const level = damage.indexOf(biggest)
  push('armor', level, L('absorbed ← min'), P('absorbed = min'), `Largest hit is ${biggest} on level ${level}. Armor absorbs ${absorbed}.`, { absorbed })
  const result = total - absorbed + 1
  push('done', -1, L('RETURN total - absorbed'), P('return total - absorbed'), `Start with at least ${result} health: ${total} - ${absorbed} + 1.`, { result })
  return { input: { damage, armor }, result, frames }
}
