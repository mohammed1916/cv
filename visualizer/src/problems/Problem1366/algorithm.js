export function parseInput(text) {
  const input = JSON.parse(text)
  const votes = input?.votes
  if (!Array.isArray(votes) || votes.length < 1 || votes.length > 10) throw new Error('votes is a list of 1 to 10 ballots.')
  if (votes.some(v => typeof v !== 'string' || !/^[A-Z]{1,26}$/.test(v))) throw new Error('Each ballot is 1 to 26 uppercase letters.')
  const team = [...votes[0]].sort().join('')
  if (votes.some(v => [...v].sort().join('') !== team || new Set(v).size !== v.length)) throw new Error('Every ballot must rank the same teams, each once.')
  return { votes }
}

export function buildTrace(input) {
  const { votes } = input
  const teams = [...votes[0]]
  const places = votes[0].length
  const counts = Object.fromEntries(teams.map(t => [t, Array(places).fill(0)]))
  const frames = [{ phase: 'start', activeLine: L('set team list to the letters'), team: null, counts: snapshot(), order: [], message: `Teams: ${teams.join(', ')}. Each place starts at zero.` }]
  function snapshot() { return Object.fromEntries(Object.entries(counts).map(([t, c]) => [t, [...c]])) }
  votes.forEach((vote, v) => {
    for (let pos = 0; pos < vote.length; pos++) counts[vote[pos]][pos]++
    frames.push({ phase: 'tally', activeLine: L('for each vote'), team: null, counts: snapshot(), order: [], message: `Ballot ${v + 1} (${vote}) is counted.` })
  })
  const order = [...teams].sort((a, b) => {
    for (let pos = 0; pos < places; pos++) if (counts[a][pos] !== counts[b][pos]) return counts[b][pos] - counts[a][pos]
    return a < b ? -1 : a > b ? 1 : 0
  })
  frames.push({ phase: 'rank', activeLine: L('sort teams by their counts'), team: null, counts: snapshot(), order: [...order], message: `Teams ranked by their place counts: ${order.join(' ')}.` })
  const result = order.join('')
  frames.push({ phase: 'done', activeLine: L('return the sorted teams'), team: null, counts: snapshot(), order: [...order], message: `Ranking: ${result}.` })
  return { input, result, frames }
}

export const code = `rank the teams by how many first, second and later places they received
  set team list to the letters of the first vote
  set counts for each team to zeros, one slot for each place
  for each vote, add one to the count of each team in each place
  sort teams by their counts, comparing place one first, then place two, and so on
  if two teams have equal counts then order them alphabetically
  return the sorted teams as one string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def rank_teams(votes):
    teams = list(votes[0])
    places = len(votes[0])
    counts = {t: [0] * places for t in teams}
    for vote in votes:
        for pos, t in enumerate(vote):
            counts[t][pos] += 1
    order = sorted(teams, key=lambda t: ([-c for c in counts[t]], t))
    return ''.join(order)
`
