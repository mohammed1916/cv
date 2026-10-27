import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('Use a level-order array of 1 to 15 entries with a non-null root.')
  const coins = arr.filter(v => v !== null)
  if (coins.some(v => !Number.isInteger(v) || v < 0)) throw new Error('Coin counts are non-negative integers.')
  if (coins.reduce((a, b) => a + b, 0) !== coins.length) throw new Error('The total number of coins must equal the number of nodes.')
  return arr
}

export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  let moves = 0
  const frames = [{ phase: 'start', activeLine: L('moves = 0'), node: null, excess: null, moves: 0, message: 'Each node should end with exactly one coin. Work up from the leaves and track the surplus below each node.' }]
  // Returns the surplus of coins in the subtree (coins minus nodes); each edge carries the absolute surplus of its child.
  const visit = node => {
    if (!node) return 0
    const left = visit(node.left), right = visit(node.right)
    moves += Math.abs(left) + Math.abs(right)
    const excess = node.value + left + right - 1
    frames.push({ phase: 'visit', activeLine: L('moves +='), node: node.id, excess, moves, message: `${node.value} coin(s) at ${node.value}, children carry ${left} and ${right}: ${excess >= 0 ? `${excess} extra coin(s) move up` : `${-excess} coin(s) must come up`}.` })
    return excess
  }
  visit(root)
  frames.push({ phase: 'done', activeLine: L('return moves'), node: null, excess: null, moves, message: `${moves} move(s) in total.` })
  return { input: arr, root: treeFromLevelOrder(arr), result: moves, frames }
}

export const code = `def distributeCoins(root):
    moves = 0
    def dfs(node):
        nonlocal moves
        if not node:
            return 0
        left, right = dfs(node.left), dfs(node.right)
        moves += abs(left) + abs(right)
        return node.val + left + right - 1
    dfs(root)
    return moves`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
