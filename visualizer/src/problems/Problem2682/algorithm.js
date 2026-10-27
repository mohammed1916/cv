export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and k.')
  const { n, k } = data
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new Error('n is an integer from 1 to 30, the number of friends.')
  if (!Number.isInteger(k) || k < 1 || k > 30) throw new Error('k is an integer from 1 to 30.')
  return { n, k }
}

export function buildTrace(input) {
  const { n, k } = input
  const received = Array(n).fill(0)
  received[0] = 1
  let holder = 0
  let turn = 1
  const frames = [{ phase: 'start', activeLine: L('give friend 1 the ball'), holder, turn: 0, received: [...received], message: `Friend 1 holds the ball in a circle of ${n}.` }]
  for (;;) {
    holder = (holder + turn * k) % n
    received[holder] += 1
    const repeated = received[holder] === 2
    frames.push({ phase: repeated ? 'repeat' : 'pass', activeLine: L(repeated ? 'if the new holder' : 'move the holder forward'), holder, turn, received: [...received],
      message: repeated ? `Friend ${holder + 1} gets the ball a second time, so the game ends.`
        : `Pass number ${turn} moves ${turn} times ${k} steps, reaching friend ${holder + 1}.` })
    if (repeated) break
    turn += 1
  }
  const result = []
  received.forEach((count, i) => { if (count === 0) result.push(i + 1) })
  frames.push({ phase: 'done', activeLine: L('return every friend'), holder, turn, received: [...received], message: `Friends who never got the ball: ${result.join(', ') || 'none'}.` })
  return { input, result, frames }
}

export const code = `find the losers of the circular game
  make a count of receipts for each friend, all zero
  give friend 1 the ball, so friend 1 has one receipt
  set the holder to friend 1 and the turn to 1
  repeat
    move the holder forward by turn times k around the circle
    add one receipt to the new holder
    if the new holder has now received twice then stop
    add one to the turn
  return every friend whose receipt count is zero, in order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_the_losers(n, k):
    received = [0] * n
    received[0] = 1
    holder = 0
    turn = 1
    while True:
        holder = (holder + turn * k) % n
        received[holder] += 1
        if received[holder] == 2:
            break
        turn += 1
    return [i + 1 for i in range(n) if received[i] == 0]
`
