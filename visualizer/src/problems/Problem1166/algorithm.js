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
  frames.push({ phase: 'start', pythonLine: PL('paths = {}'), activeLine: L('start with an empty map'), state: [], message: 'No paths exist yet.' })
  for (const op of ops) {
    if (op[0] === 'create') {
      const [, path, value] = op
      const parent = path.slice(0, path.lastIndexOf('/'))
      const parentOk = parent === '' || paths.has(parent)
      const exists = paths.has(path)
      if (!parentOk || exists) {
        results.push(false)
        frames.push({ phase: 'reject', pythonLine: PL('results.append(False)'), activeLine: L('record false'), state: state(), message: exists ? `${path} already exists.` : `Parent ${parent} is missing.` })
      } else {
        paths.set(path, value)
        results.push(true)
        frames.push({ phase: 'create', pythonLine: PL('paths[path] = value'), activeLine: L('store the value and record true'), state: state(), message: `Create ${path} with ${value}.` })
      }
    } else {
      const v = paths.has(op[1]) ? paths.get(op[1]) : -1
      results.push(v)
      frames.push({ phase: 'get', pythonLine: PL('results.append(paths.get'), activeLine: L('record the stored value or -1'), state: state(), message: `get ${op[1]} returns ${v}.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: PL('return results'), activeLine: L('return the recorded results'), state: state(), message: 'All operations are finished.' })
  return { input: { ops }, result: results, frames }
}

export const code = `file system with create and get
  start with an empty map of paths
  for each operation in order
    if the operation is create then find the parent path
      if the parent is missing or the path exists then record false
      otherwise store the value and record true
    otherwise record the stored value or -1
  return the recorded results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
