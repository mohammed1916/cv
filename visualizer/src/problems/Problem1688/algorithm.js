export const phases = [
  { id: 'start', label: 'Teams enter', description: 'Begin with n teams and no matches played.' },
  { id: 'round', label: 'Play a round', description: 'Pair up teams. Each pair plays one match and one team in it is out.' },
  { id: 'advance', label: 'Advance winners', description: 'Winners move on. An odd team out gets a bye and also moves on.' },
  { id: 'done', label: 'Total matches', description: 'Stop when one team remains and report the matches played.' },
]

export function parseInput(text) {
  const value = Number(String(text).trim())
  if (!Number.isInteger(value) || value < 1 || value > 200) throw new Error('Enter a single whole number of teams from 1 to 200.')
  return value
}

export const code = `count matches (n):
  teams = n
  matches = 0
  while teams > 1:
    pairs = floor(teams / 2)
    matches += pairs
    teams = pairs + (teams mod 2)
  return matches`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_matches(n):
    teams = n
    matches = 0
    while teams > 1:
        pairs = teams // 2
        matches += pairs
        teams = pairs + teams % 2
    return matches
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

export function buildTrace(n) {
  let teams = n
  let matches = 0
  let round = 0
  const frames = [{ phase: 'start', ...at('teams = n', 'teams = n'), snapshot: { teams, matches, round, pairs: 0, bye: false }, message: `${n} teams enter. Every match removes exactly one team, so the answer is the number of teams that must be removed.` }]
  while (teams > 1) {
    round += 1
    const pairs = Math.floor(teams / 2)
    const bye = teams % 2 === 1
    matches += pairs
    frames.push({ phase: 'round', ...at('matches += pairs', 'matches += pairs'), snapshot: { teams, matches, round, pairs, bye }, message: `Round ${round}: ${teams} teams make ${pairs} matches, so the total is now ${matches}.` })
    teams = pairs + (teams % 2)
    frames.push({ phase: 'advance', ...at('teams = pairs +', 'teams = pairs + teams % 2'), snapshot: { teams, matches, round, pairs, bye }, message: `${teams} teams go on to round ${round + 1}${bye ? ', including the team that drew a bye' : ''}.` })
  }
  frames.push({ phase: 'done', ...at('return matches', 'return matches'), snapshot: { teams, matches, round, pairs: 0, bye: false }, message: `One team is left, and ${matches} matches were played.` })
  return { input: n, result: matches, frames }
}
