export function parseInput(text) {
  const formula = JSON.parse(text)
  if (typeof formula !== 'string' || formula.length < 1 || formula.length > 1000 || !/^[A-Za-z0-9()]+$/.test(formula)) throw new Error('Enter a JSON string of up to 1,000 letters, digits and parentheses.')
  if (!/^[A-Z]/.test(formula)) throw new Error('A formula starts with an uppercase element symbol.')
  return formula
}

// A stack of counts, one frame per open parenthesis. Digits multiply the group they close.
export function buildTrace(formula) {
  const stack = [new Map()]
  const frames = [{ phase: 'start', pythonLine: 16, depth: 1, counts: {}, activeLine: 1, message: 'One open group for the whole formula.' }]
  let i = 0
  const readNumber = () => { let s = ''; while (i < formula.length && /\d/.test(formula[i])) s += formula[i++]; return s === '' ? 1 : Number(s) }
  while (i < formula.length) {
    const ch = formula[i]
    if (ch === '(') { stack.push(new Map()); i++; frames.push({ phase: 'open', pythonLine: 19, depth: stack.length, counts: obj(stack.at(-1)), activeLine: 3, message: 'Open a group.' }) }
    else if (ch === ')') {
      i++
      const times = readNumber()
      const top = stack.pop()
      for (const [atom, c] of top) stack.at(-1).set(atom, (stack.at(-1).get(atom) ?? 0) + c * times)
      frames.push({ phase: 'close', pythonLine: 26, depth: stack.length, counts: obj(stack.at(-1)), activeLine: 5, message: `Close a group repeated ${times} time${times === 1 ? '' : 's'}.` })
    } else {
      let atom = ch
      i++
      while (i < formula.length && /[a-z]/.test(formula[i])) atom += formula[i++]
      const times = readNumber()
      stack.at(-1).set(atom, (stack.at(-1).get(atom) ?? 0) + times)
      frames.push({ phase: 'atom', pythonLine: 30, depth: stack.length, counts: obj(stack.at(-1)), activeLine: 7, message: `${atom} × ${times}.` })
    }
  }
  const top = stack[0]
  const names = [...top.keys()].sort()
  const result = names.map(a => (top.get(a) === 1 ? a : `${a}${top.get(a)}`)).join('')
  frames.push({ phase: 'done', pythonLine: 31, depth: 1, counts: obj(top), result, activeLine: 8, message: `Atoms in sorted order: ${result}.` })
  return { input: formula, result, frames }
}

function obj(map) { return Object.fromEntries([...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) }

export const code = `set stack to one empty count for the whole formula, and i to 0
while i is less than the length of formula
  if the character at i is ( then push a new empty count and advance i
  otherwise if the character at i is ) then advance past it and read the multiplier that follows
    pop the top count and add each of its atoms times the multiplier to the count below
  otherwise read the atom name, then the multiplier that follows it
    add the multiplier to that atom's count in the top group
return the bottom count sorted by atom name, writing a count only when it is above one`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import Counter

def read_number(text, i):
    end = i
    while end < len(text) and text[end].isdigit():
        end += 1
    return (int(text[i:end]) if end > i else 1), end

def read_atom(text, i):
    end = i + 1
    while end < len(text) and text[end].islower():
        end += 1
    return text[i:end], end

def count_of_atoms(formula):
    stack, i = [Counter()], 0
    while i < len(formula):
        if formula[i] == '(':
            stack.append(Counter())
            i += 1
        elif formula[i] == ')':
            i += 1
            times, i = read_number(formula, i)
            top = stack.pop()
            for atom, c in top.items():
                stack[-1][atom] += c * times
        else:
            atom, i = read_atom(formula, i)
            times, i = read_number(formula, i)
            stack[-1][atom] += times
    return ''.join(a + (str(c) if c > 1 else '') for a, c in sorted(stack[0].items()))`
