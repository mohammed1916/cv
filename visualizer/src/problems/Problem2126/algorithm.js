// LeetCode 2126: Destroying Asteroids.
// Hitting the smallest asteroid first is always best: the planet's mass only grows, so taking the
// smallest remaining asteroid never blocks a later one. Sort ascending and check each in turn.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"mass":10,"asteroids":[3,9,19,5,21]}.') }
  const { mass, asteroids } = data ?? {}
  if (!Number.isInteger(mass) || mass < 1 || mass > 100000) throw new Error('mass is an integer from 1 to 100000.')
  if (!Array.isArray(asteroids) || asteroids.length < 1 || asteroids.length > 30 || asteroids.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) {
    throw new Error('asteroids holds 1 to 30 integers from 1 to 100000.')
  }
  return { mass, asteroids }
}

export const code = `function destroyAsteroids(mass, asteroids) {
  const sorted = [...asteroids].sort((a, b) => a - b)
  let current = mass
  for (const asteroid of sorted) {
    if (current < asteroid) return false
    current += asteroid
  }
  return true
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: destroy_asteroids
def destroy_asteroids(mass, asteroids):
    current = mass
    for asteroid in sorted(asteroids):
        if current < asteroid:
            return False
        current += asteroid
    return True
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
  { id: 'sort', label: 'Sort', description: 'Hit the smallest asteroids first.' },
  { id: 'hit', label: 'Collide', description: 'The planet absorbs an asteroid it is at least as heavy as.' },
  { id: 'fail', label: 'Too heavy', description: 'The next asteroid is heavier than the planet now.' },
  { id: 'done', label: 'Result', description: 'Whether every asteroid was destroyed.' },
]

export function buildTrace({ mass, asteroids }) {
  const frames = []
  const sorted = [...asteroids].sort((a, b) => a - b)
  let current = mass
  let result = true
  frames.push({ phase: 'sort', activeLine: L('const sorted'), pythonLine: P('sorted(asteroids)'), message: `Planet mass ${mass}. Asteroids in order: ${sorted.join(', ')}.`, sorted, i: -1, mass: current })
  for (let i = 0; i < sorted.length; i++) {
    if (current < sorted[i]) {
      result = false
      frames.push({ phase: 'fail', activeLine: L('if (current < asteroid)'), pythonLine: P('if current < asteroid'), message: `Mass ${current} is less than ${sorted[i]}, so the planet is destroyed.`, sorted, i, mass: current })
      break
    }
    current += sorted[i]
    frames.push({ phase: 'hit', activeLine: L('current += asteroid'), pythonLine: P('current += asteroid'), message: `Absorb ${sorted[i]}; mass is now ${current}.`, sorted, i, mass: current })
  }
  frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: P('return True'), message: result ? 'Every asteroid can be destroyed.' : 'Not every asteroid can be destroyed.', sorted, i: -1, mass: current })
  return { input: { mass, asteroids }, result, frames }
}
