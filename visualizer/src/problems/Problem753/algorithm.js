export const code = `function crackSafe(n, k) {
  const seen = new Set() // seen = the passwords used so far
  const ans = []
  function dfs(prefix) {
    for (let x = 0; x < k; x++) {
      const nei = prefix + x
      if (!seen.has(nei)) { // if nei is not seen
        seen.add(nei) // mark nei as seen
        dfs(nei.slice(1))
        ans.push(x) // append x to ans
      }
    }
  }
  dfs('0'.repeat(n - 1))
  return ans.join('') + '0'.repeat(n - 1) // return ans joined, then the zeros
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def crack_safe(n, k):
    seen = set()
    ans = []
    def dfs(prefix):
        for x in range(k):
            nei = prefix + str(x)
            if nei not in seen:
                seen.add(nei)
                dfs(nei[1:])
                ans.append(str(x))
    dfs("0" * (n - 1))
    return "".join(ans) + "0" * (n - 1)`

export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || !Number.isInteger(v.n) || !Number.isInteger(v.k)) throw new Error('Enter JSON like {"n": 2, "k": 2}.')
  if (v.n < 1 || v.n > 4 || v.k < 1 || v.k > 10 || v.k ** v.n > 4096) throw new Error('Need 1 <= n <= 4, 1 <= k <= 10 and k^n <= 4096.')
  if (v.k ** v.n > 500) throw new Error('Visualization cap: k^n must be at most 500.')
  return { n: v.n, k: v.k }
}

export function buildTrace({ n, k }) {
  const total = k ** n
  const seen = new Set()
  const out = []
  const tree = []
  const newNode = (parentId, fields) => {
    const id = tree.length
    tree.push({ id, parentId, depth: parentId == null ? 0 : tree[parentId].depth + 1, children: [], ...fields })
    if (parentId != null) tree[parentId].children.push(id)
    return id
  }
  const rootId = newNode(null, { decision: 'chosen', choice: 'start', node: '0'.repeat(n - 1), edge: null, subtitle: 'answer so far: (none)' })
  const frames = [{ phase: 'start', activeLine: L('seen ='), pythonLine: 2, node: '0'.repeat(n - 1), edge: null, seen: 0, total, ans: '', depth: 0, activeNodeId: rootId, message: `Nodes are the ${k ** (n - 1)} strings of length ${n - 1}; each of the ${total} edges is one length-${n} password. An Eulerian cycle visits every edge once.` }]
  function dfs(node, depth, callId) {
    for (let x = 0; x < k; x++) {
      const nei = node + x
      if (!seen.has(nei)) {
        seen.add(nei)
        const childId = newNode(callId, { decision: 'chosen', choice: `take ${x}`, node, edge: nei, subtitle: `answer so far: ${out.join('') || '(none)'}` })
        frames.push({ phase: 'visit', activeLine: L('mark nei as seen'), pythonLine: 8, node, edge: nei, seen: seen.size, total, ans: out.join(''), depth, activeNodeId: childId, message: `Password "${nei}" is unused: mark it and follow it to node "${nei.slice(1) || '(empty)'}".` })
        dfs(nei.slice(1), depth + 1, childId)
        out.push(String(x))
        tree[childId].subtitle = `answer so far: ${out.join('')}`
        frames.push({ phase: 'emit', activeLine: L('append x to ans'), pythonLine: 10, node, edge: nei, seen: seen.size, total, ans: out.join(''), depth, activeNodeId: childId, message: `Backtracking from "${nei}": append digit ${x} (the answer is built in reverse post-order, which keeps the walk a valid cycle).` })
      } else {
        newNode(callId, { decision: 'pruned', pruneReason: 'password already used', choice: `skip ${x}`, node, edge: nei, subtitle: `answer so far: ${out.join('') || '(none)'}` })
        if (x === k - 1) frames.push({ phase: 'skip', activeLine: L('if nei is not seen'), pythonLine: 7, node, edge: nei, seen: seen.size, total, ans: out.join(''), depth, activeNodeId: callId, message: `Node "${node || '(empty)'}": all its outgoing passwords are used.` })
      }
    }
  }
  dfs('0'.repeat(n - 1), 0, rootId)
  const result = out.join('') + '0'.repeat(n - 1)
  frames.push({ phase: 'done', activeLine: L('return ans joined'), pythonLine: 12, node: '', edge: null, seen: seen.size, total, ans: result, depth: 0, activeNodeId: null, message: `Answer "${result}" has length ${result.length} = k^n + n - 1, the minimum possible.` })
  return { input: { n, k }, result, frames, tree }
}
