export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with players and trainers.')
  const { players, trainers } = input
  if (!Array.isArray(players) || players.length < 1 || players.length > 8) throw new Error('players needs 1 to 8 abilities.')
  if (!Array.isArray(trainers) || trainers.length < 1 || trainers.length > 8) throw new Error('trainers needs 1 to 8 abilities.')
  if ([...players, ...trainers].some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Abilities are integers from 1 to 20.')
  return { players, trainers }
}

export function buildTrace(input) {
  const { players, trainers } = input
  const ps = [...players].sort((a, b) => a - b)
  const ts = [...trainers].sort((a, b) => a - b)
  let next = 0
  let matches = 0
  const frames = [{ phase: 'start', activeLine: L('sort the players'), trainer: -1, next, matches, message: `Players ${ps.join(', ')}; trainers ${ts.join(', ')}.` }]
  for (const trainer of ts) {
    if (next < ps.length && ps[next] <= trainer) {
      frames.push({ phase: 'match', activeLine: L('match them'), trainer, next, matches: matches + 1, message: `Trainer ${trainer} takes player ${ps[next]}.` })
      next += 1
      matches += 1
    } else {
      frames.push({ phase: 'skip', activeLine: L('otherwise skip this trainer'), trainer, next, matches, message: `Trainer ${trainer} cannot train the next player; skip.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return matches'), trainer: -1, next, matches, message: `${matches} players are matched.` })
  return { input, result: matches, frames }
}

export const code = `maximum number of players matched to trainers:
  sort the players from weakest to strongest
  sort the trainers from weakest to strongest
  set next to 0 and matches to 0
  for each trainer in order
    if a player remains and the next player is at most the trainer then match them, add one to next and add one to matches
    otherwise skip this trainer
  return matches`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_matched_players(players, trainers):
    players = sorted(players)
    trainers = sorted(trainers)
    nxt = 0
    matches = 0
    for trainer in trainers:
        if nxt < len(players) and players[nxt] <= trainer:
            nxt += 1
            matches += 1
    return matches
`
