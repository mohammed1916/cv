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
  const frames = [{ phase: 'start', activeLine: L('set moves to 0'), pythonLine: 26, node: null, excess: null, moves: 0, message: 'Each node should end with exactly one coin. Work up from the leaves and track the surplus below each node.' }]
  // Returns the surplus of coins in the subtree (coins minus nodes); each edge carries the absolute surplus of its child.
  const visit = node => {
    if (!node) return 0
    const left = visit(node.left), right = visit(node.right)
    moves += Math.abs(left) + Math.abs(right)
    const excess = node.value + left + right - 1
    frames.push({ phase: 'visit', activeLine: L('add |left| plus |right| to moves'), pythonLine: 32, node: node.id, excess, moves, message: `${node.value} coin(s) at ${node.value}, children carry ${left} and ${right}: ${excess >= 0 ? `${excess} extra coin(s) move up` : `${-excess} coin(s) must come up`}.` })
    return excess
  }
  visit(root)
  frames.push({ phase: 'done', activeLine: L('return moves'), pythonLine: 35, node: null, excess: null, moves, message: `${moves} move(s) in total.` })
  return { input: arr, root: treeFromLevelOrder(arr), result: moves, frames }
}

export const code = `distributeCoins(root) returns the fewest moves so that every node holds one coin
  set moves to 0
  dfs(node) returns the surplus of coins in its subtree (coins minus nodes)
    if node is empty, then return 0
    set left and right to dfs(left child) and dfs(right child)
    add |left| plus |right| to moves
    return node.coins plus left plus right minus 1
  dfs(root)
  return moves`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(arr) and arr[cursor] is not None:
            node.left = TreeNode(arr[cursor])
            queue.append(node.left)
        cursor += 1
        if cursor < len(arr) and arr[cursor] is not None:
            node.right = TreeNode(arr[cursor])
            queue.append(node.right)
        cursor += 1
    return root

def distribute_coins(arr):
    root = build(arr)
    moves = 0
    def dfs(node):
        nonlocal moves
        if not node:
            return 0
        left, right = dfs(node.left), dfs(node.right)
        moves += abs(left) + abs(right)
        return node.val + left + right - 1
    dfs(root)
    return moves`
