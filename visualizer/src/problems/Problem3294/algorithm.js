export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with values and node.')
  const { values, node } = input
  if (!Array.isArray(values) || values.length < 1 || values.length > 10) throw new Error('values lists 1 to 10 integers in head-to-tail order.')
  if (!values.every(v => Number.isInteger(v) && v >= -99 && v <= 99)) throw new Error('Each value is an integer from -99 to 99.')
  if (!Number.isInteger(node) || node < 0 || node >= values.length) throw new Error('node is the position of the given node in values.')
  return { values, node }
}

function buildNodes(values) {
  return values.map((val, i) => ({ val, prev: i > 0 ? i - 1 : -1, next: i + 1 < values.length ? i + 1 : -1 }))
}

export const code = `FUNCTION convertFromNode(node)
    head ← node
    WHILE head.prev is not null
        head ← head.prev
    result ← empty list
    WHILE head is not null
        append head.val to result
        head ← head.next
    RETURN result`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `class Node:
    def __init__(self, val, prev=None, next=None):
        self.val = val
        self.prev = prev
        self.next = next


def convert_from_node(node):
    head = node
    while head.prev is not None:
        head = head.prev
    result = []
    while head is not None:
        result.append(head.val)
        head = head.next
    return result


def build_list(values):
    nodes = []
    for v in values:
        prev = nodes[-1] if nodes else None
        node = Node(v, prev)
        if prev is not None:
            prev.next = node
        nodes.append(node)
    return nodes


if __name__ == "__main__":
    import json
    import sys
    data = json.loads(sys.stdin.read())
    nodes = build_list(data["values"])
    print(convert_from_node(nodes[data["node"]]))
`

const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ values, node }) {
  const nodes = buildNodes(values)
  const frames = []
  const result = []
  let head = node
  frames.push({
    phase: 'start', activeLine: L('head ← node'), pythonLine: P('head = node'),
    current: node, head, result: [], nodes, message: `Start from the given node at position ${node}; its head is not known yet.`,
  })
  while (nodes[head].prev !== -1) {
    head = nodes[head].prev
    frames.push({
      phase: 'climb', activeLine: L('head ← head.prev'), pythonLine: P('head = head.prev'),
      current: head, head, result: [], nodes, message: `Follow prev back to position ${head}.`,
    })
  }
  frames.push({
    phase: 'head', activeLine: L('WHILE head.prev is not null'), pythonLine: P('while head.prev is not None'),
    current: head, head, result: [], nodes, message: `Position ${head} has no prev, so it is the head.`,
  })
  let current = head
  while (current !== -1) {
    result.push(nodes[current].val)
    frames.push({
      phase: 'collect', activeLine: L('append head.val'), pythonLine: P('result.append(head.val)'),
      current, head, result: result.slice(), nodes, message: `Append ${nodes[current].val} from position ${current}.`,
    })
    current = nodes[current].next
    frames.push({
      phase: 'advance', activeLine: L('head ← head.next'), pythonLine: P('head = head.next'),
      current, head, result: result.slice(), nodes,
      message: current === -1 ? 'Next is null, so the forward walk ends.' : `Follow next to position ${current}.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('RETURN result'), pythonLine: P('return result'),
    current: -1, head, result: result.slice(), nodes, message: `The full list is [${result.join(', ')}].`,
  })
  return { input: { values, node }, result: result.slice(), frames }
}
