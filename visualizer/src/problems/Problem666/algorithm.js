export function parseInput(text) {
  const items = JSON.parse(text)
  if (!Array.isArray(items) || items.length < 1 || items.length > 15 || items.some(s => typeof s !== 'string' || !/^[1-4][1-8][0-9]$/.test(s))) throw new Error('Enter 1–15 strings of three digits: depth 1–4, position 1–8, value 0–9.')
  const keys = new Set()
  for (const s of items) {
    const depth = Number(s[0]), pos = Number(s[1])
    if (pos > 2 ** (depth - 1)) throw new Error(`Position ${pos} is too large for depth ${depth}.`)
    if (keys.has(`${depth}-${pos}`)) throw new Error(`Depth ${depth}, position ${pos} appears twice.`)
    keys.add(`${depth}-${pos}`)
  }
  if (!keys.has('1-1')) throw new Error('The root (depth 1, position 1) is missing.')
  for (const key of keys) {
    const [depth, pos] = key.split('-').map(Number)
    if (depth > 1 && !keys.has(`${depth - 1}-${Math.ceil(pos / 2)}`)) throw new Error('A node has a missing parent.')
  }
  return items
}

// Read the digits of each three-digit string as depth, position and value. Walk from the root: a node's
// children sit at positions 2p−1 (left) and 2p (right) on the next depth. Add up each root-to-leaf number.
export function buildTrace(items) {
  const values = new Map(items.map(s => [`${s[0]}-${s[1]}`, Number(s[2])]))
  let total = 0
  const frames = [{ phase: 'start', path: [], total, leaves: [], activeLine: L('const values = new Map'), pythonLine: P('values = {}'), message: 'Store each node by depth and position, then walk down from the root.' }]
  const leaves = []
  const dfs = (depth, pos, acc) => {
    const key = `${depth}-${pos}`
    const here = acc * 10 + values.get(key)
    const left = values.has(`${depth + 1}-${2 * pos - 1}`), right = values.has(`${depth + 1}-${2 * pos}`)
    frames.push({ phase: 'visit', path: [key], total, leaves: [...leaves], value: here, activeLine: L('const here = '), pythonLine: P('here = acc'), message: `Visit ${key}: the number so far is ${here}.` })
    if (!left && !right) {
      total += here
      leaves.push(here)
      frames.push({ phase: 'leaf', path: [key], total, leaves: [...leaves], value: here, activeLine: L('total += here'), pythonLine: P('total += here'), message: `Leaf ${here}: add it to the total, now ${total}.` })
      return
    }
    if (left) dfs(depth + 1, 2 * pos - 1, here)
    if (right) dfs(depth + 1, 2 * pos, here)
  }
  dfs(1, 1, 0)
  frames.push({ phase: 'done', path: [], total, leaves: [...leaves], result: total, activeLine: L('return total'), pythonLine: P('return total'), message: `Sum of root-to-leaf numbers: ${total}.` })
  return { input: items, result: total, frames }
}

const SOURCE = `function pathSum(nums) {
  const values = new Map(nums.map(s => [\`\${s[0]}-\${s[1]}\`, Number(s[2])]))
  let total = 0
  const dfs = (depth, pos, acc) => {
    const here = acc * 10 + values.get(\`\${depth}-\${pos}\`)
    const left = values.has(\`\${depth + 1}-\${2 * pos - 1}\`)
    const right = values.has(\`\${depth + 1}-\${2 * pos}\`)
    if (!left && !right) {
      total += here
      return
    }
    if (left) dfs(depth + 1, 2 * pos - 1, here)
    if (right) dfs(depth + 1, 2 * pos, here)
  }
  dfs(1, 1, 0)
  return total
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def path_sum(nums):
    values = {}
    for s in nums:
        values[(int(s[0]), int(s[1]))] = int(s[2])
    total = 0

    def dfs(depth, pos, acc):
        nonlocal total
        here = acc * 10 + values[(depth, pos)]
        left = (depth + 1, 2 * pos - 1) in values
        right = (depth + 1, 2 * pos) in values
        if not left and not right:
            total += here
            return
        if left:
            dfs(depth + 1, 2 * pos - 1, here)
        if right:
            dfs(depth + 1, 2 * pos, here)

    dfs(1, 1, 0)
    return total`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
