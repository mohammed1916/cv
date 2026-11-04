export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length > 10) throw new Error('Use a JSON array of up to 10 integers (the list in forward order).')
  if (!values.every(v => Number.isInteger(v) && v >= -99 && v <= 99)) throw new Error('Each value is an integer from -99 to 99.')
  return values
}

// Build the doubly linked list: each node knows its previous and next neighbour by index.
function buildNodes(values) {
  return values.map((val, i) => ({ val, prev: i > 0 ? i - 1 : -1, next: i + 1 < values.length ? i + 1 : -1 }))
}

export const code = `function convertToArray(head) {
  const result = []
  let node = head
  while (node !== null) {
    result.push(node.val)
    node = node.next
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

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


def convert_to_array(head):
    result = []
    node = head
    while node is not None:
        result.append(node.val)
        node = node.next
    return result


def build_list(values):
    head = None
    prev = None
    for v in values:
        node = Node(v, prev)
        if prev is not None:
            prev.next = node
        else:
            head = node
        prev = node
    return head


if __name__ == "__main__":
    import json
    import sys
    print(convert_to_array(build_list(json.loads(sys.stdin.read()))))
`

const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace(values) {
  const nodes = buildNodes(values)
  const frames = []
  const result = []
  let current = values.length ? 0 : -1
  frames.push({
    phase: 'start', activeLine: L('let node = head'), pythonLine: P('node = head'),
    current, result: [], nodes, message: values.length ? 'Start at the head, the first node in the list.' : 'The list is empty, so the head is null.',
  })
  while (current !== -1) {
    frames.push({
      phase: 'check', activeLine: L('while (node !== null)'), pythonLine: P('while node is not None'),
      current, result: result.slice(), nodes, message: `The node at position ${current} exists, so keep going.`,
    })
    result.push(nodes[current].val)
    frames.push({
      phase: 'append', activeLine: L('result.push(node.val)'), pythonLine: P('result.append(node.val)'),
      current, result: result.slice(), nodes, message: `Append ${nodes[current].val} to the result.`,
    })
    current = nodes[current].next
    frames.push({
      phase: 'advance', activeLine: L('node = node.next'), pythonLine: P('node = node.next'),
      current, result: result.slice(), nodes,
      message: current === -1 ? 'The next pointer is null, so the walk ends.' : `Follow next to position ${current}.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return result'), pythonLine: P('return result'),
    current: -1, result: result.slice(), nodes, message: `The array is [${result.join(', ')}].`,
  })
  return { input: values, result: result.slice(), frames }
}
