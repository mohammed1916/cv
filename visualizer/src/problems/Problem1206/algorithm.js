const OPERATIONS = ['add', 'search', 'erase']
const MAX_LEVEL = 16

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

// The JavaScript and Python below run the same skiplist. A new node's height comes from a
// deterministic counter (every second insert is one level taller, up to 16), so the trace is repeatable.
export const code = [
  'function skiplistOperations(operations, args) {',
  '  const head = { val: null, next: Array(16).fill(null) }',
  '  let level = 1',
  '  let inserted = 0',
  '  const results = []',
  '  operations.forEach((op, call) => {',
  '    const num = args[call]',
  '    const update = Array(16).fill(head)',
  '    let node = head',
  '    for (let i = level - 1; i >= 0; i--) {',
  '      while (node.next[i] && node.next[i].val < num) node = node.next[i]',
  '      update[i] = node',
  '    }',
  "    if (op === 'add') {",
  '      inserted += 1',
  '      let lvl = 1',
  '      for (let k = inserted; k % 2 === 0 && lvl < 16; k /= 2) lvl += 1',
  '      if (lvl > level) { for (let i = level; i < lvl; i++) update[i] = head; level = lvl }',
  '      const created = { val: num, next: Array(lvl).fill(null) }',
  '      for (let i = 0; i < lvl; i++) { created.next[i] = update[i].next[i]; update[i].next[i] = created }',
  '      results.push(null)',
  "    } else if (op === 'search') {",
  '      results.push(update[0].next[0] !== null && update[0].next[0].val === num)',
  '    } else {',
  '      const target = update[0].next[0]',
  '      if (target === null || target.val !== num) { results.push(false); return }',
  '      for (let i = 0; i < target.next.length; i++) if (update[i].next[i] === target) update[i].next[i] = target.next[i]',
  '      while (level > 1 && head.next[level - 1] === null) level--',
  '      results.push(true)',
  '    }',
  '  })',
  '  return results',
  '}',
].map((text, index) => ({ line: index + 1, text }))

export const python = `class Node:
    def __init__(self, val, level):
        self.val = val
        self.next = [None] * level

def skiplist_operations(operations, args):
    head = Node(None, 16)
    level = 1
    inserted = 0
    results = []
    for call, op in enumerate(operations):
        num = args[call]
        update = [head] * 16
        node = head
        for i in range(level - 1, -1, -1):
            while node.next[i] and node.next[i].val < num:
                node = node.next[i]
            update[i] = node
        if op == "add":
            inserted += 1
            lvl = 1
            k = inserted
            while k % 2 == 0 and lvl < 16:
                lvl += 1
                k //= 2
            if lvl > level:
                for i in range(level, lvl):
                    update[i] = head
                level = lvl
            created = Node(num, lvl)
            for i in range(lvl):
                created.next[i] = update[i].next[i]
                update[i].next[i] = created
            results.append(None)
        elif op == "search":
            results.append(update[0].next[0] is not None and update[0].next[0].val == num)
        else:
            target = update[0].next[0]
            if target is None or target.val != num:
                results.append(False)
                continue
            for i in range(len(target.next)):
                if update[i].next[i] is target:
                    update[i].next[i] = target.next[i]
            while level > 1 and head.next[level - 1] is None:
                level -= 1
            results.append(True)
    return results`

export const pythonLineMap = {
  1: 6, 2: 7, 3: 8, 4: 9, 5: 10, 6: 11, 7: 12, 8: 13, 9: 14, 10: 15, 11: 16, 12: 18, 13: 18,
  14: 19, 15: 20, 16: 21, 17: 23, 18: 26, 19: 30, 20: 31, 21: 34, 22: 35, 23: 36, 24: 37,
  25: 38, 26: 40, 27: 43, 28: 45, 29: 47, 30: 47, 31: 48, 32: 48, 33: 48,
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Create an empty skiplist.' },
  { id: 'add', label: 'Add', description: 'Insert a value. Its height decides how many lanes it joins.' },
  { id: 'search', label: 'Search', description: 'Walk down from the top lane to find the value.' },
  { id: 'erase', label: 'Erase', description: 'Unlink one copy of a value if present.' },
  { id: 'done', label: 'Result', description: 'Return the results of every call.' },
]

export const inputLabel = 'Calls as JSON with operations and args (e.g. {"operations":["add","search"],"args":[1,1]})'
export const complexity = 'The real skiplist runs in expected O(log n) per call. The visualization draws every lane and accepts up to 40 calls.'
export const examples = [
  {
    label: 'Add, search, erase',
    input: JSON.stringify({
      operations: ['add', 'add', 'add', 'search', 'add', 'search', 'erase', 'erase', 'search'],
      args: [1, 2, 3, 0, 4, 1, 0, 1, 1],
    }),
  },
  { label: 'Single search on an empty list', input: '{\"operations\":[\"search\"],\"args\":[5]}' },
  { label: 'Repeated value added three times', input: '{\"operations\":[\"add\",\"add\",\"add\"],\"args\":[7,7,7]}' },
  { label: 'Largest allowed argument', input: '{\"operations\":[\"add\",\"search\",\"erase\",\"search\"],\"args\":[20000,20000,20000,20000]}' },
  { label: 'Long run: 40 mixed calls', input: '{\"operations\":[\"erase\",\"search\",\"add\",\"add\",\"add\",\"erase\",\"erase\",\"search\",\"search\",\"search\",\"erase\",\"erase\",\"search\",\"erase\",\"add\",\"erase\",\"add\",\"add\",\"search\",\"search\",\"search\",\"search\",\"search\",\"erase\",\"search\",\"add\",\"erase\",\"add\",\"search\",\"search\",\"search\",\"search\",\"erase\",\"erase\",\"add\",\"search\",\"add\",\"add\",\"add\",\"search\"],\"args\":[134,62,72,104,173,124,156,125,129,20,62,146,18,141,123,20,137,92,101,53,196,7,17,44,109,22,20,91,62,108,127,160,24,73,24,9,136,124,135,93]}' },
]

const LINE = { start: 2, add: 20, search: 23, erase: 27, done: 32 }

function laneSnapshot(head, level, path, target, op) {
  const levels = []
  for (let i = 0; i < level; i++) {
    const row = []
    for (let node = head.next[i]; node !== null; node = node.next[i]) row.push(node.val)
    levels.push(row)
  }
  return { levels, values: levels[0] ?? [], path: path.map(p => ({ ...p })), target, op }
}

export function buildTrace(input) {
  const { operations, args } = parseInput(input)
  const head = { val: null, next: Array(MAX_LEVEL).fill(null) }
  let level = 1
  let inserted = 0
  const results = []
  const frames = []
  const push = (phase, activeLine, message, extra) => {
    const snapshot = { ...laneSnapshot(head, level, extra.path ?? [], extra.target ?? null, extra.op ?? null), results: [...results] }
    frames.push({ phase, activeLine, message, values: snapshot.levels[0] ?? [], results: [...results], snapshot, touched: extra.touched ?? -1, call: extra.call ?? null })
  }

  push('start', LINE.start, 'Start with an empty skiplist. The bottom lane is an empty sorted list.', { path: [] })
  operations.forEach((op, call) => {
    const num = args[call]
    const update = Array(MAX_LEVEL).fill(head)
    const path = []
    let node = head
    for (let i = level - 1; i >= 0; i--) {
      while (node.next[i] && node.next[i].val < num) {
        node = node.next[i]
        path.push({ val: node.val, lane: i })
      }
      update[i] = node
    }
    if (op === 'add') {
      inserted += 1
      let lvl = 1
      for (let k = inserted; k % 2 === 0 && lvl < MAX_LEVEL; k /= 2) lvl += 1
      if (lvl > level) {
        for (let i = level; i < lvl; i++) update[i] = head
        level = lvl
      }
      const created = { val: num, next: Array(lvl).fill(null) }
      for (let i = 0; i < lvl; i++) {
        created.next[i] = update[i].next[i]
        update[i].next[i] = created
      }
      results.push(null)
      push('add', LINE.add, `add(${num}): the new node has height ${lvl} and joins lanes 0 to ${lvl - 1}. Duplicates are kept.`, { path, target: num, op, touched: lvl, call })
    } else if (op === 'search') {
      const found = update[0].next[0] !== null && update[0].next[0].val === num
      results.push(found)
      push('search', LINE.search, `search(${num}): ${found ? 'found' : 'not found'} on the bottom lane.`, { path, target: num, op, call })
    } else {
      const target = update[0].next[0]
      if (target === null || target.val !== num) {
        results.push(false)
        push('erase', LINE.erase, `erase(${num}): not present, so return false.`, { path, target: num, op, call })
        return
      }
      for (let i = 0; i < target.next.length; i++) {
        if (update[i].next[i] === target) update[i].next[i] = target.next[i]
      }
      while (level > 1 && head.next[level - 1] === null) level--
      results.push(true)
      push('erase', LINE.erase, `erase(${num}): unlink it from every lane it joined, and return true.`, { path, target: num, op, call })
    }
  })
  frames.push({
    phase: 'done', activeLine: LINE.done, message: `Return the ${results.length} results.`,
    values: laneSnapshot(head, level, [], null, null).values, results: [...results], snapshot: { ...laneSnapshot(head, level, [], null, null), results: [...results] }, touched: -1, call: null,
  })
  return { input: { operations, args }, result: [...results], frames }
}
