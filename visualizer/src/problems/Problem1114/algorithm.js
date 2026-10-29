const WORDS = { 1: "first", 2: "second", 3: "third" }
const METHODS = { 1: "first", 2: "second", 3: "third" }
const PRINT_LINE = { 1: 3, 2: 7, 3: 11 }
const WAIT_LINE = { 2: 6, 3: 10 }
const START_LINE = 12
const RETURN_LINE = 13

export function parseInput(text) {
  let input
  try {
    input = JSON.parse(text)
  } catch {
    throw new Error('Input must be JSON, for example {"nums":[1,2,3]}.')
  }
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error('Input must be a JSON object with a "nums" key.')
  }
  const { nums } = input
  if (!Array.isArray(nums)) throw new Error('"nums" must be an array.')
  if (nums.length !== 3) throw new Error('"nums" must contain exactly 3 values.')
  const sorted = [...nums].sort((a, b) => a - b)
  if (sorted.some((value, index) => value !== index + 1)) {
    throw new Error('"nums" must be a permutation of [1, 2, 3].')
  }
  return { nums }
}

// Threads arrive in the order given by nums. A method waits until the previous word has printed.
export function buildTrace(input) {
  const nums = input.nums
  const statuses = nums.map(() => "pending")
  const frames = []
  const order = []
  const done = new Set()
  const blocked = new Map()

  const snapshot = (phase, activeLine, message, current, extra = {}) => {
    frames.push({ phase, activeLine, message, current, printedCount: order.length, statuses: [...statuses], result: null, ...extra })
  }

  function printValue(value, index) {
    order.push(WORDS[value])
    done.add(value)
    statuses[index] = "printed"
    snapshot("print", PRINT_LINE[value], `Thread ${index + 1} prints "${WORDS[value]}".`, index)
    const next = value + 1
    if (blocked.has(next)) {
      const nextIndex = blocked.get(next)
      blocked.delete(next)
      printValue(next, nextIndex)
    }
  }

  nums.forEach((value, index) => {
    statuses[index] = "arrived"
    snapshot("arrive", START_LINE, `Thread ${index + 1} calls ${METHODS[value]}().`, index)
    if (value === 1 || done.has(value - 1)) {
      printValue(value, index)
    } else {
      statuses[index] = "waiting"
      blocked.set(value, index)
      snapshot("wait", WAIT_LINE[value], `${METHODS[value]}() waits until "${WORDS[value - 1]}" has printed.`, index)
    }
  })

  const result = order.join("")
  snapshot("done", RETURN_LINE, `Return "${result}".`, null, { result })
  return { input, result, frames, order }
}

export const python = `import threading


def print_in_order(nums):
    out = []
    lock = threading.Lock()
    first_done = threading.Event()
    second_done = threading.Event()

    def first():
        with lock:
            out.append("first")
        first_done.set()

    def second():
        first_done.wait()
        with lock:
            out.append("second")
        second_done.set()

    def third():
        second_done.wait()
        with lock:
            out.append("third")

    methods = {1: first, 2: second, 3: third}
    threads = [threading.Thread(target=methods[v]) for v in nums]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    return "".join(out)`

export const code = [
  "SHARED firstDone = false, secondDone = false",
  "METHOD first()",
  '    PRINT "first"',
  "    SET firstDone = true",
  "METHOD second()",
  "    WAIT UNTIL firstDone is true",
  '    PRINT "second"',
  "    SET secondDone = true",
  "METHOD third()",
  "    WAIT UNTIL secondDone is true",
  '    PRINT "third"',
  "START one thread per value in nums, in the order given",
  "RETURN the printed text",
].map((text, index) => ({ line: index + 1, text }))

// Maps each pseudocode activeLine used by the frames to its Python line.
export const pythonLineMap = {
  1: 7,
  2: 10,
  3: 12,
  4: 13,
  5: 15,
  6: 16,
  7: 18,
  8: 19,
  9: 21,
  10: 22,
  11: 24,
  12: 27,
  13: 32,
}
