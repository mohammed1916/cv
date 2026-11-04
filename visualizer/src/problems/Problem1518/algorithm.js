export const phases = [
  { id: 'start', label: 'Start', description: 'Drink the full bottles first; each drunk bottle becomes an empty one.' },
  { id: 'exchange', label: 'Exchange empties', description: 'Trade every group of numExchange empties for one full bottle.' },
  { id: 'drink', label: 'Drink new bottles', description: 'Drink the bottles received and add them to the total.' },
  { id: 'stop', label: 'Too few empties', description: 'Stop when fewer than numExchange empties remain.' },
  { id: 'done', label: 'Complete', description: 'Report the total number of bottles drunk.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"numBottles": 9, "numExchange": 3}.')
  const { numBottles, numExchange } = input
  if (!Number.isInteger(numBottles) || numBottles < 1 || numBottles > 100) throw new Error('numBottles is an integer from 1 to 100.')
  if (!Number.isInteger(numExchange) || numExchange < 2 || numExchange > 100) throw new Error('numExchange is an integer from 2 to 100.')
  return { numBottles, numExchange }
}

export const code = [
  "function waterBottles(numBottles, numExchange) {",
  "  let drunk = numBottles",
  "  let empty = numBottles",
  "  while (empty >= numExchange) {",
  "    const fresh = Math.floor(empty / numExchange)",
  "    drunk += fresh",
  "    empty = (empty % numExchange) + fresh }",
  "  return drunk }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def num_water_bottles(num_bottles, num_exchange):
    drunk = num_bottles
    empty = num_bottles
    while empty >= num_exchange:
        fresh = empty // num_exchange
        drunk += fresh
        empty = empty % num_exchange + fresh
    return drunk
`

const LINE = { start: 2, exchange: 5, drink: 6, stop: 4, done: 8 }

export function buildTrace({ numBottles, numExchange }) {
  let drunk = numBottles
  let empty = numBottles
  let round = 0
  const snap = fresh => ({ round, drunk, empty, fresh, numExchange })
  const frames = [{ phase: 'start', activeLine: LINE.start, pythonLine: LINE.start, snapshot: snap(0), message: `Drink the ${numBottles} full bottles first. That leaves ${empty} empty bottles.` }]
  while (empty >= numExchange) {
    round++
    const fresh = Math.floor(empty / numExchange)
    frames.push({ phase: 'exchange', activeLine: LINE.exchange, pythonLine: LINE.exchange, snapshot: snap(fresh), message: `${empty} empties trade in groups of ${numExchange}, which gives ${fresh} full bottles.` })
    drunk += fresh
    empty = empty % numExchange + fresh
    frames.push({ phase: 'drink', activeLine: LINE.drink, pythonLine: LINE.drink, snapshot: snap(fresh), message: `Drink ${fresh} more, so the total is ${drunk}. Empties now: ${empty}.` })
  }
  frames.push({ phase: 'stop', activeLine: LINE.stop, pythonLine: LINE.stop, snapshot: snap(0), message: `Only ${empty} empty bottles remain, fewer than ${numExchange}, so the exchanges stop.` })
  frames.push({ phase: 'done', activeLine: LINE.done, pythonLine: LINE.done, snapshot: snap(0), message: `Total bottles drunk: ${drunk}.` })
  return { input: { numBottles, numExchange }, result: drunk, frames }
}
