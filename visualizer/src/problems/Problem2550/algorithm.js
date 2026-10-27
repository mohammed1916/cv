const MOD = 1000000007n

export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Number.isInteger(o.n) || o.n < 3 || o.n > 12) throw new Error('Use an object with an integer n from 3 to 12.')
  return { n: o.n }
}

// Landing vertex of every monkey after one second; dirs[i] is true for clockwise.
const landings = (n, dirs) => dirs.map((cw, i) => (cw ? (i + 1) % n : (i - 1 + n) % n))
const counts = (n, dirs) => {
  const c = new Array(n).fill(0)
  for (const v of landings(n, dirs)) c[v]++
  return c
}

export function buildTrace({ n }) {
  const choices = 2 ** n
  const allClockwise = new Array(n).fill(true)
  const mixed = Array.from({ length: n }, (_, i) => i === 0)
  const frames = [
    { phase: 'start', activeLine: L('each of the n monkeys picks'), counts: new Array(n).fill(0), message: `Each of ${n} monkeys picks a direction, giving 2^${n} = ${choices} choices.` },
    { phase: 'uniform', activeLine: L('if every monkey picks the same direction'), counts: counts(n, allClockwise), message: 'All clockwise: each monkey moves to the next vertex and no two meet, so no collision.' },
    { phase: 'mixed', activeLine: L('any mixed choice has'), counts: counts(n, mixed), message: 'One clockwise and the rest anticlockwise: a clockwise monkey meets its anticlockwise neighbour, a collision.' },
  ]
  const result = Number((BigInt(choices) - 2n) % MOD)
  frames.push({ phase: 'done', activeLine: L('return (2 to the power n minus 2)'), counts: counts(n, mixed), message: `Collision choices: ${choices} - 2 = ${result}.` })
  return { input: { n }, result, frames, n }
}

export const code = `count direction choices where at least one collision happens
  each of the n monkeys picks clockwise or anticlockwise, giving 2 to the power n choices
  if every monkey picks the same direction then no two monkeys meet
  any mixed choice has a clockwise monkey next to an anticlockwise one, which swap and collide
  so subtract the 2 collision free choices
  return (2 to the power n minus 2) modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_collisions(n):
    MOD = 10 ** 9 + 7
    return (pow(2, n, MOD) - 2) % MOD
`
