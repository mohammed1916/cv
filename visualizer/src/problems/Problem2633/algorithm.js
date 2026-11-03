export const code = [
  'if value is an array write each item in brackets',
  'if value is an object write each key and value in braces',
  'if value is a string write it in quotes',
  'otherwise write the number boolean or null',
  'return the joined text',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

function check(value, depth) {
  if (depth > 3) throw new Error('Nesting is at most 3 levels deep.')
  if (value === null || typeof value === 'boolean') return
  if (typeof value === 'number') { if (!Number.isInteger(value)) throw new Error('Numbers are whole numbers.'); return }
  if (typeof value === 'string') { if (!/^[a-z ]*$/.test(value)) throw new Error('Strings use lowercase letters and spaces.'); return }
  if (Array.isArray(value)) { if (value.length > 5) throw new Error('Arrays hold at most 5 items.'); value.forEach(item => check(item, depth + 1)); return }
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length > 5 || !keys.every(key => /^[a-z]+$/.test(key))) throw new Error('Objects hold at most 5 keys made of lowercase letters.')
    keys.forEach(key => check(value[key], depth + 1))
    return
  }
  throw new Error('Only JSON values are allowed.')
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !('value' in input)) throw new Error('Use an object with a value field.')
  check(input.value, 0)
  return { value: input.value }
}

export function buildTrace({ value }) {
  const frames = []
  const out = []
  const view = (focus) => ({ title: 'Output so far', rows: [out.join('')], focus: 0, summary: '' })
  const write = (node) => {
    if (Array.isArray(node)) {
      out.push('[')
      node.forEach((item, i) => { if (i) out.push(','); write(item) })
      out.push(']')
      step(frames, 'array', 'if value is an array', `Closed an array of ${node.length} items.`, view(0))
    } else if (node !== null && typeof node === 'object') {
      out.push('{')
      Object.keys(node).forEach((key, i) => { if (i) out.push(','); out.push(`"${key}":`); write(node[key]) })
      out.push('}')
      step(frames, 'object', 'if value is an object', `Closed an object with ${Object.keys(node).length} keys.`, view(0))
    } else if (typeof node === 'string') {
      out.push(`"${node}"`)
      step(frames, 'string', 'if value is a string', `Wrote the string "${node}".`, view(0))
    } else {
      out.push(String(node))
      step(frames, 'leaf', 'otherwise write', `Wrote ${String(node)}.`, view(0))
    }
  }
  write(value)
  const result = out.join('')
  step(frames, 'done', 'return the joined text', 'Finished.', { title: 'Output', rows: [result], focus: 0, summary: result })
  return { result, frames }
}
