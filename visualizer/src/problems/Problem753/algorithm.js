export const code = `function crackSafe(n, k):
  seen = empty set of used passwords
  ans = empty list
  define dfs(prefix):
    for each digit x from 0 to k-1:
      nei = prefix followed by x
      if nei is not seen then
        mark nei as seen
        dfs(nei without its first character)
        append x to ans
  dfs(n-1 zeros)
  return ans joined, followed by n-1 zeros`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
  const frames = [{ phase: 'start', activeLine: L('seen ='), pythonLine: 2, node: '0'.repeat(n - 1), edge: null, seen: 0, total, ans: '', depth: 0, message: `Nodes are the ${k ** (n - 1)} strings of length ${n - 1}; each of the ${total} edges is one length-${n} password. An Eulerian cycle visits every edge once.` }]
  function dfs(node, depth) {
    for (let x = 0; x < k; x++) {
      const nei = node + x
      if (!seen.has(nei)) {
        seen.add(nei)
        frames.push({ phase: 'visit', activeLine: L('mark nei as seen'), pythonLine: 8, node, edge: nei, seen: seen.size, total, ans: out.join(''), depth, message: `Password "${nei}" is unused: mark it and follow it to node "${nei.slice(1) || '(empty)'}".` })
        dfs(nei.slice(1), depth + 1)
        out.push(String(x))
        frames.push({ phase: 'emit', activeLine: L('append x to ans'), pythonLine: 10, node, edge: nei, seen: seen.size, total, ans: out.join(''), depth, message: `Backtracking from "${nei}": append digit ${x} (the answer is built in reverse post-order, which keeps the walk a valid cycle).` })
      } else if (x === k - 1) {
        frames.push({ phase: 'skip', activeLine: L('if nei is not seen'), pythonLine: 7, node, edge: nei, seen: seen.size, total, ans: out.join(''), depth, message: `Node "${node || '(empty)'}": all its outgoing passwords are used.` })
      }
    }
  }
  dfs('0'.repeat(n - 1), 0)
  const result = out.join('') + '0'.repeat(n - 1)
  frames.push({ phase: 'done', activeLine: L('return ans joined'), pythonLine: 12, node: '', edge: null, seen: seen.size, total, ans: result, depth: 0, message: `Answer "${result}" has length ${result.length} = k^n + n - 1, the minimum possible.` })
  return { input: { n, k }, result, frames }
}
