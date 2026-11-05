import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 25 || values.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 2147483647))) throw new Error('Enter a level-order array of up to 25 items: integers from 0 to 2^31 − 1 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  const root = treeFromLevelOrder(values)
  const check = node => {
    if (!node) return true
    for (const child of [node.left, node.right]) {
      if (child && child.value < node.value) return false
      if (!check(child)) return false
    }
    return true
  }
  if (!check(root)) throw new Error('Every parent must hold the smaller of its two children values.')
  return values
}

// Every parent is the minimum of its subtree, so the root holds the overall minimum. The second minimum is
// the smallest value above the root. A value above the root hides everything below it, so stop there.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const first = root.value
  let second = -1
  const frames = [{ phase: 'start', node: null, first, second, activeLine: L('const first = root.val'), pythonLine: P('first = root["val"]'), message: `The root ${first} is the smallest value. Look for the next distinct value.` }]
  const dfs = node => {
    if (!node) return
    if (node.value > first) {
      if (second === -1 || node.value < second) second = node.value
      frames.push({ phase: 'candidate', node: node.id, first, second, activeLine: L('if (node.val > first)'), pythonLine: P('if node["val"] > first'), message: `${node.value} is above ${first}: a candidate. Its subtree cannot hold anything smaller, so stop here.` })
      return
    }
    frames.push({ phase: 'visit', node: node.id, first, second, activeLine: L('if (!node) return'), pythonLine: P('if node is None'), message: `${node.value} equals the minimum ${first}: keep looking below it.` })
    dfs(node.left)
    dfs(node.right)
  }
  dfs(root)
  frames.push({ phase: 'done', node: null, first, second, result: second, activeLine: L('return second'), pythonLine: P('return second'), message: second === -1 ? 'No value above the minimum: return -1.' : `Second minimum: ${second}.` })
  return { input: values, root, result: second, frames }
}

const SOURCE = `function findSecondMinimumValue(root) {
  const first = root.val
  let second = -1
  const dfs = node => {
    if (!node) return
    if (node.val > first) {
      if (second === -1 || node.val < second) second = node.val
      return
    }
    dfs(node.left)
    dfs(node.right)
  }
  dfs(root)
  return second
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_second_minimum_value(root):
    first = root["val"]
    second = -1

    def dfs(node):
        nonlocal second
        if node is None:
            return
        if node["val"] > first:
            if second == -1 or node["val"] < second:
                second = node["val"]
            return
        dfs(node["left"])
        dfs(node["right"])

    dfs(root)
    return second`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
