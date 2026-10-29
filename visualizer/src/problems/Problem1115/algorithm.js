const FOO_WAIT_LINE = 3
const FOO_PRINT_LINE = 4
const BAR_WAIT_LINE = 7
const BAR_PRINT_LINE = 8
const START_LINE = 10
const RETURN_LINE = 11

export function parseInput(text) {
  let input
  try {
    input = JSON.parse(text)
  } catch {
    throw new Error('Input must be JSON, for example {"n":2}.')
  }
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error('Input must be a JSON object with an "n" key.')
  }
  const { n } = input
  if (!Number.isInteger(n)) throw new Error('"n" must be an integer.')
  if (n < 1 || n > 1000) throw new Error('"n" must be between 1 and 1000.')
  return { n }
}

// foo() and bar() alternate through two permits: fooPermit starts available, barPermit starts empty.
export function buildTrace(input) {
  const { n } = input
  const frames = []
  const tokens = []
  let fooPermit = true
  let barPermit = false

  const snapshot = (phase, activeLine, message, round) => {
    frames.push({ phase, activeLine, message, round, fooPermit, barPermit, printedCount: tokens.length, result: null })
  }

  snapshot("setup", 1, "Set fooPermit to 1 and barPermit to 0.", 0)
  snapshot("start", START_LINE, "Start the foo thread and the bar thread.", 0)
  for (let round = 1; round <= n; round++) {
    fooPermit = false
    snapshot("foo", FOO_WAIT_LINE, `Round ${round}: foo acquires its permit.`, round)
    tokens.push("foo")
    barPermit = true
    snapshot("foo", FOO_PRINT_LINE, `Foo prints "foo" and releases bar.`, round)
    barPermit = false
    snapshot("bar", BAR_WAIT_LINE, `Round ${round}: bar acquires its permit.`, round)
    tokens.push("bar")
    fooPermit = true
    snapshot("bar", BAR_PRINT_LINE, `Bar prints "bar" and releases foo.`, round)
  }
  const result = tokens.join("")
  snapshot("done", RETURN_LINE, `Return "${result}".`, n)
  frames[frames.length - 1].result = result
  return { input, result, frames, tokens }
}

export const python = `import threading


def foo_bar(n):
    out = []
    foo_sem = threading.Semaphore(1)
    bar_sem = threading.Semaphore(0)

    def foo():
        for _ in range(n):
            foo_sem.acquire()
            out.append("foo")
            bar_sem.release()

    def bar():
        for _ in range(n):
            bar_sem.acquire()
            out.append("bar")
            foo_sem.release()

    threads = [threading.Thread(target=foo), threading.Thread(target=bar)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    return "".join(out)`

export const code = [
  "SHARED fooPermit = 1, barPermit = 0",
  "FOR EACH round in the foo thread",
  "    WAIT UNTIL fooPermit is available",
  '    PRINT "foo"',
  "    RELEASE barPermit",
  "FOR EACH round in the bar thread",
  "    WAIT UNTIL barPermit is available",
  '    PRINT "bar"',
  "    RELEASE fooPermit",
  "START the foo thread and the bar thread, then join both",
  "RETURN the printed text",
].map((text, index) => ({ line: index + 1, text }))

// Maps each pseudocode activeLine used by the frames to its Python line.
export const pythonLineMap = {
  1: 6,
  2: 10,
  3: 11,
  4: 12,
  5: 13,
  6: 16,
  7: 17,
  8: 18,
  9: 19,
  10: 21,
  11: 26,
}
