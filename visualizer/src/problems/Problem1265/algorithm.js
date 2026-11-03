// LeetCode 1265: Print Immutable Linked List in Reverse. The list is read only: the algorithm may
// call getNext() and printValue() and nothing else. It walks forward once, pushing each node on a
// stack, then pops the stack so the nodes print last to first, each exactly once.
const MAX_NODES = 12

export const phases = [
  { id: 'setup', label: 'List', description: 'Read the immutable list.' },
  { id: 'walk', label: 'Walk', description: 'Push each node as it is reached.' },
  { id: 'pop', label: 'Print', description: 'Pop the last pushed node and print it.' },
  { id: 'done', label: 'Done', description: 'Every node has printed once.' },
]

export const code = `FUNCTION printInReverse(head)
    stack ← empty list
    node ← head
    WHILE node is not empty
        push node onto stack; node ← node.getNext()
    WHILE stack is not empty
        node ← pop from stack; node.printValue()`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `class ImmutableListNode:
    def __init__(self, value, next_node=None):
        self._value = value
        self._next = next_node

    def printValue(self):
        print(self._value)

    def getNext(self):
        return self._next


def print_in_reverse(head):
    stack = []
    node = head
    while node is not None:
        stack.append(node)
        node = node.getNext()
    while stack:
        stack.pop().printValue()


if __name__ == "__main__":
    import sys, json
    values = json.loads(sys.stdin.read())
    head = None
    for value in reversed(values):
        head = ImmutableListNode(value, head)
    print_in_reverse(head)
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const values = typeof text === 'string' ? JSON.parse(text) : text
  if (!Array.isArray(values) || values.length < 1 || values.length > MAX_NODES) throw new Error(`Use a list of 1 to ${MAX_NODES} integers.`)
  if (!values.every(Number.isInteger)) throw new Error('Every node value is an integer.')
  return values
}

// The list is exposed only through two methods, as on LeetCode; the trace never reads node fields.
function makeList(values, printed) {
  const nodes = values.map((value, index) => ({
    printValue: () => { printed.push(value) },
    getNext: () => nodes[index + 1] ?? null,
  }))
  return nodes[0] ?? null
}

export function buildTrace(values) {
  const frames = []
  const printed = []
  const head = makeList(values, printed)
  const stack = []
  let index = 0
  let node = head
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    values: values.slice(), walked: index, stack: stack.map(entry => entry.index), current: null, popped: null,
    printed: printed.slice(), ...extra,
  })
  emit('setup', 'stack ← empty list', 'stack = []', `A list of ${values.length} node${values.length === 1 ? '' : 's'}, read only.`)
  while (node !== null) {
    stack.push({ index, node })
    emit('walk', 'push node onto stack', 'stack.append(node)', `Push node ${index} (value ${values[index]}).`, { current: index, walked: index + 1 })
    node = node.getNext()
    index += 1
  }
  while (stack.length) {
    const { index: popped, node: target } = stack.pop()
    target.printValue()
    emit('pop', 'node ← pop from stack; node.printValue()', 'stack.pop().printValue()', `Pop node ${popped} and print ${values[popped]}.`, { popped, walked: values.length })
  }
  emit('done', 'WHILE stack is not empty', 'while stack:', `All ${values.length} node${values.length === 1 ? '' : 's'} printed in reverse.`, { walked: values.length })
  return { input: values.slice(), result: printed.slice(), frames }
}
