export const phases = [
  { id: 'start', label: 'Read', description: 'Read the phone numbers.' },
  { id: 'insert', label: 'Insert', description: 'Start inserting the next number at the root.' },
  { id: 'walk', label: 'Walk', description: 'Follow or create the child for one digit.' },
  { id: 'mark', label: 'Mark', description: 'Mark the end of a number.' },
  { id: 'conflict', label: 'Conflict', description: 'A number is a prefix of another, or duplicated.' },
  { id: 'done', label: 'Result', description: 'Report whether the numbers are prefix-free.' },
]

const DIGITS = /^[0-9]{1,10}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with numbers.')
  const { numbers } = input
  if (!Array.isArray(numbers) || numbers.length < 1 || numbers.length > 8) throw new Error('numbers lists 1 to 8 digit strings.')
  if (!numbers.every(s => typeof s === 'string' && DIGITS.test(s))) throw new Error('Each number is 1 to 10 digits.')
  return { numbers: numbers.slice() }
}

export const code = [
  'phone number prefix',
  '  root = empty trie',
  '  for each number s in order',
  '    node = root',
  '    for each digit d in s',
  '      if node already ends a number, return false',
  '      node = child of node for d, created if missing',
  '    if node already ends a number or has children, return false',
  '    mark node as the end of s',
  '  return true',
].map((text, index) => ({ line: index + 1, text }))

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const newNode = () => ({ children: new Map(), end: false })
const snapshot = node => ({ end: node.end, children: [...node.children.entries()].map(([d, child]) => [d, snapshot(child)]) })

export function buildTrace({ numbers }) {
  const root = newNode()
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, trie: snapshot(root), numbers, ...extra,
  })
  push('start', L('phone number prefix'), P('def phone'), `Read ${numbers.length} numbers. The trie starts empty.`, { current: -1, digit: -1, consumed: 0, result: null })
  for (let index = 0; index < numbers.length; index++) {
    const s = numbers[index]
    let node = root
    push('insert', L('for each number'), P('for s in numbers'), `Insert ${s} into the trie.`, { current: index, digit: -1, consumed: 0, result: null })
    for (let k = 0; k < s.length; k++) {
      if (node.end) {
        push('conflict', L('already ends a number, return false'), P("if node['end']:"), `An earlier number ends before digit ${k} of ${s}, so it is a prefix of ${s}.`, { current: index, digit: s[k], consumed: k, result: false })
        push('done', L('return true'), P('return True'), `${s} has an earlier number as a prefix. The numbers are not prefix-free.`, { current: index, digit: -1, consumed: k, result: false })
        return { input: { numbers }, result: false, frames }
      }
      const d = s[k]
      if (!node.children.has(d)) node.children.set(d, newNode())
      node = node.children.get(d)
      push('walk', L('child of node for d'), P("node = node['children']"), `Digit ${d} of ${s}: step to its child.`, { current: index, digit: d, consumed: k + 1, result: null })
    }
    if (node.end || node.children.size > 0) {
      const reason = node.end ? `${s} is already a number.` : `${s} is a prefix of a longer number.`
      push('conflict', L('has children, return false'), P('or node'), reason, { current: index, digit: '', consumed: s.length, result: false })
      push('done', L('return true'), P('return True'), `${reason} The numbers are not prefix-free.`, { current: index, digit: '', consumed: s.length, result: false })
      return { input: { numbers }, result: false, frames }
    }
    node.end = true
    push('mark', L('mark node as the end'), P("node['end'] = True"), `${s} ends here; no number passes through it.`, { current: index, digit: '', consumed: s.length, result: null })
  }
  push('done', L('return true'), P('return True'), 'No number is a prefix of another, so the answer is true.', { current: -1, digit: '', consumed: 0, result: true })
  return { input: { numbers }, result: true, frames }
}

export const python = `def phone_prefix_free(numbers):
    root = {'children': {}, 'end': False}
    for s in numbers:
        node = root
        for d in s:
            if node['end']:
                return False
            node = node['children'].setdefault(d, {'children': {}, 'end': False})
        if node['end'] or node['children']:
            return False
        node['end'] = True
    return True
`
