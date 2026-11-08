// Independently written teaching model. The sample strings are invented for this visualizer.
export const phases = [
  { id: 'start', label: 'Start', description: 'Read the string with no open brackets waiting for a partner.' },
  { id: 'inspect', label: 'Match', description: 'Each opener waits on a stack; each closer pairs with the nearest waiting opener or is marked.' },
  { id: 'update', label: 'Mark', description: 'Brackets that cannot be paired are marked for removal.' },
  { id: 'done', label: 'Result', description: 'Rebuild the string without the marked brackets.' },
]

export const inputLabel = 'Text of lowercase letters and parentheses (up to 40 characters)'
export const complexity = 'O(n) time and O(n) space for the stack and marks. The visualizer caps the text at 40 characters.'
export const examples = [
  { label: 'Mixed', input: 'a)b(c)d(' },
  { label: 'Closers', input: '))((' },
  { label: 'Nested', input: '(a(b)c)' },
  { label: 'Single letter', input: 'a' },
  { label: 'Letter inside one pair', input: '(a)' },
  { label: 'Only opening brackets', input: '(((' },
  { label: 'Longest allowed input', input: '((((((((((((((((((((a)))))))))))))))))))' },
  { label: 'Long run: forty mixed characters', input: 'aa(bbaabb)a(aa(ab))(aaaba(aab()bab)()b(a' },
]

export const code = `function minRemoveToMakeValid(s) {
  const openers = []
  const remove = new Set()
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(') openers.push(i)
    else if (ch === ')') {
      if (openers.length > 0) openers.pop()
      else remove.add(i)
    }
  }
  for (const i of openers) remove.add(i)
  return [...s].filter((_, i) => !remove.has(i)).join('')
}`

export const python = `def min_remove_to_valid(s):
    openers = []
    remove = set()
    for i, ch in enumerate(s):
        if ch == '(':
            openers.append(i)
        elif ch == ')':
            if openers:
                openers.pop()
            else:
                remove.add(i)
    remove.update(openers)
    return ''.join(ch for i, ch in enumerate(s) if i not in remove)`

const at = (source, key) => {
  const index = source.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing solution line: ${key}`)
  return index + 1
}
const CODE_LINE = key => at(code, key)
const PY_LINE = key => at(python, key)

export function parseInput(text) {
  const s = text.trim()
  if (s.length < 1 || s.length > 40) throw new Error('Use 1 to 40 characters.')
  if (!/^[a-z()]+$/.test(s)) throw new Error('Use only lowercase letters, "(" and ")".')
  return s
}

export function buildTrace(s) {
  const frames = []
  const openers = []
  const remove = new Set()
  const marks = () => [...remove].sort((a, b) => a - b)
  const push = (phase, key, pyKey, message, position, extra = {}) => frames.push({
    phase, activeLine: CODE_LINE(key), pythonLine: PY_LINE(pyKey), message,
    text: s, position, openers: [...openers], remove: marks(), ...extra,
  })

  push('start', 'const openers = []', 'openers = []', `Read ${s.length} characters. Letters are always kept; only parentheses can be marked.`, -1)
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(') {
      openers.push(i)
      push('inspect', 'openers.push(i)', 'openers.append(i)', `Position ${i} is "(". It waits on the stack for a closer.`, i)
    } else if (ch === ')') {
      if (openers.length) {
        const partner = openers.pop()
        push('inspect', 'openers.pop()', 'openers.pop()', `Position ${i} is ")" and pairs with the "(" at ${partner}. That pair stays.`, i)
      } else {
        remove.add(i)
        push('update', 'remove.add(i)', 'remove.add(i)', `Position ${i} is ")" with no waiting "(", so it is marked for removal.`, i)
      }
    } else {
      push('inspect', 'for (let i = 0', 'for i, ch', `Position ${i} is the letter ${ch}. Letters are always kept.`, i)
    }
  }

  for (const leftover of [...openers]) {
    remove.add(leftover)
  }
  if (openers.length) {
    push('update', 'for (const i of openers)', 'remove.update(openers)', `${openers.length} "(" remain on the stack without a partner, at position${openers.length > 1 ? 's' : ''} ${openers.join(', ')}. Mark ${openers.length > 1 ? 'them' : 'it'} for removal.`, -1)
  }

  const result = [...s].filter((_, i) => !remove.has(i)).join('')
  push('done', 'return [...s].filter', 'return', `Removing ${remove.size} bracket${remove.size === 1 ? '' : 's'} gives "${result}".`, -1, { result })
  return { input: s, result, frames }
}
