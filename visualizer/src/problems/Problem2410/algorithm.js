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
  const frames = [{ phase: 'start', pythonLine: P('players = sorted'), activeLine: L('const ps = '), trainer: -1, next, matches, ps, ts, message: `Players ${ps.join(', ')}; trainers ${ts.join(', ')}.` }]
  for (const trainer of ts) {
    if (next < ps.length && ps[next] <= trainer) {
      frames.push({ phase: 'match', pythonLine: P('nxt += 1'), activeLine: L('next++'), trainer, next, matches: matches + 1, ps, ts, message: `Trainer ${trainer} takes player ${ps[next]}.` })
      next += 1
      matches += 1
    } else {
      frames.push({ phase: 'skip', pythonLine: P('if nxt < len'), activeLine: L('otherwise skip this trainer'), trainer, next, matches, ps, ts, message: next < ps.length ? `Trainer ${trainer} is weaker than the next player ${ps[next]}; skip.` : `No players remain, so trainer ${trainer} is skipped.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: P('return matches'), activeLine: L('return matches'), trainer: -1, next, matches, ps, ts, message: `${matches} players are matched.` })
  return { input, result: matches, frames }
}

export const code = `function maxMatchedPlayers(players, trainers) {
  const ps = [...players].sort((a, b) => a - b)
  const ts = [...trainers].sort((a, b) => a - b)
  let next = 0
  let matches = 0
  for (const trainer of ts) {
    if (next < ps.length && ps[next] <= trainer) {
      next++
      matches++
    } else {
      // otherwise skip this trainer
    }
  }
  return matches
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

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
