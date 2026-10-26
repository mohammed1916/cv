export function parseInput(text) {
  const d = JSON.parse(text)
  if (!d || typeof d.s !== 'string' || !Array.isArray(d.indices) || !Array.isArray(d.sources) || !Array.isArray(d.targets)) throw new Error('Enter JSON like {"s":"abcd","indices":[0],"sources":["a"],"targets":["eee"]}.')
  const k = d.indices.length
  if (!/^[a-z]{1,60}$/.test(d.s)) throw new Error('s must be 1-60 lowercase letters (visualization cap).')
  if (k < 1 || k > 15 || d.sources.length !== k || d.targets.length !== k) throw new Error('Give 1-15 operations with equal-length indices, sources and targets.')
  if (d.indices.some(i => !Number.isInteger(i) || i < 0 || i >= d.s.length)) throw new Error('Every index must be an integer inside s.')
  if (d.sources.some(x => typeof x !== 'string' || !/^[a-z]{1,10}$/.test(x)) || d.targets.some(x => typeof x !== 'string' || !/^[a-z]{1,10}$/.test(x))) throw new Error('Sources and targets must be 1-10 lowercase letters.')
  const order = d.indices.map((v, i) => i).sort((a, b) => d.indices[a] - d.indices[b])
  for (let j = 0; j + 1 < k; j++) {
    const a = order[j], b = order[j + 1]
    if (d.indices[a] + d.sources[a].length > d.indices[b]) throw new Error('Replacements must not overlap: each index plus source length must not reach the next index.')
  }
  return { s: d.s, indices: [...d.indices], sources: [...d.sources], targets: [...d.targets] }
}
export function buildTrace({ s, indices, sources, targets }) {
  const ops = indices.map((index, id) => ({ id, index, source: sources[id], target: targets[id] })).sort((a, b) => b.index - a.index)
  let cur = s
  const frames = [{ phase: 'start', cur, op: -1, activeLine: 2, message: `Process ${ops.length} operation(s) from the largest index down; edits to the right never shift positions on the left.` }]
  ops.forEach(op => {
    const match = cur.startsWith(op.source, op.index)
    if (match) {
      const before = cur
      cur = cur.slice(0, op.index) + op.target + cur.slice(op.index + op.source.length)
      frames.push({ phase: 'replace', cur, before, op, match, activeLine: 5, message: `At index ${op.index} the text really is "${op.source}": replace it with "${op.target}" giving "${cur}".` })
    } else {
      frames.push({ phase: 'skip', cur, before: cur, op, match, activeLine: 4, message: `At index ${op.index} the text is "${cur.substr(op.index, op.source.length)}", not "${op.source}": skip this operation.` })
    }
  })
  frames.push({ phase: 'done', cur, op: -1, activeLine: 6, message: `Final string: "${cur}".` })
  return { input: { s, indices, sources, targets }, ops, result: cur, frames }
}
export const code = `def findReplaceString(s, indices, sources, targets):
    ops = sorted(zip(indices, sources, targets), reverse=True)
    for i, src, tgt in ops:
        if s.startswith(src, i):
            s = s[:i] + tgt + s[i + len(src):]
    return s`.split('\n').map((text, index) => ({ line: index + 1, text }))
