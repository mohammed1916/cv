export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.x) || !Number.isInteger(data.y)) throw new Error('Use an object with integers x and y, for example {"x":2,"y":7}.')
  if (data.x < 1 || data.x > 40 || data.y < 1 || data.y > 80) throw new Error('x must be 1 to 40 and y must be 1 to 80.')
  return { x: data.x, y: data.y }
}

export function buildTrace(input) {
  let { x, y } = input
  let turns = 0
  const frames = [{ phase: 'start', activeLine: L('set turns to 0'), x, y, turns, result: null, message: `Start with ${x} coins of 75 and ${y} coins of 10. A turn takes exactly 115 in coins.` }]
  while (x >= 1 && y >= 4) {
    x -= 1
    y -= 4
    turns += 1
    frames.push({ phase: 'move', activeLine: L('take one 75-coin and four 10-coins'), x, y, turns, result: null, message: `Turn ${turns} takes one 75-coin and four 10-coins. ${x} and ${y} coins remain.` })
  }
  const result = turns % 2 === 1 ? 'Alice' : 'Bob'
  frames.push({ phase: 'done', activeLine: L('return Alice'), x, y, turns, result, message: `No turn is left after ${turns} turns, so the player to move loses and ${result} wins.` })
  return { input, result, frames }
}

export const code = `winner of the coin game (x coins of 75, y coins of 10)
  set turns to 0
  while at least one 75-coin and four 10-coins remain
    take one 75-coin and four 10-coins
    add 1 to turns
  if turns is odd then
    return Alice
  otherwise
    return Bob`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def winning_player(x, y):
    turns = 0
    while x >= 1 and y >= 4:
        x -= 1
        y -= 4
        turns += 1
    return "Alice" if turns % 2 == 1 else "Bob"
`
