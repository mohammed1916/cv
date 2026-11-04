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
  const frames = [{ pythonLine: PY('stones = n'), phase: 'start', activeLine: L('let stones = n'), turn: null, stones, need, message: `Start with ${n} stones. Alice must remove 10 first.` }]
  while (need > 0 && stones >= need) {
    const player = aliceTurn ? 'Alice' : 'Bob'
    stones -= need
    frames.push({ pythonLine: PY('stones -= need'), phase: 'turn', activeLine: L('stones -= need'), turn: player, stones, need, message: `${player} removes ${need} stones. ${stones} remain.` })
    need -= 1
    aliceTurn = !aliceTurn
  }
  const loser = aliceTurn ? 'Alice' : 'Bob'
  const result = loser === 'Bob'
  frames.push({ pythonLine: PY('return not alice_turn'), phase: 'done', activeLine: L('return !aliceTurn'), turn: loser, stones, need, message: `${loser} needs ${need} stones but only ${stones} remain, so ${loser} loses. ${result ? 'Alice wins.' : 'Bob wins.'}` })
  return { input: { n }, result, frames }
}

// Code panel: real JavaScript. Python below mirrors it line for line.
export const code = [
  "function aliceWins(n) {",
  "  let stones = n;",
  "  let need = 10;",
  "  let aliceTurn = true;",
  "  while (stones >= need) {",
  "    stones -= need;",
  "    need -= 1;",
  "    aliceTurn = !aliceTurn;",
  "  }",
  "  return !aliceTurn;",
  "}",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

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
