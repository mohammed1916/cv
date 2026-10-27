export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.n)) throw new Error('Use an object such as {"n":12}.')
  const { n } = data
  if (n < 1 || n > 50) throw new Error('n is an integer from 1 to 50.')
  return { n }
}

export function buildTrace({ n }) {
  let stones = n
  let need = 10
  let aliceTurn = true
  const frames = [{ phase: 'start', activeLine: L('set stones to n'), turn: null, stones, need, message: `Start with ${n} stones. Alice must remove 10 first.` }]
  while (need > 0 && stones >= need) {
    const player = aliceTurn ? 'Alice' : 'Bob'
    stones -= need
    frames.push({ phase: 'turn', activeLine: L('subtract need from stones'), turn: player, stones, need, message: `${player} removes ${need} stones. ${stones} remain.` })
    need -= 1
    aliceTurn = !aliceTurn
  }
  const loser = aliceTurn ? 'Alice' : 'Bob'
  const result = loser === 'Bob'
  frames.push({ phase: 'done', activeLine: L('return true when'), turn: loser, stones, need, message: `${loser} needs ${need} stones but only ${stones} remain, so ${loser} loses. ${result ? 'Alice wins.' : 'Bob wins.'}` })
  return { input: { n }, result, frames }
}

export const code = `can alice win the stone removal game:
  set stones to n and need to 10
  set alice turn to true
  while stones is at least need do
    subtract need from stones
    subtract 1 from need
    switch to the other player
  the player whose turn it is cannot remove need stones and loses
  return true when that player is bob`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def stone_removal_alice_wins(n):
    stones = n
    need = 10
    alice_turn = True
    while stones >= need:
        stones -= need
        need -= 1
        alice_turn = not alice_turn
    return not alice_turn
`
