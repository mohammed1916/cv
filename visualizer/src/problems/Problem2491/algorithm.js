export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.skill)) throw new Error('Use an object with an array skill, for example {"skill":[3,2,5,1,3,4]}.')
  if (data.skill.length < 2 || data.skill.length > 30 || data.skill.length % 2 !== 0) throw new Error('skill must have an even number of players from 2 to 30.')
  if (data.skill.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each skill must be an integer from 1 to 100.')
  return { skill: [...data.skill] }
}

export function buildTrace({ skill }) {
  const frames = []
  const values = [...skill].sort((a, b) => a - b)
  const total = values[0] + values[values.length - 1]
  let chemistry = 0
  frames.push({ phase: 'sort', activeLine: L('sort skill'), left: -1, right: -1, values, total: null, chemistry, result: null, message: `Sort the skills to ${values.join(', ')}.` })
  frames.push({ phase: 'target', activeLine: L('set team total'), left: 0, right: values.length - 1, values, total, chemistry, result: null, message: `The weakest and strongest players must share a team, so every team must total ${total}.` })
  for (let left = 0; left < values.length / 2; left++) {
    const right = values.length - 1 - left
    if (values[left] + values[right] !== total) {
      frames.push({ phase: 'fail', activeLine: L('return minus one'), left, right, values, total, chemistry, result: -1, message: `${values[left]} + ${values[right]} = ${values[left] + values[right]}, not ${total}. Teams cannot be equal.` })
      return { input: { skill }, result: -1, frames }
    }
    chemistry += values[left] * values[right]
    frames.push({ phase: 'pair', activeLine: L('add the product'), left, right, values, total, chemistry, result: null, message: `${values[left]} + ${values[right]} = ${total}. Add the product ${values[left] * values[right]}; chemistry is ${chemistry}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return chemistry'), left: -1, right: -1, values, total, chemistry, result: chemistry, message: `All teams match. Total chemistry: ${chemistry}.` })
  return { input: { skill }, result: chemistry, frames }
}

export const code = `divide players into teams of equal skill (skill)
  sort skill in increasing order
  set team total to the sum of the smallest and largest skill
  set chemistry to 0
  for each pair taken from the outside in
    if the pair sum is not team total then
      return minus one
    add the product of the pair to chemistry
  return chemistry`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def divide_players(skill):
    values = sorted(skill)
    total = values[0] + values[-1]
    chemistry = 0
    for left in range(len(values) // 2):
        right = len(values) - 1 - left
        if values[left] + values[right] != total:
            return -1
        chemistry += values[left] * values[right]
    return chemistry
`
