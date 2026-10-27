export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with player1 and player2.')
  const { player1, player2 } = data
  for (const [name, arr] of [['player1', player1], ['player2', player2]]) {
    if (!Array.isArray(arr) || arr.length < 1 || arr.length > 10) throw new Error(`${name} holds 1 to 10 turns.`)
    if (arr.some(v => !Number.isInteger(v) || v < 0 || v > 10)) throw new Error(`Each ${name} pin count is an integer from 0 to 10.`)
  }
  if (player1.length !== player2.length) throw new Error('Both players need the same number of turns.')
  return { player1, player2 }
}

export function buildTrace(input) {
  const { player1, player2 } = input
  let score1 = 0
  let score2 = 0
  const frames = [{ phase: 'start', activeLine: L('set score1 and score2'), turn: -1, score1, score2, doubled1: [], doubled2: [], message: 'Both scores start at 0.' }]
  for (let i = 0; i < player1.length; i++) {
    const hitTen = (arr) => (i >= 1 && arr[i - 1] === 10) || (i >= 2 && arr[i - 2] === 10)
    const d1 = hitTen(player1)
    const d2 = hitTen(player2)
    score1 += d1 ? 2 * player1[i] : player1[i]
    score2 += d2 ? 2 * player2[i] : player2[i]
    frames.push({ phase: 'turn', activeLine: L('for each turn i'), turn: i, score1, score2, doubled1: d1 ? [i] : [], doubled2: d2 ? [i] : [],
      message: `Turn ${i + 1}: player 1 scores ${d1 ? 2 * player1[i] : player1[i]}${d1 ? ' (doubled)' : ''}, player 2 scores ${d2 ? 2 * player2[i] : player2[i]}${d2 ? ' (doubled)' : ''}.` })
  }
  const result = score1 > score2 ? 1 : score2 > score1 ? 2 : 0
  frames.push({ phase: 'done', activeLine: L('return 0'), turn: player1.length - 1, score1, score2, doubled1: [], doubled2: [],
    message: result === 0 ? `Tie at ${score1}.` : `Player ${result} wins ${Math.max(score1, score2)} to ${Math.min(score1, score2)}.` })
  return { input, result, frames }
}

export const code = `determine the winner of the bowling game
  set score1 and score2 to 0
  for each turn i from 0 to n minus 1
    add the pins for player 1 at turn i to score1, doubled if a ten was hit in the last two turns
    add the pins for player 2 at turn i to score2, doubled if a ten was hit in the last two turns
  if score1 is greater than score2 then return 1
  if score2 is greater than score1 then return 2
  return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def bowling_winner(player1, player2):
    score1 = 0
    score2 = 0
    for i in range(len(player1)):
        d1 = (i >= 1 and player1[i - 1] == 10) or (i >= 2 and player1[i - 2] == 10)
        d2 = (i >= 1 and player2[i - 1] == 10) or (i >= 2 and player2[i - 2] == 10)
        score1 += 2 * player1[i] if d1 else player1[i]
        score2 += 2 * player2[i] if d2 else player2[i]
    if score1 > score2:
        return 1
    if score2 > score1:
        return 2
    return 0
`
