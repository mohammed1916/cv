export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !input.state || typeof input.state !== 'object' || Array.isArray(input.state)) {
    throw new Error('Use an object with state (a plain object) and path (a list of keys).')
  }
  const { state, path, value } = input
  if (!Array.isArray(path) || path.length < 1 || path.length > 4 || !path.every(k => typeof k === 'string' && k.length <= 12)) {
    throw new Error('path is a list of 1 to 4 short key names.')
  }
  return { state, path, value: value === undefined ? 'updated' : value }
}

export const code = `apply a $set command at a nested path without mutating the original
walk down the path, copying each object on the way
at the last key, replace the value
keep every other branch shared with the original`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ state, path, value }) {
  const frames = []
  const copies = []
  const cloneAlong = (node, depth) => {
    if (depth === path.length) return value
    const key = path[depth]
    const copy = { ...node }
    copies.push(path.slice(0, depth).concat(key).join('.') || 'root')
    frames.push({ phase: 'walk', activeLine: L('walk down the path'), depth, copies: [...copies], message: `Copy the object at ${path.slice(0, depth + 1).join('.')}.` })
    copy[key] = depth + 1 === path.length ? value : cloneAlong(node[key] ?? {}, depth + 1)
    return copy
  }
  frames.push({ phase: 'start', activeLine: L('apply a $set'), depth: 0, copies: [], message: `Update ${path.join('.')} without touching the input.` })
  const next = cloneAlong(state, 0)
  frames.push({ phase: 'set', activeLine: L('at the last key'), depth: path.length, copies: [...copies], message: `Set ${path.join('.')} to ${JSON.stringify(value)}.` })
  frames.push({ phase: 'done', activeLine: L('keep every other'), depth: path.length, copies: [...copies], message: 'Untouched branches are shared, not copied.' })
  return { input: { state, path, value }, result: next, frames }
}
