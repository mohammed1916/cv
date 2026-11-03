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

export function buildTrace({ ops }) {
  const owners = new Map()
  const answers = []
  const state = () => [...owners].sort((a, b) => a[0] - b[0]).map(([id, chunks]) => `user ${id}: chunks ${[...chunks].sort((a, b) => a - b).join(', ') || 'none'}`)
  const frames = [{ phase: 'start', pythonLine: PL('owners = {}'), activeLine: L('start with no users'), state: [], message: 'No users have joined.' }]
  for (const op of ops) {
    if (op[0] === 'join') {
      let uid = 1
      while (owners.has(uid)) uid++
      owners.set(uid, new Set(op[1]))
      answers.push(uid)
      frames.push({ phase: 'join', pythonLine: PL('owners[uid] = set(op[1])'), activeLine: L('take the smallest free id'), state: state(), message: `Join: the smallest free id is ${uid}.` })
    } else if (op[0] === 'leave') {
      owners.delete(op[1])
      answers.push(null)
      frames.push({ phase: 'leave', pythonLine: PL('owners.pop(op[1], None)'), activeLine: L('remove that user'), state: state(), message: `User ${op[1]} leaves and frees its id.` })
    } else {
      const [, uid, chunk] = op
      if (!owners.has(uid)) throw new Error(`User ${uid} has not joined.`)
      const others = [...owners].filter(([id, chunks]) => chunks.has(chunk) && id !== uid).map(([id]) => id).sort((a, b) => a - b)
      owners.get(uid).add(chunk)
      answers.push(others)
      frames.push({ phase: 'request', pythonLine: PL('others = sorted'), activeLine: L('list the other owners'), state: state(), message: `Chunk ${chunk} is held by ${others.join(', ') || 'nobody else'}; user ${uid} now has it.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: PL('return answers'), activeLine: L('return the answers'), state: state(), message: 'All operations are finished.' })
  return { input: { ops }, result: answers, frames }
}

export const code = `file sharing with the smallest free user id
  start with no users
  for each operation in order
    if the operation is join then take the smallest free id and store its chunks
    if the operation is leave then remove that user
    if the operation is request then list the other owners and add the chunk to the requester
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
            others = sorted(u for u, chunks in owners.items() if chunk in chunks and u != uid)
            owners.setdefault(uid, set()).add(chunk)
            answers.append(others)
    return answers
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
