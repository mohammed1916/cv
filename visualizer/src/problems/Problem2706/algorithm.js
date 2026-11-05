const PL = s => python.split('\n').findIndex(line => line.trim() === s) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with prices and money.')
  const { prices, money } = input
  if (!Array.isArray(prices) || prices.length < 2 || prices.length > 12 || !prices.every(p => Number.isInteger(p) && p >= 1 && p <= 100)) throw new Error('prices has 2 to 12 integers from 1 to 100.')
  if (!Number.isInteger(money) || money < 1 || money > 100) throw new Error('money is an integer from 1 to 100.')
  return { prices, money }
}

export function buildTrace({ prices, money }) {
  const frames = []
  let first = null
  let second = null
  let firstIndex = -1, secondIndex = -1
  frames.push({ pythonLine: PL('first = second = None'), phase: 'start', activeLine: L('set first and second'), index: -1, first, second, firstIndex, secondIndex, leftover: null, message: 'Start with no cheapest or second cheapest price.' })
  prices.forEach((price, i) => {
    if (first === null || price < first) {
      second = first
      secondIndex = firstIndex
      first = price
      firstIndex = i
      frames.push({ pythonLine: PL('first, second = price, first'), phase: 'scan', activeLine: L('if first is none'), index: i, first, second, firstIndex, secondIndex, leftover: null, message: `${price} is the new cheapest; the old cheapest becomes second.` })
    } else if (second === null || price < second) {
      second = price
      secondIndex = i
      frames.push({ pythonLine: PL('second = price'), phase: 'scan', activeLine: L('else if second is none'), index: i, first, second, firstIndex, secondIndex, leftover: null, message: `${price} is the new second cheapest.` })
    } else {
      frames.push({ pythonLine: PL('for price in prices:'), phase: 'scan', activeLine: L('for each price'), index: i, first, second, firstIndex, secondIndex, leftover: null, message: `${price} is not cheaper than either price; skip it.` })
    }
  })
  const leftover = money - (first + second)
  frames.push({ pythonLine: PL('leftover = money - (first + second)'), phase: 'pair', activeLine: L('leftover = money'), index: -1, first, second, firstIndex, secondIndex, leftover, message: `${money} - (${first} + ${second}) = ${leftover}.` })
  const result = leftover >= 0 ? leftover : money
  frames.push({ pythonLine: PL('return leftover if leftover >= 0 else money'), phase: 'done', activeLine: L('if leftover'), index: -1, first, second, firstIndex, secondIndex, leftover, result, message: leftover >= 0 ? `Keep the leftover ${leftover}.` : `The pair is too expensive; keep all ${money}.` })
  return { input: { prices, money }, result, frames }
}

export const code = `buy two chocolates without going into debt
  set first and second to none
  for each price
    if first is none or price is below first then second becomes first and first becomes price
    else if second is none or price is below second then second becomes price
  leftover = money minus the sum of first and second
  if leftover is not negative return leftover, else return money`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def buy_two_chocolates(prices, money):
    first = second = None
    for price in prices:
        if first is None or price < first:
            first, second = price, first
        elif second is None or price < second:
            second = price
    leftover = money - (first + second)
    return leftover if leftover >= 0 else money
`
