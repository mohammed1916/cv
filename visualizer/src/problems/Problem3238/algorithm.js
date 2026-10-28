export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).sort().join() !== 'n,pick') throw new Error('Use an object with exactly the keys "n" and "pick".')
  const { n, pick } = value
  if (!Number.isInteger(n) || n < 2 || n > 6) throw new Error('n is an integer from 2 to 6.')
  if (!Array.isArray(pick) || pick.length < 1 || pick.length > 20) throw new Error('Use 1 to 20 picks.')
  for (const p of pick) {
    if (!Array.isArray(p) || p.length !== 2 || !Number.isInteger(p[0]) || !Number.isInteger(p[1])) throw new Error('Each pick is [player, color].')
    if (p[0] < 0 || p[0] >= n) throw new Error(`Player ${p[0]} is outside 0 to ${n - 1}.`)
    if (p[1] < 0 || p[1] > 10) throw new Error('Colors are integers from 0 to 10.')
  }
  return { n, pick }
}

export function buildTrace({ n, pick }) {
  const frames = [{ phase: 'start', activeLine: L('set counts to an empty map'), active: -1, roles: {}, state: { winners: 0 }, message: 'Player i wins when they hold at least i + 1 balls of one color.' }]
  const counts = new Map()
  const winners = new Set()
  pick.forEach(([player, color], i) => {
    const key = `${player}:${color}`
    const next = (counts.get(key) ?? 0) + 1
    counts.set(key, next)
    const wins = next > player
    if (wins) winners.add(player)
    frames.push({ phase: 'pick', activeLine: L(wins ? 'add player to winners' : 'if count for (player, color) is more than player'), active: i, roles: { [i]: wins ? 'winner' : 'picked' }, state: { player, color, held: next, needed: player + 1, winners: winners.size }, message: `Player ${player} now holds ${next} of color ${color}; ${wins ? `that reaches ${player + 1}, so player ${player} wins.` : `that is below the ${player + 1} needed.`}` })
  })
  frames.push({ phase: 'done', activeLine: L('return the size of winners'), active: -1, roles: {}, state: { winners: winners.size }, message: `${winners.size} player${winners.size === 1 ? '' : 's'} win.` })
  return { input: { n, pick }, result: winners.size, items: pick.map(([p, c]) => `P${p}:${c}`), frames }
}

export const code = `count the players who win
  set counts to an empty map from (player, color) to a number
  set winners to an empty set
  for each pick (player, color)
    add 1 to counts for (player, color)
    if count for (player, color) is more than player then add player to winners
  return the size of winners`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def winning_player_count(n, pick):
    counts = {}
    winners = set()
    for player, color in pick:
        key = (player, color)
        counts[key] = counts.get(key, 0) + 1
        if counts[key] > player:
            winners.add(player)
    return len(winners)
`
