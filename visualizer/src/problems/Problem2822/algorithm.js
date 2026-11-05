export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.pairs) || input.pairs.length < 1 || input.pairs.length > 12) throw new Error('pairs holds 1 to 12 [key, value] pairs.')
  const keys = new Set()
  input.pairs.forEach(p => {
    if (!Array.isArray(p) || p.length !== 2 || typeof p[0] !== 'string') throw new Error('Each pair is [key, value] with a string key.')
    if (typeof p[1] !== 'string' && !Number.isInteger(p[1])) throw new Error('Each value is a string or an integer.')
    if (keys.has(p[0])) throw new Error('Keys are unique.')
    keys.add(p[0])
  })
  return { pairs: input.pairs }
}

export const code = `function invertObject(obj)
  ans <- an empty object
  for each key in obj, in order
    v <- String(obj[key])
    if ans has v
      if ans[v] is already a list, append key to it
      else ans[v] <- [ans[v], key]
    else ans[v] <- key
  RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def invert_object(pairs):
    ans = {}
    for key, value in pairs:
        v = str(value)
        if v in ans:
            if isinstance(ans[v], list):
                ans[v].append(key)
            else:
                ans[v] = [ans[v], key]
        else:
            ans[v] = key
    return ans
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export function buildTrace({ pairs }) {
  const ans = new Map()
  const statuses = pairs.map(() => 'pending')
  const frames = []
  const snap = fields => frames.push({ pairs, statuses: [...statuses], entries: [...ans.entries()].map(([k, v]) => [k, v]), at: -1, ...fields })
  snap({ phase: 'start', activeLine: CL('ans <- an empty'), pythonLine: PL('ans = {}'), message: 'Start with an empty object.' })
  pairs.forEach(([key, value], i) => {
    const v = String(value)
    if (ans.has(v)) {
      const prev = ans.get(v)
      if (Array.isArray(prev)) {
        prev.push(key)
        statuses[i] = 'appended'
        snap({ phase: 'append', activeLine: CL('append key to it'), pythonLine: PL('ans[v].append(key)'), at: i, message: `Value ${JSON.stringify(v)} already maps to a list, so key "${key}" joins it.` })
      } else {
        ans.set(v, [prev, key])
        statuses[i] = 'listed'
        snap({ phase: 'make', activeLine: CL('else ans[v] <- [ans[v], key]'), pythonLine: PL('ans[v] = [ans[v], key]'), at: i, message: `Value ${JSON.stringify(v)} is repeated, so both keys "${prev}" and "${key}" are listed.` })
      }
    } else {
      ans.set(v, key)
      statuses[i] = 'kept'
      snap({ phase: 'assign', activeLine: CL('else ans[v] <- key'), pythonLine: PL('ans[v] = key'), at: i, message: `Value ${JSON.stringify(v)} is new, so it maps to key "${key}".` })
    }
  })
  const result = Object.fromEntries(ans)
  snap({ phase: 'done', activeLine: CL('RETURN ans'), pythonLine: PL('return ans'), at: -1, result, message: 'Every pair has been inverted.' })
  return { input: { pairs }, result, frames }
}
