export const phases = [
  { id: 'total', label: 'Total', description: 'A negative total can never be repaired.' },
  { id: 'round', label: 'New search', description: 'Everyone with spare units starts at price 0.' },
  { id: 'search', label: 'Search', description: 'Spread the cheapest known price to both neighbours.' },
  { id: 'route', label: 'Route', description: 'The cheapest person in need, and the way there.' },
  { id: 'push', label: 'Send', description: 'Send as many units as the route allows.' },
  { id: 'done', label: 'Result', description: 'Nobody is negative; report the moves.' },
]

const MAX_N = 12
const MAX_ABS = 100000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with balance.')
  const { balance } = input
  if (!Array.isArray(balance) || balance.length < 1 || balance.length > MAX_N) throw new Error(`balance has 1 to ${MAX_N} entries here.`)
  if (balance.some(v => !Number.isInteger(v) || Math.abs(v) > MAX_ABS)) throw new Error(`Each balance is an integer from -${MAX_ABS} to ${MAX_ABS}.`)
  return { balance: [...balance] }
}

export const code = `fewest neighbour moves so that nobody is negative
  if the total is negative, return -1
  supply = spare units, need = missing units, net[i] = units crossing i to i+1
  while somebody still has a need
    start a search: everyone with supply has price 0
    take the next person u from the queue
      one step costs 1, or -1 when it undoes units already crossing that edge
      if that makes a neighbour cheaper, record it and queue the neighbour
    pick the cheapest person with a need and follow the route back
    send the most the route allows and add units times price to moves
  return moves`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque
from math import inf


def min_moves(balance):
    if sum(balance) < 0:
        return -1
    n = len(balance)
    supply = [max(b, 0) for b in balance]
    need = [max(-b, 0) for b in balance]
    net = [0] * n
    moves = 0
    while sum(need) > 0:
        dist = [0 if s > 0 else inf for s in supply]
        came = [None] * n
        queue = deque(i for i in range(n) if supply[i] > 0)
        while queue:
            u = queue.popleft()
            for v, edge, way in ((u + 1) % n, u, 1), ((u - 1) % n, (u - 1) % n, -1):
                price = -1 if net[edge] * way < 0 else 1
                if dist[u] + price < dist[v]:
                    dist[v] = dist[u] + price
                    came[v] = (u, edge, way)
                    if v not in queue:
                        queue.append(v)
        end = min((i for i in range(n) if need[i] > 0), key=lambda i: dist[i])
        amount, route, at = need[end], [], end
        while came[at]:
            u, edge, way = came[at]
            route.append((edge, way))
            if net[edge] * way < 0:
                amount = min(amount, abs(net[edge]))
            at = u
        amount = min(amount, supply[at])
        for edge, way in route:
            net[edge] += way * amount
        supply[at] -= amount
        need[end] -= amount
        moves += amount * dist[end]
    return moves
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Pseudocode line missing: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.trim().split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line missing: ${text}`)
  return index + 1
}

export function buildTrace({ balance }) {
  const n = balance.length
  const total = balance.reduce((a, b) => a + b, 0)
  const supply = balance.map(b => Math.max(b, 0))
  const need = balance.map(b => Math.max(-b, 0))
  const net = Array(n).fill(0)
  const rounds = []
  const frames = []
  let moves = 0
  const current = () => balance.map((b, i) => (n < 2 ? b : b - net[i] + net[(i - 1 + n) % n]))
  const emit = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, n, total, moves,
    supply: [...supply], need: [...need], net: [...net], now: current(), rounds: rounds.map(r => ({ ...r })),
    dist: null, queue: [], u: null, updated: [], route: [], from: null, to: null, ...extra,
  })

  emit('total', L('if the total is negative'), P('if sum(balance)'), total < 0
    ? `The balances add up to ${total}. Moves never change the total, so someone must stay negative.`
    : `The balances add up to ${total}, so the units exist to cover every shortage.`)
  if (total < 0) {
    emit('done', L('if the total is negative'), P('return -1'), 'Return -1: it cannot be done.', { impossible: true })
    return { input: { balance }, result: -1, frames }
  }
  while (need.some(v => v > 0)) {
    const dist = supply.map(s => (s > 0 ? 0 : Infinity))
    const came = Array(n).fill(null)
    const queue = supply.flatMap((s, i) => (s > 0 ? [i] : []))
    emit('round', L('start a search'), P('queue = deque'), `Round ${rounds.length + 1}: the unit can start from any of ${queue.map(i => `person ${i}`).join(', ')}, at price 0.`, { dist: [...dist], queue: [...queue] })
    while (queue.length) {
      const u = queue.shift()
      const updated = []
      for (const [v, edge, way] of [[(u + 1) % n, u, 1], [(u - 1 + n) % n, (u - 1 + n) % n, -1]]) {
        const price = net[edge] * way < 0 ? -1 : 1
        if (dist[u] + price < dist[v]) {
          dist[v] = dist[u] + price
          came[v] = [u, edge, way]
          updated.push({ v, price })
          if (!queue.includes(v)) queue.push(v)
        }
      }
      emit('search', L('take the next person'), P(updated.length ? 'dist[v] = dist[u] + price' : 'u = queue.popleft()'), updated.length
        ? `From person ${u} at price ${dist[u]}: ${updated.map(({ v, price }) => `person ${v} is now ${dist[v]}${price < 0 ? ' by undoing a crossing' : ''}`).join('; ')}.`
        : `From person ${u} at price ${dist[u]}: neither neighbour gets cheaper.`, { dist: [...dist], queue: [...queue], u, updated: updated.map(item => item.v) })
    }
    let end = -1
    for (let i = 0; i < n; i++) if (need[i] > 0 && (end < 0 || dist[i] < dist[end])) end = i
    let amount = need[end]
    const route = []
    let at = end
    while (came[at]) {
      const [u, edge, way] = came[at]
      const undo = net[edge] * way < 0
      route.unshift({ edge, way, undo, from: u, to: at })
      if (undo) amount = Math.min(amount, Math.abs(net[edge]))
      at = u
    }
    amount = Math.min(amount, supply[at])
    const undone = route.filter(step => step.undo).length
    emit('route', L('pick the cheapest'), P('end = min('), `Person ${end} is the cheapest in need, at price ${dist[end]}. The route starts at person ${at}${undone ? ` and undoes ${undone} crossing${undone === 1 ? '' : 's'}` : ''}.`, { dist: [...dist], route, from: at, to: end })
    const added = amount * dist[end]
    for (const { edge, way } of route) net[edge] += way * amount
    supply[at] -= amount
    need[end] -= amount
    moves += added
    rounds.push({ round: rounds.length + 1, from: at, to: end, units: amount, 'price each': dist[end], 'moves added': added, 'moves total': moves })
    emit('push', L('send the most'), P('moves += amount'), `Send ${amount} unit${amount === 1 ? '' : 's'} at ${dist[end]} each, adding ${added} moves. Total ${moves}.`, { dist: [...dist], route, from: at, to: end })
  }
  emit('done', L('return moves'), P('return moves'), rounds.length
    ? `Return ${moves}. Every arrow count on the ring adds up to that number.`
    : 'Nobody is negative, so return 0 without moving anything.')
  return { input: { balance }, result: moves, net: [...net], frames }
}
