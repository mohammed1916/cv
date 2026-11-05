export function parseInput(text) {
  const formula = JSON.parse(text)
  if (typeof formula !== 'string' || formula.length < 1 || formula.length > 1000 || !/^[A-Za-z0-9()]+$/.test(formula)) throw new Error('Enter a JSON string of up to 1,000 letters, digits and parentheses.')
  if (!/^[A-Z]/.test(formula)) throw new Error('A formula starts with an uppercase element symbol.')
  return formula
}

const JS_LINES = [
  'function countOfAtoms(formula) {',
  '  const stack = [new Map()] // stack of counts: the bottom map holds the whole formula',
  '  let i = 0',
  '  while (i < formula.length) {',
  '    const ch = formula[i]',
  '    if (ch === \'(\') { stack.push(new Map()); i++ } // open a group',
  '    else if (ch === \')\') { // close a group and read its multiplier',
  '      const top = stack.pop()',
  '      const [count, next] = readNumber(formula, i + 1)',
  '      i = next',
  '      for (const [name, n] of top) stack[stack.length - 1].set(name, (stack[stack.length - 1].get(name) ?? 0) + n * count)',
  '    } else { // an element: uppercase letter then lowercase letters',
  '      const [name, afterName] = readName(formula, i)',
  '      const [count, next] = readNumber(formula, afterName)',
  '      stack[stack.length - 1].set(name, (stack[stack.length - 1].get(name) ?? 0) + count)',
  '      i = next',
  '    }',
  '  }',
  '  return formatCounts(stack[0]) // sort names and print counts above 1',
  '}',
]
const PY_LINES = [
  'def count_of_atoms(formula):',
  '    stack = [{}]',
  '    i = 0',
  '    while i < len(formula):',
  '        ch = formula[i]',
  '        if ch == \'(\':',
  '            stack.append({})',
  '            i += 1',
  '        elif ch == \')\':',
  '            top = stack.pop()',
  '            count, i = read_number(formula, i + 1)',
  '            for name, n in top.items():',
  '                stack[-1][name] = stack[-1].get(name, 0) + n * count',
  '        else:',
  '            name, after_name = read_name(formula, i)',
  '            count, i = read_number(formula, after_name)',
  '            stack[-1][name] = stack[-1].get(name, 0) + count',
  '    return format_counts(stack[0])',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

function readName(s, i) {
  let j = i + 1
  while (j < s.length && s[j] >= 'a' && s[j] <= 'z') j++
  return [s.slice(i, j), j]
}
function readNumber(s, i) {
  let j = i
  while (j < s.length && s[j] >= '0' && s[j] <= '9') j++
  return [j === i ? 1 : Number(s.slice(i, j)), j]
}
function formatCounts(map) {
  return [...map.keys()].sort().map(name => name + (map.get(name) > 1 ? map.get(name) : '')).join('')
}
const snapshot = stack => stack.map(level => [...level.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([name, n]) => `${name}${n > 1 ? n : ''}`).join(' ') || '(none)')

// The stack holds one count map per open group. A closing parenthesis multiplies its map by the number after it and merges it into the parent.
export function buildTrace(formula) {
  const stack = [new Map()]
  let i = 0
  const frames = [{ phase: 'start', position: 0, depth: 1, levels: snapshot(stack), activeLine: L('const stack'), pythonLine: P('stack = [{}]'), message: 'The outer level counts atoms for the whole formula.' }]
  while (i < formula.length) {
    const ch = formula[i]
    if (ch === '(') {
      stack.push(new Map())
      frames.push({ phase: 'open', position: i, depth: stack.length, levels: snapshot(stack), activeLine: L('stack.push(new Map())'), pythonLine: P('stack.append({})'), message: `"(" opens a group; the group gets its own count level (depth ${stack.length}).` })
      i++
    } else if (ch === ')') {
      const top = stack.pop()
      const [count, next] = readNumber(formula, i + 1)
      for (const [name, n] of top) stack[stack.length - 1].set(name, (stack[stack.length - 1].get(name) ?? 0) + n * count)
      frames.push({ phase: 'close', position: i, depth: stack.length, levels: snapshot(stack), activeLine: L('const [count, next] = readNumber(formula, i + 1)'), pythonLine: P('count, i = read_number(formula, i + 1)'), message: `")" closes the group and multiplies it by ${count}; its atoms are added to the level above.` })
      i = next
    } else {
      const [name, afterName] = readName(formula, i)
      const [count, next] = readNumber(formula, afterName)
      stack[stack.length - 1].set(name, (stack[stack.length - 1].get(name) ?? 0) + count)
      frames.push({ phase: 'atom', position: i, depth: stack.length, levels: snapshot(stack), activeLine: L('const [name, afterName]'), pythonLine: P('name, after_name = read_name'), message: `${name}${count > 1 ? count : ''} is added to the current level.` })
      i = next
    }
  }
  const result = formatCounts(stack[0])
  frames.push({ phase: 'done', position: formula.length, depth: 1, levels: snapshot(stack), result, activeLine: L('return formatCounts'), pythonLine: P('return format_counts'), message: `Atoms in sorted order: ${result}.` })
  return { input: formula, result, frames }
}
