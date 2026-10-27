export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and k.')
  const { n, k } = data
  if (!Number.isInteger(n) || n < 2 || n > 100) throw new Error('n is an integer from 2 to 100, the number of children.')
  if (!Number.isInteger(k) || k < 1 || k > 200) throw new Error('k is an integer from 1 to 200 seconds.')
  return { n, k }
}

export function buildTrace(input) {
  const { n, k } = input
  let child = 0
  let direction = 1
  const frames = [{ phase: 'start', activeLine: L('set child to 0'), child, direction, second: 0, message: `Child 0 starts with the ball, passing toward the right.` }]
  for (let second = 1; second <= k; second++) {
    child += direction
    const turned = child === 0 || child === n - 1
    if (turned) direction = -direction
    frames.push({ phase: turned ? 'turn' : 'pass', activeLine: L(turned ? 'reverse the direction' : 'move the ball'), child, direction, second,
      message: `Second ${second}: the ball is with child ${child}.${turned ? ' It reached an end, so the direction reverses.' : ''}` })
  }
  frames.push({ phase: 'done', activeLine: L('return child'), child, direction, second: k, message: `After ${k} seconds, child ${child} holds the ball.` })
  return { input, result: child, frames }
}

export const code = `find the child holding the ball after k seconds
  set child to 0 and direction to 1
  repeat k times
    move the ball one child in the direction
    if the ball reached the first or last child then reverse the direction
  return child`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def ball_holder(n, k):
    child = 0
    direction = 1
    for _ in range(k):
        child += direction
        if child == 0 or child == n - 1:
            direction = -direction
    return child
`
