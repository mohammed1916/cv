export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.keys) || !Array.isArray(input.values) || input.keys.length !== input.values.length) {
    throw new Error('Use an object with keys and values arrays of the same length.')
  }
  if (input.keys.length < 1 || input.keys.length > 12) throw new Error('keys has 1 to 12 entries.')
  if (!input.keys.every(k => typeof k === 'string' || typeof k === 'boolean' || Number.isInteger(k))) {
    throw new Error('Each key is a string, an integer or a boolean in this visualization.')
  }
  return { keys: input.keys, values: input.values }
}

export const code = `function createObject(keysArr, valuesArr)
  ans <- an empty object
  for i from 0 to keysArr.length - 1
    k <- String(keysArr[i])
    if ans does not have k yet, set ans[k] <- valuesArr[i]
  RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def js_string(x):
    if x is True:
        return "true"
    if x is False:
        return "false"
    return str(x)

def create_object(keys, values):
    ans = {}
    for i in range(len(keys)):
        k = js_string(keys[i])
        if k not in ans:
            ans[k] = values[i]
    return ans
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export function buildTrace({ keys, values }) {
  const ans = new Map()
  const statuses = keys.map(() => 'pending')
  const frames = []
  const snap = fields => frames.push({ keys, values, statuses: [...statuses], entries: [...ans.entries()], at: -1, ...fields })
  snap({ phase: 'start', activeLine: CL('ans <- an empty'), pythonLine: PL('ans = {}'), message: 'Start with an empty object.' })
  keys.forEach((raw, i) => {
    const k = String(raw)
    if (ans.has(k)) {
      statuses[i] = 'skipped'
      snap({ phase: 'skip', activeLine: CL('if ans does not have'), pythonLine: PL('if k not in ans'), at: i, message: `Key "${k}" already exists from an earlier position, so position ${i} is skipped.` })
    } else {
      ans.set(k, values[i])
      statuses[i] = 'kept'
      snap({ phase: 'assign', activeLine: CL('set ans[k]'), pythonLine: PL('ans[k] = values[i]'), at: i, message: `Position ${i}: key "${k}" is new, so it takes the value ${JSON.stringify(values[i])}.` })
    }
  })
  const result = Object.fromEntries(ans)
  snap({ phase: 'done', activeLine: CL('RETURN ans'), pythonLine: PL('return ans'), at: -1, result, message: 'Every key has been considered once.' })
  return { input: { keys, values }, result, frames }
}
