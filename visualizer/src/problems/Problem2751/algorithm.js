export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.positions) || !Array.isArray(obj.healths) || typeof obj.directions !== 'string') throw new Error('Use an object with positions, healths and directions.')
  const { positions, healths, directions } = obj
  const n = positions.length
  if (n < 1 || n > 8) throw new Error('Use 1 to 8 robots in this visualization.')
  if (healths.length !== n || directions.length !== n) throw new Error('positions, healths and directions must have the same length.')
  if (positions.some(p => !Number.isInteger(p) || p < 1 || p > 20) || new Set(positions).size !== n) throw new Error('Positions are distinct integers from 1 to 20.')
  if (healths.some(h => !Number.isInteger(h) || h < 1 || h > 20)) throw new Error('Healths are integers from 1 to 20.')
  if (!/^[LR]+$/.test(directions)) throw new Error('Directions use L and R only.')
  return { positions, healths, directions }
}

export function buildTrace(input) {
  const { positions, directions } = input
  const h = [...input.healths]
  const n = positions.length
  const order = [...Array(n).keys()].sort((a, b) => positions[a] - positions[b])
  const stack = []
  const frames = [{ phase: 'sort', activeLine: L('sort the robots by position'), robot: -1, stack: [], healths: [...h], message: `Robots in position order: ${order.map(i => positions[i]).join(', ')}.` }]
  for (const i of order) {
    if (directions[i] === 'R') {
      stack.push(i)
      frames.push({ phase: 'right', activeLine: L('push the robot onto the stack'), robot: i, stack: [...stack], healths: [...h], message: `Robot ${i} moves right and waits on the stack.` })
      continue
    }
    while (stack.length && h[i] > 0) {
      const top = stack[stack.length - 1]
      if (h[top] > h[i]) {
        h[top] -= 1
        h[i] = 0
        frames.push({ phase: 'collide', activeLine: L('if the top robot has more health'), robot: i, stack: [...stack], healths: [...h], message: `Robot ${top} wins with ${h[top]} health; robot ${i} is destroyed.` })
      } else if (h[top] < h[i]) {
        h[top] = 0
        stack.pop()
        h[i] -= 1
        frames.push({ phase: 'collide', activeLine: L('if the top robot has more health'), robot: i, stack: [...stack], healths: [...h], message: `Robot ${i} wins with ${h[i]} health; the top robot is destroyed.` })
      } else {
        h[top] = 0
        h[i] = 0
        stack.pop()
        frames.push({ phase: 'collide', activeLine: L('otherwise remove the top robot'), robot: i, stack: [...stack], healths: [...h], message: 'Both robots have equal health and both are destroyed.' })
      }
    }
  }
  const result = h.filter(x => x > 0)
  frames.push({ phase: 'done', activeLine: L('return the healths'), robot: -1, stack: [...stack], healths: [...h], message: `Surviving healths: ${result.join(', ') || 'none'}.` })
  return { input, result, frames }
}

export const code = `robot collisions with a stack
  sort the robots by position
  set stack to an empty list of right-moving robots
  for each robot i in that order do
    if robot i moves right then
      push the robot onto the stack
    otherwise
      while the stack is not empty and robot i is alive do
        if the top robot has more health then
          reduce the top robot's health by one and mark robot i dead
        else if the top robot has less health then
          remove the top robot and reduce robot i's health by one
        otherwise remove the top robot and mark robot i dead
  return the healths of surviving robots in their original order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def robot_collisions(positions, healths, directions):
    n = len(positions)
    h = list(healths)
    order = sorted(range(n), key=lambda i: positions[i])
    stack = []
    for i in order:
        if directions[i] == 'R':
            stack.append(i)
            continue
        while stack and h[i] > 0:
            top = stack[-1]
            if h[top] > h[i]:
                h[top] -= 1
                h[i] = 0
            elif h[top] < h[i]:
                h[top] = 0
                stack.pop()
                h[i] -= 1
            else:
                h[top] = 0
                h[i] = 0
                stack.pop()
    return [x for x in h if x > 0]
`
