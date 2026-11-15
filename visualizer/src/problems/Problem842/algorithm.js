export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !/^[0-9]{1,30}$/.test(s)) throw new Error('Enter a JSON string of 1-30 digits (visualization cap: 30 digits).')
  return s
}
export function buildTrace(num) {
  const LIMIT = 2 ** 31 - 1
  const n = num.length
  const res = []
  const frames = []
  // Search tree: one node per segment tried (num[i..j]) under the call that tried it.
  const tree = [{ id: 0, parentId: null, depth: 0, decision: null, choice: 'start', subtitle: 'no numbers yet', status: 'waiting' }]
  const returnedIds = []
  let currentNode = 0
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, activeLine, pythonLine, message, res: [...res], i: -1, j: -1, nodeId: currentNode, treeCount: tree.length, returnedIds: [...returnedIds], ...extra })
  const partial = () => (res.length ? res.join(', ') : 'no numbers yet')
  const addNode = (parentId, label, decision, subtitle, pruneReason) => {
    const node = { id: tree.length, parentId, depth: tree[parentId].depth + 1, decision, choice: label, subtitle, status: 'waiting' }
    if (pruneReason) node.pruneReason = pruneReason
    tree.push(node)
    return node.id
  }
  push('start', 3, 3, `Split "${num}" into numbers with no leading zeros, each at most ${LIMIT}, where every number after the first two is the sum of the previous two.`)
  const backtrack = (i, parentId) => {
    currentNode = parentId
    if (i === n) {
      const ok = res.length >= 3
      push(ok ? 'push' : 'pop', 6, 6, ok ? `All digits consumed with ${res.length} numbers: a valid sequence.` : `All digits consumed but only ${res.length} numbers (need at least 3): this branch fails.`, { i })
      return ok
    }
    let cur = 0
    for (let j = i; j < n; j++) {
      const label = `"${num.slice(i, j + 1)}"`
      if (j > i && num[i] === '0') {
        const id = addNode(parentId, label, 'pruned', partial(), 'leading zero')
        currentNode = id
        push('reject', 9, 10, `Segment starting at ${i} begins with '0' and is longer than one digit: leading zero, stop extending.`, { i, j })
        break
      }
      cur = cur * 10 + Number(num[j])
      if (cur > LIMIT) {
        const id = addNode(parentId, label, 'pruned', partial(), 'over 2^31 - 1')
        currentNode = id
        push('reject', 11, 13, `${cur} exceeds 2^31 - 1; longer segments only grow, so stop extending.`, { i, j, cur })
        break
      }
      if (res.length >= 2) {
        const s = res[res.length - 1] + res[res.length - 2]
        if (cur < s) {
          const id = addNode(parentId, label, 'ignored', partial())
          currentNode = id
          push('reject', 14, 17, `${cur} is smaller than ${res[res.length - 2]} + ${res[res.length - 1]} = ${s}; take more digits.`, { i, j, cur })
          continue
        }
        if (cur > s) {
          const id = addNode(parentId, label, 'pruned', partial(), `larger than the required ${s}`)
          currentNode = id
          push('reject', 15, 19, `${cur} is larger than the required ${s}; longer segments only grow, so stop.`, { i, j, cur })
          break
        }
      }
      res.push(cur)
      const nodeId = addNode(parentId, label, 'chosen', partial())
      currentNode = nodeId
      push('push', 16, 20, res.length >= 3 ? `${cur} equals the sum of the previous two: accept it and continue from digit ${j + 1}.` : `Tentatively take ${cur} as number ${res.length} (the first two numbers are free choices).`, { i, j, cur })
      if (backtrack(j + 1, nodeId)) return true
      res.pop()
      tree[nodeId].status = 'returned'
      returnedIds.push(nodeId)
      currentNode = nodeId
      push('pop', 18, 23, `Dead end after ${cur}: undo it and try a longer segment.`, { i, j, cur })
    }
    return false
  }
  const found = backtrack(0, 0)
  const result = found ? [...res] : []
  currentNode = null
  push('done', 20, 26, found ? `Sequence found: [${result.join(', ')}].` : 'Every split was pruned or failed: return [].')
  return { input: num, result, frames, tree }
}
export const code = `function splitIntoFibonacci(num)
  set limit to 2^31 - 1 and res to an empty list
  call backtrack(0)
  function backtrack(i)
    if i equals the length of num then
      return true only if res has at least 3 numbers
    set cur to 0
    for each end position j from i up to the last digit
      if j > i and num[i] is '0' then stop extending (leading zero)
      set cur to cur * 10 + num[j]
      if cur > limit then stop extending (overflow)
      if res has 2 or more numbers then
        set s to the sum of the last two numbers in res
        if cur < s then continue with a longer segment
        if cur > s then stop extending (too large)
      append cur to res
      if backtrack(j + 1) returns true then return true
      remove the last number from res
    return false
  return res, or an empty list if no split was found`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def split_into_fibonacci(num):
    limit = 2 ** 31 - 1
    res = []
    def backtrack(i):
        if i == len(num):
            return len(res) >= 3
        cur = 0
        for j in range(i, len(num)):
            if j > i and num[i] == '0':
                break
            cur = cur * 10 + int(num[j])
            if cur > limit:
                break
            if len(res) >= 2:
                s = res[-1] + res[-2]
                if cur < s:
                    continue
                if cur > s:
                    break
            res.append(cur)
            if backtrack(j + 1):
                return True
            res.pop()
        return False
    backtrack(0)
    return res
`
