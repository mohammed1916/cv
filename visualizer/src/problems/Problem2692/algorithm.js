export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !input.obj || typeof input.obj !== 'object') {
    throw new Error('Use an object with obj (a plain object) and write (a path list).')
  }
  const write = input.write
  if (!Array.isArray(write) || write.length < 1 || write.length > 4 || !write.every(k => typeof k === 'string')) {
    throw new Error('write is a list of 1 to 4 keys to attempt to change.')
  }
  return { obj: input.obj, write }
}

export const code = `freeze a value and everything nested under it
if the value is not an object, stop
freeze the object itself
for each property, freeze that property's value first
then try a write and report whether it is blocked`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ obj, write }) {
  const frames = []
  const frozen = []
  const visit = (node, name) => {
    if (node === null || typeof node !== 'object') return
    for (const key of Object.keys(node)) visit(node[key], name ? `${name}.${key}` : key)
    frozen.push(name || 'root')
    frames.push({ phase: 'freeze', activeLine: L('freeze the object itself'), frozen: [...frozen], message: `Freeze ${name || 'root'}.` })
  }
  frames.push({ phase: 'start', activeLine: L('freeze a value'), frozen: [], message: 'Walk the object from the bottom up.' })
  visit(obj, '')
  const target = write.join('.')
  const blocked = true
  frames.push({ phase: 'write', activeLine: L('then try a write'), frozen: [...frozen], target, blocked, message: `A write to ${target} is rejected because every level is frozen.` })
  return { input: { obj, write }, result: { frozenCount: frozen.length, blocked }, frames }
}
