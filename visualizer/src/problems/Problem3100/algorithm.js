export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with numBottles and numExchange.')
  const { numBottles, numExchange } = data
  if (!Number.isInteger(numBottles) || numBottles < 1 || numBottles > 100) throw new Error('numBottles is an integer from 1 to 100.')
  if (!Number.isInteger(numExchange) || numExchange < 1 || numExchange > 100) throw new Error('numExchange is an integer from 1 to 100.')
  return { numBottles, numExchange }
}

export function buildTrace(input) {
  let full = input.numBottles
  let empty = 0
  let cost = input.numExchange
  let drunk = 0
  const frames = [{ pythonLine: 2, phase: 'start', activeLine: L('let drunk = 0'), full, empty, cost, drunk, message: `Start with ${full} full bottles. An exchange costs ${cost} empty bottles.` }]
  while (full > 0) {
    drunk += full
    empty += full
    full = 0
    frames.push({ pythonLine: 9, phase: 'drink', activeLine: L('drunk += full'), full, empty, cost, drunk, message: `Drink every full bottle. Drunk so far: ${drunk}. Empty bottles: ${empty}.` })
    if (empty >= cost) {
      empty -= cost
      full = 1
      frames.push({ pythonLine: 11, phase: 'exchange', activeLine: L('empty -= cost'), full, empty, cost, drunk, message: `Exchange ${cost} empty bottles for one full bottle. The next exchange costs ${cost + 1}.` })
      cost += 1
    }
  }
  frames.push({ pythonLine: 14, phase: 'done', activeLine: L('return drunk'), full, empty, cost, drunk, message: `Total bottles drunk: ${drunk}.` })
  return { input, result: drunk, frames }
}

export const code = `function waterBottlesII(numBottles, numExchange) {
  let full = numBottles
  let empty = 0
  let cost = numExchange
  let drunk = 0
  while (full > 0) {
    drunk += full
    empty += full
    full = 0
    if (empty >= cost) {
      empty -= cost
      cost += 1
      full = 1
    }
  }
  return drunk
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def water_bottles_ii(numBottles, numExchange):
    drunk = 0
    full = numBottles
    empty = 0
    cost = numExchange
    while full > 0:
        drunk += full
        empty += full
        full = 0
        if empty >= cost:
            empty -= cost
            cost += 1
            full = 1
    return drunk
`
