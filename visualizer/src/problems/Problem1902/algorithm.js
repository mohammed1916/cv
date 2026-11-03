// Insert each value into a binary search tree in the order given. A value goes left of a node
// when it is smaller and right otherwise. The answer is the largest depth reached, with the root at depth 1.

const INT = v => Number.isInteger(v) && v >= 0 && v <= 99

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 1 || input.length > 15) {
    throw new Error('Use a JSON list of 1 to 15 integers (visualization cap).')
  }
  if (!input.every(INT)) throw new Error('Each value is an integer from 0 to 99 (visualization cap).')
  if (new Set(input).size !== input.length) throw new Error('Values must be distinct.')
  return input
}

export function buildTrace(values) {
  const frames = []
  const nodes = []
  const byVal = new Map()
  let root = null
  let best = 0
  const snap = fields => frames.push({ nodes: nodes.map(n => ({ ...n })), root, best, value: null, path: [], attached: null, cur: null, ...fields })

  snap({ phase: 'start', pythonLine: PL('depth_of = {}'), activeLine: L('root = none'), message: `Insert ${values.length} distinct values into an empty tree, in order.` })

  for (const value of values) {
    snap({ phase: 'insert', value, pythonLine: PL('for value in values'), activeLine: L('for each value in the order given'), message: `Next value ${value}.` })
    if (root === null) {
      const node = { val: value, parent: null, side: null, depth: 1 }
      nodes.push(node)
      byVal.set(value, node)
      root = value
      best = Math.max(best, 1)
      snap({ phase: 'root', value, attached: value, pythonLine: PL('root = value'), activeLine: L('make value the root'), message: `${value} becomes the root at depth 1.` })
      continue
    }
    let cur = root
    const path = []
    for (;;) {
      path.push(cur)
      const side = value < cur ? 'left' : 'right'
      snap({ phase: 'compare', value, cur, path: [...path], pythonLine: PL('if value < cur:'), activeLine: L('if value is less than cur'), message: `${value} is ${side === 'left' ? 'less than' : 'not less than'} ${cur}, so go ${side}.` })
      const child = nodes.find(n => n.parent === cur && n.side === side)
      if (!child) {
        const depth = byVal.get(cur).depth + 1
        const node = { val: value, parent: cur, side, depth }
        nodes.push(node)
        byVal.set(value, node)
        best = Math.max(best, depth)
        snap({ phase: 'attach', value, cur, path: [...path], attached: value, pythonLine: PL(side === 'left' ? 'left[cur] = value' : 'right[cur] = value'), activeLine: L('then attach value there'), message: `${value} attaches ${side} of ${cur} at depth ${depth}.` })
        break
      }
      cur = child.val
    }
  }

  snap({ phase: 'done', pythonLine: PL('return best'), activeLine: L('return best'), message: `Deepest node sits at depth ${best}.` })
  return { input: values, result: best, frames }
}

export const code = `depth of a binary search tree built by inserting values in order
  root = none and best = 0
  for each value in the order given
    if root is none then make value the root with depth 1
    else
      cur = root
      repeat
        if value is less than cur then go to the left side else the right side
        if that child is empty then attach value there and stop
        cur = that child
      depth of value = depth of cur plus 1
    best = maximum of best and the depth of value
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

function L(s) {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return i + 1
}

export const python = `def bst_depth(values):
    left = {}
    right = {}
    depth_of = {}
    root = None
    best = 0
    for value in values:
        if root is None:
            root = value
            depth_of[value] = 1
        else:
            cur = root
            while True:
                if value < cur:
                    if cur not in left:
                        left[cur] = value
                        break
                    cur = left[cur]
                else:
                    if cur not in right:
                        right[cur] = value
                        break
                    cur = right[cur]
            depth_of[value] = depth_of[cur] + 1
        best = max(best, depth_of[value])
    return best
`

function PL(s) {
  const i = python.split('\n').findIndex(line => line.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
