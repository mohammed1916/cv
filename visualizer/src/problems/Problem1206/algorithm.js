const OPERATIONS = ['add', 'search', 'erase']

export function parseInput(text) {
  let obj
  try { obj = typeof text === 'string' ? JSON.parse(text) : text } catch { throw new Error('Use a JSON object like {"operations":["add","search"],"args":[1,1]}.') }
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.operations) || !Array.isArray(obj.args)) {
    throw new Error('Use an object with operations and args arrays of the same length.')
  }
  if (obj.operations.length < 1 || obj.operations.length > 40) throw new Error('This visualization accepts 1 to 40 calls.')
  if (obj.args.length !== obj.operations.length) throw new Error('operations and args must have the same length.')
  obj.operations.forEach((op, index) => {
    if (!OPERATIONS.includes(op)) throw new Error(`Operation ${index} must be "add", "search" or "erase".`)
    const num = obj.args[index]
    if (!Number.isInteger(num) || num < 0 || num > 20000) throw new Error(`Argument ${index} must be an integer from 0 to 20000.`)
  })
  return { operations: obj.operations, args: obj.args }
}

export const code = [
  { line: 1, text: 'start with an empty skiplist whose bottom level is a sorted list' },
  { line: 2, text: 'for each operation and its argument num, in order:' },
  { line: 3, text: '  if operation is add: insert num at its sorted position (duplicates kept)' },
  { line: 4, text: '  if operation is search: result = whether num is present' },
  { line: 5, text: '  if operation is erase: remove one copy of num if present; result = whether one was removed' },
  { line: 6, text: 'return the list of results' },
]

export const python = `class Node:
    def __init__(self, val, level):
        self.val = val
        self.next = [None] * level

class Skiplist:
    MAX_LEVEL = 16

    def __init__(self):
        self.head = Node(None, self.MAX_LEVEL)
        self.level = 1
        self.inserted = 0

    def _random_level(self):
        self.inserted += 1
        level = 1
        k = self.inserted
        while k % 2 == 0 and level < self.MAX_LEVEL:
            level += 1
            k //= 2
        return level

    def search(self, target):
        node = self.head
        for i in range(self.level - 1, -1, -1):
            while node.next[i] and node.next[i].val < target:
                node = node.next[i]
        node = node.next[0]
        return node is not None and node.val == target

    def add(self, num):
        update = [self.head] * self.MAX_LEVEL
        node = self.head
        for i in range(self.level - 1, -1, -1):
            while node.next[i] and node.next[i].val < num:
                node = node.next[i]
            update[i] = node
        lvl = self._random_level()
        if lvl > self.level:
            for i in range(self.level, lvl):
                update[i] = self.head
            self.level = lvl
        new = Node(num, lvl)
        for i in range(lvl):
            new.next[i] = update[i].next[i]
            update[i].next[i] = new

    def erase(self, num):
        update = [self.head] * self.MAX_LEVEL
        node = self.head
        for i in range(self.level - 1, -1, -1):
            while node.next[i] and node.next[i].val < num:
                node = node.next[i]
            update[i] = node
        target = node.next[0]
        if target is None or target.val != num:
            return False
        for i in range(len(target.next)):
            if update[i].next[i] is target:
                update[i].next[i] = target.next[i]
        while self.level > 1 and self.head.next[self.level - 1] is None:
            self.level -= 1
        return True

def skiplistOperations(operations, args):
    sl = Skiplist()
    results = []
    for op, num in zip(operations, args):
        if op == "add":
            sl.add(num)
            results.append(None)
        elif op == "search":
            results.append(sl.search(num))
        elif op == "erase":
            results.append(sl.erase(num))
    return results`

export const pythonLineMap = { 1: 66, 2: 68, 3: 70, 4: 73, 5: 75, 6: 76 }

function lowerBound(list, value) {
  let lo = 0
  let hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (list[mid] < value) lo = mid + 1
    else hi = mid
  }
  return lo
}

export function buildTrace(input) {
  const { operations, args } = parseInput(input)
  const values = []
  const results = []
  const frames = []
  const push = (phase, activeLine, message, extra = {}) =>
    frames.push({ phase, activeLine, message, values: [...values], results: [...results], ...extra })

  push('start', 1, 'Start with an empty skiplist. The bottom level is an empty sorted list.')
  operations.forEach((op, index) => {
    const num = args[index]
    if (op === 'add') {
      const at = lowerBound(values, num)
      values.splice(at, 0, num)
      results.push(null)
      push('add', 3, `add(${num}): insert at sorted position ${at}. Duplicates are kept.`, { touched: at, call: index })
    } else if (op === 'search') {
      const at = values.indexOf(num)
      results.push(at !== -1)
      push('search', 4, `search(${num}): ${at !== -1 ? 'found' : 'not found'}.`, { touched: at, call: index })
    } else {
      const at = values.indexOf(num)
      if (at !== -1) values.splice(at, 1)
      results.push(at !== -1)
      push('erase', 5, `erase(${num}): ${at !== -1 ? 'removed one copy' : 'not present, so return false'}.`, { touched: at, call: index })
    }
  })
  push('done', 6, `Return the ${results.length} results.`, { result: [...results] })
  return { input: { operations, args }, result: [...results], frames }
}
