export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.arr1) || !Array.isArray(data.arr2)) throw new Error('Use {"arr1": [...], "arr2": [...]} with objects that have an integer id.')
  const check = (list, name) => {
    if (list.length < 1 || list.length > 8) throw new Error(`${name} holds 1 to 8 objects.`)
    const ids = new Set()
    for (const obj of list) {
      if (!obj || Array.isArray(obj) || !Number.isInteger(obj.id) || obj.id < 1 || obj.id > 50) throw new Error(`${name}: each object needs an integer id from 1 to 50.`)
      if (ids.has(obj.id)) throw new Error(`${name}: each id appears once.`)
      ids.add(obj.id)
      if (Object.entries(obj).some(([k, v]) => k !== 'id' && (!Number.isInteger(v) || v < 0 || v > 99))) throw new Error(`${name}: other values are integers from 0 to 99.`)
    }
  }
  check(data.arr1, 'arr1')
  check(data.arr2, 'arr2')
  return { arr1: data.arr1, arr2: data.arr2 }
}

export function buildTrace(input) {
  const joined = new Map()
  const frames = []
  const maps = () => [{ name: 'joined', keyLabel: 'id', valueLabel: 'object', isSet: false, entries: [...joined].map(([id, obj]) => [id, JSON.stringify(obj)]) }]
  frames.push({ phase: 'start', activeLine: L('joined = empty map'), index: -1, maps: maps(), ops: [], result: [], message: 'Start an empty table keyed by id. Objects from arr1 go in first.' })
  input.arr1.forEach((obj, i) => {
    joined.set(obj.id, { ...obj })
    frames.push({ phase: 'first', activeLine: L('set joined at its id to a copy'), index: i, maps: maps(), ops: [{ map: 'joined', type: 'insert', key: obj.id, value: JSON.stringify(obj) }], result: [], message: `arr1 object ${JSON.stringify(obj)} is stored under id ${obj.id}.` })
  })
  input.arr2.forEach((obj, i) => {
    const existing = joined.get(obj.id)
    if (existing) {
      const before = JSON.stringify(existing)
      joined.set(obj.id, { ...existing, ...obj })
      frames.push({ phase: 'merge', activeLine: L('merge the object'), index: i, maps: maps(), ops: [{ map: 'joined', type: 'update', key: obj.id, value: JSON.stringify(joined.get(obj.id)), before }], result: [], message: `Id ${obj.id} exists, so arr2 values overwrite it: ${JSON.stringify(joined.get(obj.id))}.` })
    } else {
      joined.set(obj.id, { ...obj })
      frames.push({ phase: 'merge', activeLine: L('set joined at its id to a copy'), index: i, maps: maps(), ops: [{ map: 'joined', type: 'insert', key: obj.id, value: JSON.stringify(obj) }], result: [], message: `Id ${obj.id} is new, so arr2 object ${JSON.stringify(obj)} is added.` })
    }
  })
  const result = [...joined.keys()].sort((a, b) => a - b).map(id => joined.get(id))
  frames.push({ phase: 'done', activeLine: L('return the joined objects'), index: -1, maps: maps(), ops: [], result, message: `Joined ${result.length} object(s), sorted by id.` })
  return { input, result, frames }
}

export const code = `join two lists of objects by id
joined = empty map from id to object
for each object in arr1
  set joined at its id to a copy of the object
for each object in arr2
  if its id is in joined then
    merge the object's keys into joined at its id, overwriting values
  otherwise
    set joined at its id to a copy of the object
return the joined objects sorted by id`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def join_arrays_by_id(arr1, arr2):
    joined = {}
    for obj in arr1:
        joined[obj['id']] = dict(obj)
    for obj in arr2:
        if obj['id'] in joined:
            joined[obj['id']].update(obj)
        else:
            joined[obj['id']] = dict(obj)
    return [joined[k] for k in sorted(joined)]
`
