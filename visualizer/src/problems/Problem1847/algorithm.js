export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.rooms) || !Array.isArray(input.queries)) throw new Error('Use {"rooms": [[id, size], ...], "queries": [[preferred, minSize], ...]}.')
  const { rooms, queries } = input
  if (rooms.length < 1 || rooms.length > 6 || queries.length < 1 || queries.length > 6) throw new Error('Use 1 to 6 rooms and 1 to 6 queries.')
  const ids = rooms.map(r => r[0])
  if (new Set(ids).size !== ids.length) throw new Error('Room ids are distinct.')
  if (rooms.some(r => !Array.isArray(r) || r.length !== 2)) throw new Error('Each room is [id, size].')
  if (queries.some(q => !Array.isArray(q) || q.length !== 2)) throw new Error('Each query is [preferred, minSize].')
  if ([...rooms.flat(), ...queries.flat()].some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Values are integers from 1 to 10.')
  return { rooms, queries }
}

// First index whose value is at least x.
const lowerBound = (list, x) => {
  let lo = 0
  let hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (list[mid] < x) lo = mid + 1
    else hi = mid
  }
  return lo
}

export function buildTrace({ rooms, queries }) {
  const roomsBySize = [...rooms].sort((a, b) => b[1] - a[1])
  const order = queries.map((_, index) => index).sort((a, b) => queries[b][1] - queries[a][1] || a - b)
  const ids = []
  const answers = Array(queries.length).fill(-1)
  let next = 0
  const frames = [{ phase: 'start', activeLine: L('sort rooms by size'), query: null, ids: [], answer: null, message: 'Rooms and queries are sorted so the usable set only grows.' }]
  for (const index of order) {
    const [preferred, minSize] = queries[index]
    while (next < roomsBySize.length && roomsBySize[next][1] >= minSize) {
      const [id, size] = roomsBySize[next]
      ids.splice(lowerBound(ids, id), 0, id)
      next++
      frames.push({ phase: 'add', activeLine: L('add every room big enough'), query: index, ids: [...ids], answer: null, message: `Room ${id} (size ${size}) is usable for query ${index}.` })
    }
    const i = lowerBound(ids, preferred)
    const options = [ids[i - 1], ids[i]].filter(v => v !== undefined)
    if (options.length) {
      answers[index] = options.reduce((best, id) => {
        const d = Math.abs(id - preferred)
        const bestDistance = Math.abs(best - preferred)
        return d < bestDistance || (d === bestDistance && id < best) ? id : best
      })
    }
    frames.push({ phase: 'query', activeLine: L('store that id'), query: index, ids: [...ids], answer: answers[index], message: `Query ${index} prefers room ${preferred}; the answer is ${answers[index]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the stored answers'), query: null, ids: [...ids], answer: null, message: `Answers: ${JSON.stringify(answers)}.` })
  return { input: { rooms, queries }, roomsBySize, result: answers, frames }
}

export const code = `closest room for each query
  sort rooms by size from largest to smallest
  sort queries by minimum size from largest to smallest
  start with no rooms in the set of usable ids
  for each query in that order
    add every room big enough for this query to the sorted set of ids
    find the id at or above the preferred id, and the one just below it
    keep the one closer to the preferred id, with the smaller id on a tie
    store that id, or minus one if the set is empty
  return the stored answers in the original order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def closest_room(rooms, queries):
    import bisect
    rooms_by_size = sorted(rooms, key=lambda room: -room[1])
    order = sorted(range(len(queries)), key=lambda i: (-queries[i][1], i))
    ids = []
    answers = [-1] * len(queries)
    next_room = 0
    for index in order:
        preferred, min_size = queries[index]
        while next_room < len(rooms_by_size) and rooms_by_size[next_room][1] >= min_size:
            bisect.insort(ids, rooms_by_size[next_room][0])
            next_room += 1
        i = bisect.bisect_left(ids, preferred)
        options = [ids[k] for k in (i - 1, i) if 0 <= k < len(ids)]
        if options:
            answers[index] = min(options, key=lambda room_id: (abs(room_id - preferred), room_id))
    return answers
`
