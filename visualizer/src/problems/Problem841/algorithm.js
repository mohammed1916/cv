export function parseInput(text) {
  const rooms = JSON.parse(text)
  const n = Array.isArray(rooms) ? rooms.length : 0
  if (n < 2 || n > 30 || !rooms.every(r => Array.isArray(r) && r.length <= 30 && r.every(k => Number.isInteger(k) && k >= 0 && k < n))) {
    throw new Error('Enter a JSON array of 2-30 rooms; each room is an array of key numbers in 0..n-1 (visualization cap: 30 rooms).')
  }
  return rooms
}
export function buildTrace(rooms) {
  const n = rooms.length
  const visited = new Array(n).fill(false)
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra) => frames.push({ phase, activeLine, pythonLine, message, visited: [...visited], stack: [], current: -1, ...extra })
  const stack = [0]
  visited[0] = true
  push('start', 4, 5, 'Room 0 is always unlocked. Mark it visited and put it on the stack of rooms to explore.', { stack: [...stack] })
  while (stack.length) {
    const room = stack.pop()
    push('visit', 6, 7, `Pop room ${room} and walk in. It holds keys [${rooms[room].join(', ')}].`, { stack: [...stack], current: room })
    for (const key of rooms[room]) {
      if (!visited[key]) {
        visited[key] = true; stack.push(key)
        push('key', 9, 10, `Key ${key} opens room ${key}, which was still locked: mark it visited and push it.`, { stack: [...stack], current: room, key })
      } else {
        push('skip', 10, 9, `Key ${key} opens room ${key}, which is already visited: ignore it.`, { stack: [...stack], current: room, key })
      }
    }
  }
  const ok = visited.every(Boolean)
  push('done', 11, 12, ok ? `All ${n} rooms are visited: return True.` : `Rooms ${visited.map((v, i) => (v ? -1 : i)).filter(i => i >= 0).join(', ')} stay locked: return False.`, {})
  return { input: rooms.map(r => [...r]), result: ok, frames }
}
export const code = `function canVisitAllRooms(rooms)
  set n to the number of rooms
  mark every room as not visited
  mark room 0 as visited and put it on the stack
  while the stack is not empty
    pop a room from the stack
    for each key in that room's key list
      if the room this key opens is not visited then
        mark that room as visited and push it onto the stack
      otherwise ignore the key
  return true if every room is visited, otherwise false`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def can_visit_all_rooms(rooms):
    n = len(rooms)
    visited = [False] * n
    visited[0] = True
    stack = [0]
    while stack:
        room = stack.pop()
        for key in rooms[room]:
            if not visited[key]:
                visited[key] = True
                stack.append(key)
    return all(visited)
`
