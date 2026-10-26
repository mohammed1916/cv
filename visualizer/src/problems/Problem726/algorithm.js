export function parseInput(text) {
  const formula = JSON.parse(text)
  if (typeof formula !== 'string' || formula.length < 1 || formula.length > 1000 || !/^[A-Za-z0-9()]+$/.test(formula)) throw new Error('Enter a JSON string of up to 1,000 letters, digits and parentheses.')
  if (!/^[A-Z]/.test(formula)) throw new Error('A formula starts with an uppercase element symbol.')
  return formula
}

// A stack of counts, one frame per open parenthesis. Digits multiply the group they close.
export function buildTrace(formula) {
  const stack = [new Map()]
  const frames = [{ phase: 'start', depth: 1, counts: {}, activeLine: 2, message: 'One open group for the whole formula.' }]
  let i = 0
  const readNumber = () => { let s = ''; while (i < formula.length && /\d/.test(formula[i])) s += formula[i++]; return s === '' ? 1 : Number(s) }
  while (i < formula.length) {
    const ch = formula[i]
    if (ch === '(') { stack.push(new Map()); i++; frames.push({ phase: 'open', depth: stack.length, counts: obj(stack.at(-1)), activeLine: 5, message: 'Open a group.' }) }
    else if (ch === ')') {
      i++
      const times = readNumber()
      const top = stack.pop()
      for (const [atom, c] of top) stack.at(-1).set(atom, (stack.at(-1).get(atom) ?? 0) + c * times)
      frames.push({ phase: 'close', depth: stack.length, counts: obj(stack.at(-1)), activeLine: 7, message: `Close a group repeated ${times} time${times === 1 ? '' : 's'}.` })
    } else {
      let atom = ch
      i++
      while (i < formula.length && /[a-z]/.test(formula[i])) atom += formula[i++]
      const times = readNumber()
      stack.at(-1).set(atom, (stack.at(-1).get(atom) ?? 0) + times)
      frames.push({ phase: 'atom', depth: stack.length, counts: obj(stack.at(-1)), activeLine: 9, message: `${atom} × ${times}.` })
    }
  }
  const top = stack[0]
  const names = [...top.keys()].sort()
  const result = names.map(a => (top.get(a) === 1 ? a : `${a}${top.get(a)}`)).join('')
  frames.push({ phase: 'done', depth: 1, counts: obj(top), result, activeLine: 12, message: `Atoms in sorted order: ${result}.` })
  return { input: formula, result, frames }
}

function obj(map) { return Object.fromEntries([...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) }

export const code = `def countOfAtoms(formula):
    stack, i = [Counter()], 0
    while i < len(formula):
        if formula[i] == '(':
            stack.append(Counter()); i += 1
        elif formula[i] == ')':
            i += 1; times, i = read_number(formula, i)
            top = stack.pop()
            for atom, c in top.items(): stack[-1][atom] += c * times
        else:
            atom, i = read_atom(formula, i)
            times, i = read_number(formula, i)
            stack[-1][atom] += times
    return ''.join(a + (str(c) if c > 1 else '') for a, c in sorted(stack[0].items()))`.split('\n').map((text, index) => ({ line: index + 1, text }))
