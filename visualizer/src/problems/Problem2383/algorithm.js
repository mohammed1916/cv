export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with initial_energy, initial_experience, energy and experience.')
  const { initial_energy, initial_experience, energy, experience } = input
  if (!Number.isInteger(initial_energy) || initial_energy < 1 || initial_energy > 50) throw new Error('initial_energy is an integer from 1 to 50.')
  if (!Number.isInteger(initial_experience) || initial_experience < 1 || initial_experience > 50) throw new Error('initial_experience is an integer from 1 to 50.')
  if (!Array.isArray(energy) || energy.length < 1 || energy.length > 8) throw new Error('energy needs 1 to 8 opponents.')
  if (!Array.isArray(experience) || experience.length !== energy.length) throw new Error('experience must match energy in length.')
  if ([...energy, ...experience].some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Opponent values are integers from 1 to 20.')
  return { initial_energy, initial_experience, energy, experience }
}

export function buildTrace(input) {
  const { initial_energy, initial_experience, energy, experience } = input
  const energyHours = Math.max(0, energy.reduce((sum, v) => sum + v, 0) + 1 - initial_energy)
  let exp = initial_experience
  let expHours = 0
  const frames = [{ phase: 'energy', activeLine: L('set energy hours to'), opponent: -1, exp, energyHours, expHours, message: `Energy needs ${energyHours} training hours to beat all opponents.` }]
  experience.forEach((opponent, i) => {
    if (exp <= opponent) {
      const added = opponent + 1 - exp
      expHours += added
      exp += added
      frames.push({ phase: 'train', activeLine: L('train experience until'), opponent: i, exp, energyHours, expHours, message: `Experience ${exp - added} is not above ${opponent}; train ${added} hours first.` })
    }
    exp += opponent
    frames.push({ phase: 'win', activeLine: L('add the opponent experience'), opponent: i, exp, energyHours, expHours, message: `Beat opponent ${i}; experience is now ${exp}.` })
  })
  const result = energyHours + expHours
  frames.push({ phase: 'done', activeLine: L('return energy hours plus'), opponent: -1, exp, energyHours, expHours, message: `Minimum training hours: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum training hours to beat every opponent:
  set energy hours to the energy needed beyond the start
  set exp to the initial experience and exp hours to 0
  for each opponent in order
    if exp is at most the opponent experience then train experience until exp is one more, adding those hours to exp hours
    add the opponent experience to exp
  return energy hours plus exp hours`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_training_hours(initial_energy, initial_experience, energy, experience):
    energy_hours = max(0, sum(energy) + 1 - initial_energy)
    exp = initial_experience
    exp_hours = 0
    for opponent in experience:
        if exp <= opponent:
            added = opponent + 1 - exp
            exp_hours += added
            exp += added
        exp += opponent
    return energy_hours + exp_hours
`
