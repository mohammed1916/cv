export const phases = [
  { id: 'start', label: 'Start', description: 'Sort the piles from largest to smallest so that each round is a run of three neighbours at the top.' },
  { id: 'round', label: 'Take a round', description: 'Alice takes the largest pile of the top three, you take the middle one, and Bob takes the smallest.' },
  { id: 'done', label: 'Complete', description: 'Your total after every round is the answer.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"piles": [2, 4, 1, 2, 7, 8]}.')
  const { piles } = input
  if (!Array.isArray(piles) || piles.length < 3 || piles.length > 30 || piles.length % 3 !== 0) {
    throw new Error('piles is a list of 3 to 30 values whose length is a multiple of 3.')
  }
  if (!piles.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each pile is an integer from 1 to 1000.')
  return { piles }
}

export function buildTrace({ piles }) {
  const ordered = [...piles].sort((a, b) => b - a)
  const rounds = ordered.length / 3
  const snap = (round, triple, coins) => ({ ordered, round, triple, coins })
  const frames = [{
    phase: 'start', activeLine: L('ordered = [...piles]'), pythonLine: P('ordered = sorted'),
    snapshot: snap(-1, [], 0),
    message: `Sort the ${piles.length} piles from largest to smallest. Each round takes the next three from the top.`,
  }]
  let coins = 0
  for (let r = 0; r < rounds; r++) {
    coins += ordered[2 * r + 1]
    frames.push({
      phase: 'round', activeLine: L('coins +='), pythonLine: P('coins +='),
      snapshot: snap(r, [2 * r, 2 * r + 1, 2 * r + 2], coins),
      message: `Round ${r + 1}: Alice takes ${ordered[2 * r]}, you take ${ordered[2 * r + 1]}, and Bob takes ${ordered[2 * r + 2]}. Your total is ${coins}.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return coins'), pythonLine: P('return coins'),
    snapshot: snap(rounds, [], coins), message: `Return ${coins}.`,
  })
  return { input: { piles }, result: coins, frames }
}

export const code = [
  "function maxCoins(piles) {",
  "  const ordered = [...piles].sort((a, b) => b - a)",
  "  let coins = 0",
  "  for (let r = 0; r < piles.length / 3; r++) {",
  "    coins += ordered[2 * r + 1] }",
  "  return coins }",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def max_coins(piles):
    ordered = sorted(piles, reverse=True)
    coins = 0
    for r in range(len(piles) // 3):
        coins += ordered[2 * r + 1]
    return coins
`
