export function parseInput(text) {
  const board = JSON.parse(text)
  const n = Array.isArray(board) ? board.length : 0
  if (n < 2 || n > 20 || board.some(r => !Array.isArray(r) || r.length !== n || r.some(x => x !== 0 && x !== 1))) throw new Error('Enter an n x n JSON grid of 0s and 1s with 2 <= n <= 20 (visualization cap: n = 20).')
  return board
}
const bits = (m, n) => Array.from({ length: n }, (_, j) => (m >> j) & 1).join('')
const popcount = m => { let c = 0; while (m) { c += m & 1; m >>= 1 } return c }

export function buildTrace(board) {
  const n = board.length
  const full = (1 << n) - 1
  const rows = board.map(r => r.reduce((m, v, j) => m | (v << j), 0))
  const cols = Array.from({ length: n }, (_, j) => board.reduce((m, r, i) => m | (r[j] << i), 0))
  const frames = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, axis: '', index: -1, kinds: [], ...extra })
  push('start', 4, `Swapping rows never changes which two row patterns exist, and likewise for columns. So treat each row as an ${n}-bit mask (and each column), then solve rows and columns separately.`, { rows: rows.map(m => bits(m, n)), cols: cols.map(m => bits(m, n)) })

  function solve(axis, masks) {
    const first = masks[0]
    const other = full ^ first
    const kinds = []
    for (let i = 0; i < n; i++) {
      const m = masks[i]
      if (m === first) kinds.push('A')
      else if (m === other) kinds.push('B')
      else {
        kinds.push('X')
        push('classify', 11, `${axis} ${i} is ${bits(m, n)}: it is neither ${bits(first, n)} nor its complement ${bits(other, n)}. Impossible.`, { axis, index: i, kinds: [...kinds], masks: masks.map(x => bits(x, n)) })
        return -1
      }
      push('classify', 10, `${axis} ${i} = ${bits(m, n)} is ${kinds[i] === 'A' ? 'the same as' : 'the complement of'} ${axis} 0.`, { axis, index: i, kinds: [...kinds], masks: masks.map(x => bits(x, n)) })
    }
    const ones = popcount(first)
    if (Math.abs(ones - (n - ones)) > 1) {
      push('balance', 14, `${axis} 0 has ${ones} ones and ${n - ones} zeros: in a chessboard they differ by at most 1. Impossible.`, { axis, kinds, masks: masks.map(x => bits(x, n)) })
      return -1
    }
    const lead = kinds.map(k => (k === 'A' ? 1 : 0))
    const cnt = lead.reduce((a, b) => a + b, 0)
    if (Math.abs(cnt - (n - cnt)) > 1) {
      push('balance', 18, `Only ${cnt} of ${n} ${axis}s equal ${axis} 0 (the rest are complements): the two kinds must differ in count by at most 1. Impossible.`, { axis, kinds, masks: masks.map(x => bits(x, n)) })
      return -1
    }
    push('balance', 18, `${axis} 0 is balanced (${ones} ones) and the two kinds appear ${cnt} and ${n - cnt} times: a chessboard layout is possible.`, { axis, kinds, masks: masks.map(x => bits(x, n)) })
    let best = -1
    const notes = []
    for (const s of [0, 1]) {
      const target = Array.from({ length: n }, (_, i) => (i % 2 === s ? 1 : 0))
      if (target.reduce((a, b) => a + b, 0) !== cnt) continue
      const d = lead.reduce((a, v, i) => a + (v !== target[i] ? 1 : 0), 0) / 2
      notes.push(`pattern ${target.join('')} needs ${d} swap${d === 1 ? '' : 's'}`)
      if (best === -1 || d < best) best = d
    }
    push('moves', 25, `Kinds in order: ${lead.join('')}. Target alternations: ${notes.join('; ')}. Each swap fixes two misplaced ${axis}s, so ${axis} swaps = ${best}.`, { axis, kinds, masks: masks.map(x => bits(x, n)), moves: best })
    return best
  }
  const r = solve('row', rows)
  let c = -1
  if (r >= 0) c = solve('column', cols)
  const result = r < 0 || c < 0 ? -1 : r + c
  push('done', 31, result < 0 ? 'A chessboard cannot be formed: return -1.' : `Row swaps ${r} + column swaps ${c} = ${result}.`, { moves: result })
  return { input: board, result, frames }
}
export const code = `def movesToChessboard(board):
    n = len(board)
    full = (1 << n) - 1
    rows = [sum(board[i][j] << j for j in range(n)) for i in range(n)]
    cols = [sum(board[i][j] << i for i in range(n)) for j in range(n)]

    def solve(masks):
        first = masks[0]
        other = full ^ first
        for m in masks:
            if m != first and m != other:
                return -1
        ones = bin(first).count('1')
        if abs(ones - (n - ones)) > 1:
            return -1
        lead = [1 if m == first else 0 for m in masks]
        cnt = sum(lead)
        if abs(cnt - (n - cnt)) > 1:
            return -1
        best = -1
        for s in (0, 1):
            target = [1 if i % 2 == s else 0 for i in range(n)]
            if sum(target) != cnt:
                continue
            d = sum(a != b for a, b in zip(lead, target)) // 2
            if best == -1 or d < best:
                best = d
        return best

    r, c = solve(rows), solve(cols)
    return -1 if r < 0 or c < 0 else r + c`.split('\n').map((text, index) => ({ line: index + 1, text }))
