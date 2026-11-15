export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string') throw new Error('Use an object with a string "s".')
  const { s } = input
  if (s.length < 1 || s.length > 12) throw new Error('s holds 1 to 12 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s may contain only lowercase letters a to z.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const frames = [{ phase: 'start', pythonLine: 2, activeLine: L('let best = 0'), start: 0, end: 0, piece: null, pieces: [], best: 0, message: 'Try every way to cut the text into pieces.', activeNodeId: 'root', treeSize: 1 }]
  const used = new Set()
  const pieces = []
  let best = 0
  let bestPieces = []
  // Search tree: one node per choice (a piece taken, a duplicate skipped, or a finished split).
  const tree = [{ id: 'root', parentId: null, depth: 0, title: 'start', choice: null, decision: null, subtitle: 'no pieces yet', status: null }]
  let nodeCount = 0
  const addNode = (parentId, depth, choice, decision, subtitle, pruneReason) => {
    const node = { id: `n${++nodeCount}`, parentId, depth, choice, decision, subtitle, ...(pruneReason ? { pruneReason } : {}) }
    tree.push(node)
    return node.id
  }
  const partial = list => (list.length ? list.join(' | ') : 'no pieces yet')
  const frame = (fields, activeNodeId) => frames.push({ ...fields, activeNodeId, treeSize: tree.length })
  const split = (start, currentId, depth) => {
    if (start === s.length) {
      const leafId = addNode(currentId, depth + 1, 'end', pieces.length > best ? 'chosen' : 'ignored', `${pieces.length} piece(s)`, pieces.length > best ? undefined : 'not more than best')
      if (pieces.length > best) { best = pieces.length; bestPieces = [...pieces] }
      frame({ phase: 'record', pythonLine: 8, activeLine: L('best = Math.max(best, count)'), start: s.length, end: s.length, piece: null, pieces: [...pieces], best, message: `This split has ${pieces.length} unique piece(s).` }, leafId)
      return
    }
    for (let end = start + 1; end <= s.length; end++) {
      const piece = s.slice(start, end)
      if (used.has(piece)) {
        const skipId = addNode(currentId, depth + 1, piece, 'pruned', partial(pieces), 'duplicate piece')
        frame({ phase: 'duplicate', pythonLine: 13, activeLine: L('if (used.has(piece))'), start, end, piece, pieces: [...pieces], best, message: `"${piece}" is already used, so skip it.` }, skipId)
        continue
      }
      used.add(piece)
      pieces.push(piece)
      const nodeId = addNode(currentId, depth + 1, piece, 'chosen', partial(pieces))
      frame({ phase: 'choose', pythonLine: 14, activeLine: L('used.add(piece)'), start, end, piece, pieces: [...pieces], best, message: `Take "${piece}" as piece ${pieces.length}.` }, nodeId)
      split(end, nodeId, depth + 1)
      pieces.pop()
      used.delete(piece)
      frame({ phase: 'backtrack', pythonLine: 16, activeLine: L('used.delete(piece)'), start, end, piece, pieces: [...pieces], best, message: `Put "${piece}" back and try a longer piece.` }, nodeId)
    }
  }
  split(0, 'root', 0)
  frames.push({ phase: 'done', pythonLine: 19, activeLine: L('return best'), start: s.length, end: s.length, piece: null, pieces: bestPieces, best, message: `The maximum number of unique pieces is ${best}.`, activeNodeId: null, treeSize: tree.length })
  return { input, result: best, frames, bestPieces, tree }
}

const CODE = [
  'function maxUniqueSplit(s) {',
  '  let best = 0',
  '  const used = new Set()',
  '  const split = (start, count) => {',
  '    if (start === s.length) { best = Math.max(best, count); return }',
  '    for (let end = start + 1; end <= s.length; end++) {',
  '      const piece = s.slice(start, end)',
  '      if (used.has(piece)) continue',
  '      used.add(piece)',
  '      split(end, count + 1)',
  '      used.delete(piece)',
  '    }',
  '  }',
  '  split(0, 0)',
  '  return best',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(c => c.includes(s)) + 1

export const python = `def max_unique_split(s):
    best = 0
    seen = set()

    def split(start, count):
        nonlocal best
        if start == len(s):
            best = max(best, count)
            return
        for end in range(start + 1, len(s) + 1):
            piece = s[start:end]
            if piece in seen:
                continue
            seen.add(piece)
            split(end, count + 1)
            seen.remove(piece)

    split(0, 0)
    return best
`
