const NAME = /^[a-z]{1,12}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  const { king, operations } = input ?? {}
  if (typeof king !== 'string' || !NAME.test(king)) throw new Error('king is a lowercase name of 1 to 12 letters.')
  if (!Array.isArray(operations) || operations.length < 1 || operations.length > 20) throw new Error('operations is a list of 1 to 20 calls.')
  const known = new Set([king])
  for (const op of operations) {
    if (op[0] === 'birth' && op.length === 3) {
      if (!known.has(op[1])) throw new Error(`Parent ${op[1]} must already be in the family.`)
      if (typeof op[2] !== 'string' || !NAME.test(op[2]) || known.has(op[2])) throw new Error(`Child ${op[2]} must be a new lowercase name.`)
      known.add(op[2])
    } else if (op[0] === 'death' && op.length === 2) {
      if (!known.has(op[1])) throw new Error(`${op[1]} must already be in the family.`)
    } else if (op[0] === 'order' && op.length === 1) {
      // no arguments
    } else {
      throw new Error('Operations are ["birth", parent, child], ["death", name] or ["order"].')
    }
  }
  return { king, operations }
}

export function buildTrace(input) {
  const { king, operations } = input
  const children = new Map([[king, []]])
  const alive = new Set([king])
  const answers = []
  const snapshot = () => {
    const build = name => ({ name, alive: alive.has(name), children: children.get(name).map(build) })
    return build(king)
  }
  const frames = [{ phase: 'start', pythonLine: 3, activeLine: L('const children = new Map'), op: null, visit: null, answer: null, family: snapshot(), message: `${king} is the king and is alive.` }]
  for (const op of operations) {
    if (op[0] === 'birth') {
      children.get(op[1]).push(op[2])
      children.set(op[2], [])
      alive.add(op[2])
      frames.push({ phase: 'birth', pythonLine: 14, activeLine: L("op[0] === 'birth'"), op, visit: null, answer: null, family: snapshot(), message: `${op[2]} is born to ${op[1]} and becomes the youngest child.` })
    } else if (op[0] === 'death') {
      alive.delete(op[1])
      frames.push({ phase: 'death', pythonLine: 16, activeLine: L("op[0] === 'death'"), op, visit: null, answer: null, family: snapshot(), message: `${op[1]} dies and is skipped in future orders.` })
    } else {
      const order = []
      const walk = name => {
        if (alive.has(name)) order.push(name)
        frames.push({ phase: 'walk', pythonLine: alive.has(name) ? 7 : 6, activeLine: L('if (alive.has(name))'), op, visit: name, answer: null, family: snapshot(), message: `Visit ${name}${alive.has(name) ? ', who is alive, so add the name' : ', who is dead, so skip the name'}.` })
        for (const child of children.get(name)) walk(child)
      }
      walk(king)
      answers.push(order)
      frames.push({ phase: 'order', pythonLine: 20, activeLine: L('walk(king, out)'), op, visit: null, answer: order, family: snapshot(), message: `Inheritance order: ${order.join(', ')}.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: 21, activeLine: L('return answers'), op: null, visit: null, answer: null, family: snapshot(), message: `${answers.length} order request(s) answered.` })
  return { input, result: answers, frames }
}

export const code = [
  "function throneInheritance(king, operations) {",
  "  const children = new Map([[king, []]]);",
  "  const alive = new Set([king]);",
  "  const answers = [];",
  "  const walk = (name, out) => {",
  "    if (alive.has(name)) out.push(name);",
  "    for (const child of children.get(name)) walk(child, out);",
  "  };",
  "  for (const op of operations) {",
  "    if (op[0] === 'birth') {",
  "      children.get(op[1]).push(op[2]);",
  "      children.set(op[2], []);",
  "      alive.add(op[2]);",
  "    } else if (op[0] === 'death') {",
  "      alive.delete(op[1]);",
  "    } else {",
  "      const out = [];",
  "      walk(king, out);",
  "      answers.push(out);",
  "    }",
  "  }",
  "  return answers;",
  "}",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def throne_inheritance(king, operations):
    children = {king: []}
    alive = {king: True}
    answers = []
    def walk(name, out):
        if alive[name]:
            out.append(name)
        for child in children[name]:
            walk(child, out)
    for op in operations:
        if op[0] == 'birth':
            children[op[1]].append(op[2])
            children[op[2]] = []
            alive[op[2]] = True
        elif op[0] == 'death':
            alive[op[1]] = False
        else:
            out = []
            walk(king, out)
            answers.append(out)
    return answers
`
