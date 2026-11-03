export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('n is an integer order from 1 to 100. Order zero is empty, so it has no root to remove.')
  return { n }
}

export function buildTrace({ n }) {
  const frames = []
  const branch = [0]
  frames.push({
    pythonLine: P('branch = [0]'), phase: 'start', activeLine: L('set branch to'), order: 0, value: null, branch: [...branch],
    message: 'An empty tree of order zero adds no branch, so branch[0] is 0.',
  })
  let value = 0
  for (let order = 1; order <= n; order += 1) {
    const left = order >= 2 ? branch[order - 2] : 0
    const right = order >= 2 ? branch[order - 1] : 0
    if (order === 1) {
      value = 0
      frames.push({
        pythonLine: P('if order == 1'), phase: 'order', activeLine: L('if order is 1'), order, value, branch: [...branch], left, right,
        message: 'Order 1 is a single node with no child branches, so its value is 0.',
      })
    } else {
      value = left ^ right
      frames.push({
        pythonLine: P('value = branch'), phase: 'order', activeLine: L('otherwise set value'), order, value, branch: [...branch], left, right,
        message: `Order ${order} has children of orders ${order - 2} and ${order - 1} with branch values ${left} and ${right}. Their XOR is ${value}.`,
      })
    }
    branch.push(value + 1)
    frames.push({
      pythonLine: P('branch.append'), phase: 'branch', activeLine: L('append value plus 1'), order, value, branch: [...branch], left, right,
      message: `The branch from the parent of order ${order} has value ${value} plus 1, which is ${value + 1}.`,
    })
  }
  const aliceWins = value !== 0
  frames.push({
    pythonLine: P('return value != 0'), phase: 'done', activeLine: L('return value is not 0'), order: n, value, branch: [...branch], left: null, right: null,
    message: aliceWins ? `The value of order ${n} is ${value}, which is not 0. Alice wins.` : `The value of order ${n} is 0. Bob wins.`,
  })
  return { input: { n }, result: aliceWins, frames }
}

export const code = `Alice wins on the Fibonacci tree of order n
  set branch to [0] because an empty tree adds no branch
  for each order from 1 to n
    if order is 1 then the value is 0 because there are no children
    otherwise set value to branch[order minus 2] xor branch[order minus 1]
    append value plus 1 to branch
  return value is not 0`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return i + 1
}

export const python = `def alice_wins(n):
    branch = [0]
    for order in range(1, n + 1):
        if order == 1:
            value = 0
        else:
            value = branch[order - 2] ^ branch[order - 1]
        branch.append(value + 1)
    return value != 0
`
const pyLines = python.split('\n')
function P(s) {
  const i = pyLines.findIndex(c => c.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
