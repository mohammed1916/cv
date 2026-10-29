const START_LINE = 14
const RETURN_LINE = 15

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

// zero() prints 0 before every number. It releases odd() for odd i and even() for even i.
export function buildTrace(input) {
  const { n } = input
  const frames = []
  const tokens = []
  let zeroPermit = true
  let oddPermit = false
  let evenPermit = false

  const snapshot = (phase, activeLine, message, current) => {
    frames.push({ phase, activeLine, message, current, zeroPermit, oddPermit, evenPermit, printedCount: tokens.length, result: null })
  }

  snapshot("start", START_LINE, "Start the zero, odd and even threads.", null)
  for (let i = 1; i <= n; i++) {
    zeroPermit = false
    snapshot("zero", 3, `Round ${i}: zero acquires its permit.`, "zero")
    tokens.push("0")
    snapshot("zero", 4, 'Zero prints "0".', "zero")
    const isOdd = i % 2 === 1
    if (isOdd) {
      oddPermit = true
      snapshot("odd", 7, `Odd acquires its permit for ${i}.`, "odd")
      oddPermit = false
      tokens.push(String(i))
      snapshot("odd", 8, `Odd prints ${i} and releases zero.`, "odd")
    } else {
      evenPermit = true
      snapshot("even", 11, `Even acquires its permit for ${i}.`, "even")
      evenPermit = false
      tokens.push(String(i))
      snapshot("even", 12, `Even prints ${i} and releases zero.`, "even")
    }
    zeroPermit = true
  }
  const result = tokens.join("")
  snapshot("done", RETURN_LINE, `Return "${result}".`, null)
  frames[frames.length - 1].result = result
  return { input, result, frames, tokens }
}

export const python = `import threading


def zero_even_odd(n):
    out = []
    zero_sem = threading.Semaphore(1)
    odd_sem = threading.Semaphore(0)
    even_sem = threading.Semaphore(0)

    def zero():
        for i in range(1, n + 1):
            zero_sem.acquire()
            out.append("0")
            if i % 2 == 1:
                odd_sem.release()
            else:
                even_sem.release()

    def odd():
        for k in range(1, n + 1, 2):
            odd_sem.acquire()
            out.append(str(k))
            zero_sem.release()

    def even():
        for k in range(2, n + 1, 2):
            even_sem.acquire()
            out.append(str(k))
            zero_sem.release()

    threads = [threading.Thread(target=zero), threading.Thread(target=odd), threading.Thread(target=even)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    return "".join(out)`

export const code = [
  "SHARED zeroPermit = 1, oddPermit = 0, evenPermit = 0",
  "FOR i = 1 TO n in the zero thread",
  "    WAIT UNTIL zeroPermit is available",
  '    PRINT "0"',
  "    IF i is odd, RELEASE oddPermit, ELSE RELEASE evenPermit",
  "FOR each odd k up to n in the odd thread",
  "    WAIT UNTIL oddPermit is available",
  "    PRINT k",
  "    RELEASE zeroPermit",
  "FOR each even k up to n in the even thread",
  "    WAIT UNTIL evenPermit is available",
  "    PRINT k",
  "    RELEASE zeroPermit",
  "START the zero, odd and even threads, then join all three",
  "RETURN the printed text",
].map((text, index) => ({ line: index + 1, text }))

// Maps each pseudocode activeLine used by the frames to its Python line.
export const pythonLineMap = {
  1: 6,
  2: 11,
  3: 12,
  4: 13,
  5: 14,
  6: 20,
  7: 21,
  8: 22,
  9: 23,
  10: 26,
  11: 27,
  12: 28,
  13: 29,
  14: 31,
  15: 36,
}
