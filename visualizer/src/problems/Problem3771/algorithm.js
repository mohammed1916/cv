const INT = v => Number.isInteger(v) && v >= 1 && v <= 100

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with hp, damage and requirement.')
  const { hp, damage, requirement } = input
  if (!Number.isInteger(hp) || hp < 1 || hp > 100) throw new Error('hp is an integer from 1 to 100.')
  if (!Array.isArray(damage) || !Array.isArray(requirement) || damage.length !== requirement.length || damage.length < 1 || damage.length > 10) {
    throw new Error('damage and requirement are equal-length lists of 1 to 10 numbers.')
  }
  if (!damage.every(INT) || !requirement.every(INT)) throw new Error('Each damage and requirement value is an integer from 1 to 100.')
  return { hp, damage, requirement }
}

export function buildTrace({ hp, damage, requirement }) {
  const n = damage.length
  const frames = []
  let total = 0
  for (let j = 0; j < n; j++) {
    let health = hp
    let score = 0
    frames.push({ pythonLine: pyAt('for start in'), phase: 'start', activeLine: codeAt('for each starting room'), start: j, at: -1, health, score, total, message: `Start at room ${j + 1} with ${hp} health.` })
    for (let k = j; k < n; k++) {
      health -= damage[k]
      const earned = health >= requirement[k]
      if (earned) score++
      frames.push({ pythonLine: pyAt('health -='), phase: earned ? 'point' : 'miss', activeLine: codeAt('subtract damage'), start: j, at: k, health, score, total, message: `Room ${k + 1}: health ${health} ${earned ? 'meets' : 'misses'} requirement ${requirement[k]}.` })
    }
    total += score
    frames.push({ pythonLine: pyAt('total += score'), phase: 'sum', activeLine: codeAt('add score to total'), start: j, at: -1, health, score, total, message: `Starting room ${j + 1} earns ${score}; running total ${total}.` })
  }
  frames.push({ pythonLine: pyAt('return total'), phase: 'done', activeLine: codeAt('return total'), start: -1, at: -1, health: null, score: null, total, message: `Sum of all starting scores is ${total}.` })
  return { input: { hp, damage, requirement }, result: total, frames }
}

export const code = `sum the points earned from every starting room
  total is 0
  for each starting room j
    health is hp and score is 0
    for each room k from j to the end
      subtract damage k from health
      if health is at least requirement k then add 1 to score
    add score to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))

const codeAt = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def total_score(hp, damage, requirement):
    total = 0
    n = len(damage)
    for start in range(n):
        health = hp
        score = 0
        for k in range(start, n):
            health -= damage[k]
            if health >= requirement[k]:
                score += 1
        total += score
    return total
`
const pyAt = s => python.split('\n').findIndex(l => l.includes(s)) + 1
