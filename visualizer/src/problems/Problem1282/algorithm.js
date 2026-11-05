export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no open buckets and no finished groups.' },
  { id: 'read', label: 'Read person', description: 'Take the next person and the group size they were given.' },
  { id: 'create', label: 'Open bucket', description: 'Create an empty bucket the first time a size is seen.' },
  { id: 'add', label: 'Add member', description: 'Place the person into the bucket for their size.' },
  { id: 'emit', label: 'Emit group', description: 'A bucket that reaches its size becomes a finished group and is cleared.' },
  { id: 'done', label: 'Complete', description: 'Every person has been placed, so the finished groups are returned.' },
]

export function parseInput(text) {
  const sizes = JSON.parse(text)
  if (!Array.isArray(sizes) || sizes.length < 1 || sizes.length > 30) throw new Error('Use a JSON array of 1 to 30 group sizes, such as [2, 2, 1].')
  if (!sizes.every(s => Number.isInteger(s) && s >= 1 && s <= sizes.length)) throw new Error('Each group size must be an integer from 1 to the number of people.')
  const counts = new Map()
  for (const s of sizes) counts.set(s, (counts.get(s) ?? 0) + 1)
  for (const [s, count] of counts) if (count % s !== 0) throw new Error(`Size ${s} appears ${count} times, which cannot be split into full groups of ${s}.`)
  return sizes
}

export function buildTrace(groupSizes) {
  const open = new Map()
  const groups = []
  const snap = (person, size, emitted) => ({
    person, size, emitted,
    buckets: [...open].map(([s, members]) => ({ size: s, members: [...members] })),
    groups: groups.map(g => [...g]),
  })
  const frames = [{ phase: 'start', activeLine: L('const open = new Map()'), pythonLine: P('open_buckets = {}'), snapshot: snap(null, null, false), message: `Read ${groupSizes.length} people. Each person must join a bucket for their own size.` }]
  groupSizes.forEach((size, person) => {
    frames.push({ phase: 'read', activeLine: L('for (let person = 0'), pythonLine: P('for person, size'), snapshot: snap(person, size, false), message: `Person ${person} requires a group of ${size}.` })
    if (!open.has(size)) {
      open.set(size, [])
      frames.push({ phase: 'create', activeLine: L('if (!open.has(size))'), pythonLine: P('if size not in'), snapshot: snap(person, size, false), message: `No bucket for size ${size} is open, so create an empty one.` })
    }
    open.get(size).push(person)
    frames.push({ phase: 'add', activeLine: L('open.get(size).push(person)'), pythonLine: P('append(person)'), snapshot: snap(person, size, false), message: `Person ${person} joins the size-${size} bucket, which now holds ${open.get(size).length} of ${size}.` })
    if (open.get(size).length === size) {
      groups.push([...open.get(size)])
      open.delete(size)
      frames.push({ phase: 'emit', activeLine: L('groups.push([...open'), pythonLine: P('groups.append'), snapshot: snap(person, size, true), message: `The bucket is full, so it is finished as a group and the size-${size} bucket is cleared.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return groups'), pythonLine: P('return groups'), snapshot: snap(null, null, false), message: `All people are placed. Return ${groups.length} groups.` })
  return { input: groupSizes, result: groups, frames }
}

export const code = `function groupThePeople(groupSizes) {
  const open = new Map()
  const groups = []
  for (let person = 0; person < groupSizes.length; person++) {
    const size = groupSizes[person]
    if (!open.has(size)) open.set(size, [])
    open.get(size).push(person)
    if (open.get(size).length === size) {
      groups.push([...open.get(size)])
      open.delete(size)
    }
  }
  return groups
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def group_the_people(group_sizes):
    open_buckets = {}
    groups = []
    for person, size in enumerate(group_sizes):
        if size not in open_buckets:
            open_buckets[size] = []
        open_buckets[size].append(person)
        if len(open_buckets[size]) == size:
            groups.append(open_buckets[size])
            del open_buckets[size]
    return groups
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
