export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use {"nums": [...]} with an array of integers.')
  const { nums } = data
  if (nums.length < 1 || nums.length > 8) throw new Error('nums must have 1 to 8 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('nums entries are integers from 0 to 20.')
  return { nums }
}

const isSquare = s => Number.isInteger(Math.sqrt(s))

export function buildTrace(input) {
  const sorted = [...input.nums].sort((a, b) => a - b)
  const n = sorted.length
  const used = Array(n).fill(false)
  const sequence = []
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('sort nums'), pythonLine: P('nums = sorted(nums)'), index: null, sequence: [], used: [...used], count, result: null, nodeId: null, treeCount: 0, message: `Sort the values to ${sorted.join(', ')}. Equal values are interchangeable, so each repeated value is tried once per position.` }]
  const PY = { complete: P('count += 1'), duplicate: P('if i > 0 and nums[i] == nums[i - 1]'), reject: P('if seq and not is_square'), place: P('used[i] = True') }
  // Search tree: one node per call of backtrack (the root is the empty arrangement) and one node per value tried there.
  const tree = []
  let activeNode = 0
  const addNode = (parentId, choice, decision, subtitle, pruneReason = undefined) => {
    const id = tree.length
    const depth = parentId === null ? 0 : tree[parentId].depth + 1
    tree.push({ id, parentId, title: `call ${id}`, choice, decision, subtitle, pruneReason, depth, children: [] })
    if (parentId !== null) tree[parentId].children.push(id)
    return id
  }
  const arrangementText = () => `[${sequence.join(', ')}]`
  const snapshot = (phase, activeLine, index, message, result = null) => frames.push({ phase, activeLine: L(activeLine), pythonLine: PY[phase], index, sequence: [...sequence], used: [...used], count, result, message, nodeId: activeNode, treeCount: tree.length })
  const backtrack = (nodeId) => {
    activeNode = nodeId
    if (sequence.length === n) {
      count++
      snapshot('complete', 'add 1 to count', null, `A full arrangement [${sequence.join(', ')}] is squareful. Total so far: ${count}.`)
      return
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue
      const label = `place ${sorted[i]} (index ${i})`
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) {
        addNode(nodeId, label, 'pruned', `arrangement ${arrangementText()}`, `repeats value ${sorted[i]}`)
        activeNode = nodeId
        snapshot('duplicate', 'if i > 0 and nums[i] equals nums[i - 1]', i, `Value ${sorted[i]} at index ${i} repeats an unused value just before it, so this arrangement was already tried.`)
        continue
      }
      const prev = sequence.at(-1)
      if (prev !== undefined && !isSquare(prev + sorted[i])) {
        addNode(nodeId, label, 'pruned', `arrangement ${arrangementText()}`, `${prev} + ${sorted[i]} = ${prev + sorted[i]} is not square`)
        activeNode = nodeId
        snapshot('reject', 'is not a perfect square', i, `${prev} + ${sorted[i]} = ${prev + sorted[i]} is not a perfect square. Skip ${sorted[i]} here.`)
        continue
      }
      used[i] = true
      sequence.push(sorted[i])
      const child = addNode(nodeId, label, 'chosen', `arrangement ${arrangementText()}`)
      activeNode = child
      snapshot('place', 'mark index i as used', i, prev === undefined ? `Start the arrangement with ${sorted[i]}.` : `${prev} + ${sorted[i]} = ${prev + sorted[i]} is a perfect square. Place ${sorted[i]}.`)
      backtrack(child)
      sequence.pop()
      used[i] = false
      activeNode = nodeId
    }
  }
  backtrack(addNode(null, 'start: empty arrangement', 'chosen', 'arrangement []'))
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), index: null, sequence: [], used: [...used], count, result: count, message: `Distinct squareful arrangements: ${count}.`, nodeId: null, treeCount: tree.length })
  return { input, result: count, frames, tree }
}

export const code = `squareful arrangements (nums):
  sort nums so equal values sit together
  set n to the number of values
  mark every index as unused
  set count to 0
  build(an empty arrangement)
  return count

build(arrangement):
  if the arrangement holds all n values then
    add 1 to count
    stop this branch
  for each index i from 0 to n - 1:
    if index i is used then skip it
    if i > 0 and nums[i] equals nums[i - 1] and nums[i - 1] is unused then skip it
    if the arrangement is not empty and its last value plus nums[i] is not a perfect square then skip it
    mark index i as used and append nums[i] to the arrangement
    build(arrangement)
    remove the last value from the arrangement and mark index i unused`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `from math import isqrt

def is_square(n):
    return isqrt(n) ** 2 == n

def num_squareful_perms(nums):
    nums = sorted(nums)
    n = len(nums)
    used = [False] * n
    seq = []
    count = 0
    def backtrack():
        nonlocal count
        if len(seq) == n:
            count += 1
            return
        for i in range(n):
            if used[i]:
                continue
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue
            if seq and not is_square(seq[-1] + nums[i]):
                continue
            used[i] = True
            seq.append(nums[i])
            backtrack()
            seq.pop()
            used[i] = False
    backtrack()
    return count
`
