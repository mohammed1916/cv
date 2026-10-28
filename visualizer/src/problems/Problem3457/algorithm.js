export function parseInput(text) {
  const pizzas = JSON.parse(text)
  if (!Array.isArray(pizzas) || pizzas.length < 4 || pizzas.length > 12 || pizzas.length % 4 !== 0) throw new Error('Use 4, 8 or 12 pizza weights.')
  if (pizzas.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Weights are integers from 1 to 50.')
  return pizzas
}

export function buildTrace(pizzas) {
  const ranked = [...pizzas].sort((a, b) => b - a)
  const days = ranked.length / 4
  const odd = Math.ceil(days / 2)
  let top = 0
  let next = odd
  let total = 0
  const gained = []
  const frames = [{ phase: 'sort', activeLine: L('sort the pizzas'), day: 0, gain: null, partner: null, gained: [], total, ranked, message: `Sorted heaviest first: [${ranked.join(', ')}]. There are ${odd} odd days.` }]
  for (let day = 1; day <= days; day++) {
    if (day % 2 === 1) {
      const gain = top
      total += ranked[gain]
      gained.push(gain)
      top += 1
      frames.push({ phase: 'odd', activeLine: L('gain the pizza at top'), day, gain, partner: null, gained: [...gained], total, ranked, message: `Day ${day} is odd: gain the heaviest unused pizza, ${ranked[gain]}. Total ${total}.` })
    } else {
      const partner = next
      const gain = next + 1
      total += ranked[gain]
      gained.push(gain)
      next += 2
      frames.push({ phase: 'even', activeLine: L('discard the pizza at next'), day, gain, partner, gained: [...gained], total, ranked, message: `Day ${day} is even: discard ${ranked[partner]} and gain ${ranked[gain]}. Total ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), day: days, gain: null, partner: null, gained: [...gained], total, ranked, message: `Maximum weight gained: ${total}.` })
  return { input: pizzas, result: total, frames }
}

export const code = `maximum weight gained over eating days:
  sort the pizzas from heaviest to lightest
  set odd to the number of odd days, which is the ceiling of days divided by two
  set total to 0, top to 0 and next to odd
  for each day from 1 to the number of groups of four do
    if the day is odd then
      gain the pizza at top and move top forward by one
    otherwise
      discard the pizza at next and gain the pizza after it, then move next forward by two
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def eat_pizzas(pizzas):
    ranked = sorted(pizzas, reverse=True)
    days = len(ranked) // 4
    top = 0
    nxt = (days + 1) // 2
    total = 0
    for day in range(1, days + 1):
        if day % 2 == 1:
            total += ranked[top]
            top += 1
        else:
            total += ranked[nxt + 1]
            nxt += 2
    return total
`
