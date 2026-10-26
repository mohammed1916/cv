export function parseInput(text) {
  const strs = JSON.parse(text)
  if (!Array.isArray(strs) || strs.length < 1 || strs.length > 10) throw new Error('Enter a JSON array of 1 to 10 strings (visualization cap).')
  if (strs.some(s => typeof s !== 'string' || !/^[a-z]{1,12}$/.test(s))) throw new Error('Each string must be 1 to 12 lowercase letters.')
  if (strs.some(s => s.length !== strs[0].length)) throw new Error('All strings must have the same length.')
  return strs
}

export function buildTrace(strs) {
  const n = strs.length, m = strs[0].length
  const settled = Array(Math.max(0, n - 1)).fill(false)
  const deletedCols = []
  const frames = [{ phase: 'start', activeLine: 2, col: -1, settled: [...settled], deleted: [], bad: -1, message: 'Rows are compared only through adjacent pairs. A pair is "settled" once an earlier kept column already made the upper row strictly smaller.' }]
  for (let c = 0; c < m; c++) {
    let bad = -1
    for (let i = 0; i < n - 1; i++) if (!settled[i] && strs[i][c] > strs[i + 1][c]) { bad = i; break }
    if (bad >= 0) {
      deletedCols.push(c)
      frames.push({ phase: 'delete', activeLine: 7, col: c, settled: [...settled], deleted: [...deletedCols], bad,
        message: `Column ${c}: rows ${bad} and ${bad + 1} are still tied above it but '${strs[bad][c]}' is greater than '${strs[bad + 1][c]}'. Keeping the column would break the order, so delete it.` })
      continue
    }
    const newly = []
    for (let i = 0; i < n - 1; i++) if (strs[i][c] < strs[i + 1][c] && !settled[i]) { settled[i] = true; newly.push(i) }
    frames.push({ phase: 'keep', activeLine: 11, col: c, settled: [...settled], deleted: [...deletedCols], bad: -1,
      message: `Column ${c} breaks no unsettled pair: keep it.${newly.length ? ` It settles pair(s) ${newly.map(i => `${i}-${i + 1}`).join(', ')}.` : ' No new pair becomes settled.'}` })
  }
  const result = deletedCols.length
  frames.push({ phase: 'done', activeLine: 12, col: -1, settled: [...settled], deleted: [...deletedCols], bad: -1, message: `Minimum deletions: ${result}.` })
  return { input: [...strs], result, frames }
}

export const code = `def minDeletionSize(strs):
    n, m = len(strs), len(strs[0])
    settled = [False] * (n - 1)
    deleted = 0
    for c in range(m):
        if any(not settled[i] and strs[i][c] > strs[i + 1][c] for i in range(n - 1)):
            deleted += 1
            continue
        for i in range(n - 1):
            if strs[i][c] < strs[i + 1][c]:
                settled[i] = True
    return deleted`.split('\n').map((text, index) => ({ line: index + 1, text }))
