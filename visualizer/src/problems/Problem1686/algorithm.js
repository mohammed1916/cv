export const phases = [
  { id: 'total', label: 'Combined values', description: 'Add each stone\'s two personal values. Both players care about this combined value.' },
  { id: 'sort', label: 'Rank stones', description: 'Order the stones from the highest combined value to the lowest.' },
  { id: 'take', label: 'Take turns', description: 'Alice takes the first stone in the order, Bob the next, and so on.' },
  { id: 'score', label: 'Compare totals', description: 'Compare what each player collected.' },
  { id: 'done', label: 'Result', description: 'Report 1 if Alice is ahead, -1 if Bob is ahead, and 0 on a tie.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"alice": [1, 3], "bob": [2, 1]}.')
  const { alice, bob } = input
  const valid = v => Array.isArray(v) && v.length >= 1 && v.length <= 16 && v.every(x => Number.isInteger(x) && x >= 1 && x <= 100)
  if (!valid(alice) || !valid(bob) || alice.length !== bob.length) throw new Error('alice and bob must be equal-length lists of 1 to 16 integers from 1 to 100.')
  return { alice, bob }
}

export const code = `stone game vi (alice, bob):
  total[i] = alice[i] + bob[i] for each stone i
  order the stones by total, largest first
  alice_sum = 0, bob_sum = 0
  for turn k from 0 to n - 1:
    stone = order[k]
    if k is even:
      alice takes stone
      alice_sum += alice[stone]
    else:
      bob takes stone
      bob_sum += bob[stone]
  if alice_sum > bob_sum: return 1
  if alice_sum < bob_sum: return -1
  return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def stone_game_vi(alice, bob):
    total = [a + b for a, b in zip(alice, bob)]
    order = sorted(range(len(alice)), key=lambda i: -total[i])
    alice_sum = bob_sum = 0
    for turn, stone in enumerate(order):
        if turn % 2 == 0:
            alice_sum += alice[stone]
        else:
            bob_sum += bob[stone]
    if alice_sum > bob_sum:
        return 1
    if alice_sum < bob_sum:
        return -1
    return 0
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

export function buildTrace({ alice, bob }) {
  const n = alice.length
  const total = alice.map((a, i) => a + bob[i])
  const order = [...total.keys()].sort((x, y) => total[y] - total[x] || x - y)
  const taken = []
  let aliceSum = 0
  let bobSum = 0
  const snap = (extra = {}) => ({ total, order: null, taken: [...taken], aliceSum, bobSum, current: null, ...extra })
  const frames = [{ phase: 'total', ...at('total[i] =', 'total = ['), snapshot: snap(), message: `Combined values are ${total.join(', ')}. Each is Alice's value plus Bob's value for that stone.` }]
  frames.push({ phase: 'sort', ...at('order the stones', 'order = sorted'), snapshot: snap({ order }), message: `Ranking from highest combined value: stones ${order.join(', ')}. Ties keep the lower index first.` })
  for (let k = 0; k < n; k++) {
    const stone = order[k]
    if (k % 2 === 0) {
      aliceSum += alice[stone]
      taken.push({ stone, player: 'Alice' })
      frames.push({ phase: 'take', ...at('alice takes stone', 'alice_sum += alice[stone]'), snapshot: snap({ order, current: stone }), message: `Turn ${k + 1}: Alice takes stone ${stone} worth ${alice[stone]} to her. Her total is ${aliceSum}.` })
    } else {
      bobSum += bob[stone]
      taken.push({ stone, player: 'Bob' })
      frames.push({ phase: 'take', ...at('bob takes stone', 'bob_sum += bob[stone]'), snapshot: snap({ order, current: stone }), message: `Turn ${k + 1}: Bob takes stone ${stone} worth ${bob[stone]} to him. His total is ${bobSum}.` })
    }
  }
  const result = aliceSum > bobSum ? 1 : aliceSum < bobSum ? -1 : 0
  frames.push({ phase: 'score', ...at('if alice_sum > bob_sum', 'if alice_sum > bob_sum'), snapshot: snap({ order }), message: `Alice collected ${aliceSum} and Bob collected ${bobSum}.` })
  frames.push({ phase: 'done', ...at(`return ${result}`, `return ${result}`), snapshot: snap({ order }), message: `The result is ${result}.` })
  return { input: { alice, bob }, result, frames }
}
