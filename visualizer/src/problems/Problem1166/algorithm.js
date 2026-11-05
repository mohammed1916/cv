const PATH = /^\/[a-z]+(\/[a-z]+)*$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 20) throw new Error('Use an object with ops, 1 to 20 operations.')
  for (const op of input.ops) {
    if (op[0] === 'create' && typeof op[1] === 'string' && PATH.test(op[1]) && Number.isInteger(op[2])) continue
    if (op[0] === 'get' && typeof op[1] === 'string' && PATH.test(op[1])) continue
    throw new Error('Use ["create", "/path", value] or ["get", "/path"] with lowercase path names.')
  }
  return input
}

export function buildTrace({ ops }) {
  const paths = new Map()
  const frames = []
  const state = () => [...paths].map(([p, v]) => `${p} = ${v}`)
  const results = []
  frames.push({ phase: 'start', pythonLine: PL('paths = {}'), activeLine: L.start, state: [], entries: [], message: 'No paths exist yet.' })
  for (const op of ops) {
    if (op[0] === 'create') {
      const [, path, value] = op
      const parent = path.slice(0, path.lastIndexOf('/'))
      const parentOk = parent === '' || paths.has(parent)
      const exists = paths.has(path)
      if (!parentOk || exists) {
        results.push(false)
        frames.push({ phase: 'reject', pythonLine: PL('results.append(False)'), activeLine: L.reject, state: state(), entries: [...paths], message: exists ? `${path} already exists.` : `Parent ${parent} is missing.` })
      } else {
        paths.set(path, value)
        results.push(true)
        frames.push({ phase: 'create', pythonLine: PL('paths[path] = value'), activeLine: L.create, state: state(), entries: [...paths], message: `Create ${path} with ${value}.` })
      }
    } else {
      const v = paths.has(op[1]) ? paths.get(op[1]) : -1
      results.push(v)
      frames.push({ phase: 'get', pythonLine: PL('results.append(paths.get'), activeLine: L.get, state: state(), entries: [...paths], message: `get ${op[1]} returns ${v}.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: PL('return results'), activeLine: L.done, state: state(), entries: [...paths], message: 'All operations are finished.' })
  return { input: { ops }, result: results, frames }
}

export const code = `function fileSystem(ops) {
  const paths = new Map()
  const results = []
  for (const op of ops) {
    if (op[0] === 'create') {
      const [, path, value] = op
      const parent = path.slice(0, path.lastIndexOf('/'))
      if ((parent !== '' && !paths.has(parent)) || paths.has(path)) {
        results.push(false)
      } else {
        paths.set(path, value)
        results.push(true)
      }
    } else {
      results.push(paths.has(op[1]) ? paths.get(op[1]) : -1)
    }
  }
  return results
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = { start: 2, reject: 9, create: 11, get: 15, done: 18 }

export const python = `def file_system(ops):
    paths = {}
    results = []
    for op in ops:
        if op[0] == "create":
            path, value = op[1], op[2]
            parent = path[: path.rfind("/")]
            if (parent and parent not in paths) or path in paths:
                results.append(False)
                continue
            paths[path] = value
            results.append(True)
        else:
            results.append(paths.get(op[1], -1))
    return results
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
