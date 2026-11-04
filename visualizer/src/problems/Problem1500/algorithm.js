export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 20) throw new Error('Use an object with ops, 1 to 20 operations.')
  for (const op of input.ops) {
    if (op[0] === 'join' && Array.isArray(op[1]) && op[1].length <= 5 && op[1].every(c => Number.isInteger(c) && c >= 1 && c <= 20)) continue
    if (op[0] === 'leave' && Number.isInteger(op[1])) continue
    if (op[0] === 'request' && Number.isInteger(op[1]) && Number.isInteger(op[2]) && op[2] >= 1 && op[2] <= 20) continue
    throw new Error('Use ["join", [chunks]], ["leave", id] or ["request", id, chunk].')
  }
  return input
}

// Rule (from the problem statement): join gives the smallest free positive id; a request returns every
// user who owns the chunk, requester included, sorted ascending; the requester only receives the chunk
// when at least one other user has it.
export function buildTrace({ ops }) {
  const owners = new Map()
  const answers = []
  const state = () => [...owners].sort((a, b) => a[0] - b[0]).map(([id, chunks]) => `user ${id}: chunks ${[...chunks].sort((a, b) => a - b).join(', ') || 'none'}`)
  const snapshot = (extra = {}) => ({
    owners: [...owners].sort((a, b) => a[0] - b[0]).map(([id, chunks]) => [id, [...chunks].sort((a, b) => a - b)]),
    ...extra,
  })
  const frames = [{ phase: 'start', pythonLine: PL('owners = {}'), activeLine: L('const owners = new Map()'), state: [], message: 'No users have joined.', snapshot: snapshot() }]
  for (const [opIndex, op] of ops.entries()) {
    const firstFrame = frames.length
    if (op[0] === 'join') {
      let uid = 1
      while (owners.has(uid)) uid++
      owners.set(uid, new Set(op[1]))
      answers.push(uid)
      frames.push({ phase: 'join', pythonLine: PL('owners[uid] = set(op[1])'), activeLine: L('let uid = 1; while'), state: state(), message: `Join: the smallest free id is ${uid}.`, snapshot: snapshot({ uid, chunks: op[1] }) })
    } else if (op[0] === 'leave') {
      owners.delete(op[1])
      answers.push(null)
      frames.push({ phase: 'leave', pythonLine: PL('owners.pop(op[1], None)'), activeLine: L('owners.delete(op[1])'), state: state(), message: `User ${op[1]} leaves and frees its id.`, snapshot: snapshot({ uid: op[1], freed: op[1] }) })
    } else {
      const [, uid, chunk] = op
      if (!owners.has(uid)) throw new Error(`User ${uid} has not joined.`)
      const holders = [...owners].filter(([, chunks]) => chunks.has(chunk)).map(([id]) => id).sort((a, b) => a - b)
      const gives = holders.some(id => id !== uid)
      if (gives) owners.get(uid).add(chunk)
      answers.push(holders)
      frames.push({
        phase: 'request', pythonLine: PL('holders = sorted'), activeLine: L('const holders = [...owners]'), state: state(),
        message: `Chunk ${chunk} is held by ${holders.join(', ') || 'nobody'}. ${gives ? `User ${uid} receives it.` : `User ${uid} receives nothing.`}`,
        snapshot: snapshot({ uid, chunk, holders, gives }),
      })
    }
    for (let f = firstFrame; f < frames.length; f++) frames[f].op = opIndex
  }
  frames.push({ phase: 'done', pythonLine: PL('return answers'), activeLine: L('return answers'), state: state(), message: 'All operations are finished.', snapshot: snapshot() })
  return { input: { ops }, result: answers, frames }
}

export const code = [
  "function fileSharing(ops) {",
  "  const owners = new Map()",
  "  const answers = []",
  "  for (const op of ops) {",
  "    if (op[0] === 'join') {",
  "      let uid = 1; while (owners.has(uid)) uid++",
  "      owners.set(uid, new Set(op[1])); answers.push(uid) }",
  "    else if (op[0] === 'leave') {",
  "      owners.delete(op[1]); answers.push(null) }",
  "    else {",
  "      const [, uid, chunk] = op",
  "      const holders = [...owners].filter(([, c]) => c.has(chunk)).map(([id]) => id).sort((a, b) => a - b)",
  "      if (holders.some(id => id !== uid)) owners.get(uid).add(chunk)",
  "      answers.push(holders) }",
  "  }",
  "  return answers }",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def share(ops):
    owners = {}
    answers = []
    for op in ops:
        if op[0] == "join":
            uid = 1
            while uid in owners:
                uid += 1
            owners[uid] = set(op[1])
            answers.append(uid)
        elif op[0] == "leave":
            owners.pop(op[1], None)
            answers.append(None)
        else:
            _, uid, chunk = op
            holders = sorted(u for u, chunks in owners.items() if chunk in chunks)
            if any(u != uid for u in holders):
                owners[uid].add(chunk)
            answers.append(holders)
    return answers
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
