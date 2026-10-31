export const code = `function loudAndRich(richer, quiet)
  let n be the number of people
  build g, where g[b] lists everyone directly richer than b
  set ans[x] to -1 (unknown) for every person x
  define dfs(x)
    if ans[x] is already known, then reuse it and stop
    set ans[x] to x
    for each directly richer neighbour y in g[x]
      let c be dfs(y)
      if quiet[c] is less than quiet[ans[x]] then
        set ans[x] to c
    return ans[x]
  for i from 0 to n - 1
    call dfs(i)
  return the array ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def loud_and_rich(richer, quiet):
    n = len(quiet)
    g = [[] for _ in range(n)]
    for a, b in richer:
        g[b].append(a)
    ans = [-1] * n
    def dfs(x):
        if ans[x] != -1:
            return ans[x]
        ans[x] = x
        for y in g[x]:
            c = dfs(y)
            if quiet[c] < quiet[ans[x]]:
                ans[x] = c
        return ans[x]
    for i in range(n):
        dfs(i)
    return ans
`

const L = (s) => code.findIndex((c) => c.text.includes(s)) + 1

export function parseInput(text) {
  let v
  try { v = JSON.parse(text) } catch { throw new Error('Input must be valid JSON: {"richer": [[a,b],...], "quiet": [...]}') }
  if (!v || typeof v !== 'object' || !Array.isArray(v.richer) || !Array.isArray(v.quiet)) throw new Error('Input must be an object with "richer" and "quiet" arrays.')
  const { richer, quiet } = v
  const n = quiet.length
  if (n < 1 || n > 20) throw new Error('quiet must have 1 to 20 people (visualization cap).')
  if (richer.length > 40) throw new Error('richer may have at most 40 pairs (visualization cap).')
  if (!quiet.every((q) => Number.isInteger(q) && q >= 0 && q < 1000)) throw new Error('quiet values must be integers in [0, 999].')
  if (new Set(quiet).size !== n) throw new Error('quiet values must be distinct.')
  for (const p of richer) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every((x) => Number.isInteger(x) && x >= 0 && x < n)) throw new Error('Each richer pair must be [a, b] with people in [0, n-1].')
    if (p[0] === p[1]) throw new Error('A person cannot be richer than themselves.')
  }
  const indeg = Array(n).fill(0); const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of richer) { adj[a].push(b); indeg[b]++ }
  const q = []; indeg.forEach((d, i) => { if (!d) q.push(i) })
  let seen = 0
  while (q.length) { const x = q.pop(); seen++; for (const y of adj[x]) if (--indeg[y] === 0) q.push(y) }
  if (seen !== n) throw new Error('richer must be logically consistent (no cycles).')
  return { richer: richer.map((p) => [...p]), quiet: [...quiet] }
}

export function buildTrace({ richer, quiet }) {
  const n = quiet.length
  const g = Array.from({ length: n }, () => [])
  for (const [a, b] of richer) g[b].push(a)
  const ans = Array(n).fill(-1)
  const path = []
  const frames = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, ans: [...ans], path: [...path], x: null, cand: null, ...extra })
  push('start', L('build g'),`Build g so g[b] lists everyone directly richer than b. ans is -1 (unknown) for all ${n} people.`, { pythonLine: 6 })
  const dfs = (x) => {
    path.push(x)
    push('visit', L('define dfs'),`dfs(${x}): ask for the quietest person at least as rich as ${x}.`, { pythonLine: 8, x })
    if (ans[x] !== -1) {
      push('memo', L('if ans[x]'), `ans[${x}] is already ${ans[x]}, so reuse it without searching again.`, { pythonLine: 9, x, cand: ans[x] })
      path.pop()
      return ans[x]
    }
    ans[x] = x
    push('visit', L('set ans[x] to x'),`Person ${x} is at least as rich as themselves, so start with candidate ${x} (quiet ${quiet[x]}).`, { pythonLine: 10, x, cand: x })
    for (const y of g[x]) {
      const c = dfs(y)
      const better = quiet[c] < quiet[ans[x]]
      push('compare', L('if quiet'), `Richer person ${y} offers ${c} (quiet ${quiet[c]}) versus current ${ans[x]} (quiet ${quiet[ans[x]]}): ${better ? 'quieter, so replace' : 'not quieter, keep'}.`, { pythonLine: 13, x, cand: c })
      if (better) {
        ans[x] = c
        push('update', L('set ans[x] to c'),`ans[${x}] becomes ${c}. Everyone richer than ${y} is also richer than ${x}, so the answer is inherited.`, { pythonLine: 14, x, cand: c })
      }
    }
    push('visit', L('return ans[x]'), `All richer neighbours of ${x} are checked; ans[${x}] = ${ans[x]}.`, { pythonLine: 15, x, cand: ans[x] })
    path.pop()
    return ans[x]
  }
  for (let i = 0; i < n; i++) {
    push('visit', L('for i from 0'),`Outer loop: make sure person ${i} is resolved.`, { pythonLine: 16, x: i })
    dfs(i)
  }
  push('done', L('return the array ans'),`Done: answer = [${ans.join(', ')}].`, { pythonLine: 18 })
  return { input: { richer, quiet }, result: [...ans], frames }
}
