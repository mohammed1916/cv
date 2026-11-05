export const phases = [
  { id: 'start', label: 'Locate 1', description: 'Only subtrees containing the value 1 can miss a value other than 1, so find the node holding 1.' },
  { id: 'climb', label: 'Climb the path', description: 'Walk from that node up to the root; every node on this path contains the value 1 in its subtree.' },
  { id: 'missing', label: 'Smallest missing', description: 'For each node on the path, collect its subtree values and find the smallest positive value not among them.' },
  { id: 'done', label: 'Result', description: 'Nodes off the path have no 1, so their answer is 1.' },
]

export const code = `function smallestMissingGeneticValues(parents, nums) {
  const n = parents.length
  const ans = new Array(n).fill(1)
  const children = Array.from({ length: n }, () => [])
  parents.forEach((p, i) => { if (p !== -1) children[p].push(i) })
  const start = nums.indexOf(1)
  if (start === -1) return ans
  const subtreeValues = node => {
    const values = new Set()
    const stack = [node]
    while (stack.length) {
      const v = stack.pop()
      values.add(nums[v])
      stack.push(...children[v])
    }
    return values
  }
  for (let node = start; node !== -1; node = parents[node]) {
    const values = subtreeValues(node)
    let missing = 1
    while (values.has(missing)) missing++
    ans[node] = missing
  }
  return ans
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def smallest_missing_genetic_values(parents, nums):
    n = len(parents)
    ans = [1] * n
    children = [[] for _ in range(n)]
    for i, p in enumerate(parents):
        if p != -1:
            children[p].append(i)
    start = nums.index(1) if 1 in nums else -1
    if start == -1:
        return ans
    def subtree_values(node):
        values = set()
        stack = [node]
        while stack:
            v = stack.pop()
            values.add(nums[v])
            stack.extend(children[v])
        return values
    node = start
    while node != -1:
        values = subtree_values(node)
        missing = 1
        while missing in values:
            missing += 1
        ans[node] = missing
        node = parents[node]
    return ans
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"parents":[-1,0,0],"nums":[2,3,1]}.') }
  const { parents, nums } = obj || {}
  if (!Array.isArray(parents) || !Array.isArray(nums) || parents.length < 1 || parents.length > 12 || parents.length !== nums.length) {
    throw new Error('parents and nums must have the same length, from 1 to 12.')
  }
  if (parents[0] !== -1) throw new Error('Node 0 is the root, so parents[0] must be -1.')
  if (new Set(nums).size !== nums.length || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100000)) {
    throw new Error('Genetic values must be distinct whole numbers from 1 to 100000.')
  }
  for (let i = 1; i < parents.length; i++) {
    if (!Number.isInteger(parents[i]) || parents[i] < 0 || parents[i] >= parents.length) throw new Error('Each parent must be a node from 0 to n - 1.')
    let p = parents[i], steps = 0
    while (p !== -1 && steps <= parents.length) { p = parents[p]; steps++ }
    if (p !== -1) throw new Error('The parents must form a tree rooted at 0.')
  }
  return { parents, nums }
}

export function buildTrace({ parents, nums }) {
  const frames = []
  const n = parents.length
  const ans = new Array(n).fill(1)
  const children = Array.from({ length: n }, () => [])
  parents.forEach((p, i) => { if (p !== -1) children[p].push(i) })
  const subtreeValues = node => {
    const values = new Set()
    const stack = [node]
    while (stack.length) {
      const v = stack.pop()
      values.add(nums[v])
      stack.push(...children[v])
    }
    return values
  }
  const add = (phase, c, p, message, node) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { parents, nums, node, ans: ans.slice(), path: pathOf(node) },
  })
  const pathOf = node => {
    const out = []
    for (let v = node; v !== -1 && v !== undefined; v = parents[v]) out.push(v)
    return out
  }
  const start = nums.indexOf(1)
  add('start', 'const start = nums.indexOf', 'start = nums.index', start === -1 ? 'No node holds 1, so every answer is 1.' : `Node ${start} holds the value 1.`, start)
  if (start !== -1) {
    for (let node = start; node !== -1; node = parents[node]) {
      add('climb', 'for (let node = start', 'node = start', `Node ${node} is on the path to the root.`, node)
      const values = subtreeValues(node)
      let missing = 1
      while (values.has(missing)) missing++
      ans[node] = missing
      add('missing', 'while (values.has(missing))', 'while missing in values', `Subtree of ${node} has values ${[...values].sort((a, b) => a - b).join(', ')}; the smallest missing is ${missing}.`, node)
    }
  }
  add('done', 'return ans', 'return ans', `Answers: ${ans.join(', ')}.`, -1)
  return { input: { parents, nums }, result: ans, frames }
}
