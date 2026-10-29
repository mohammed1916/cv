const H_WAIT_LINE = 3
const H_BARRIER_LINE = 4
const H_PRINT_LINE = 5
const O_WAIT_LINE = 8
const O_BARRIER_LINE = 9
const O_PRINT_LINE = 10
const START_LINE = 12
const RETURN_LINE = 13

export function parseInput(text) {
  let input
  try {
    input = JSON.parse(text)
  } catch {
    throw new Error('Input must be JSON, for example {"water":"HOH"}.')
  }
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error('Input must be a JSON object with a "water" key.')
  }
  const { water } = input
  if (typeof water !== "string") throw new Error('"water" must be a string.')
  if (!/^[HO]+$/.test(water)) throw new Error('"water" may contain only the letters H and O.')
  if (water.length % 3 !== 0 || water.length < 3 || water.length > 60) {
    throw new Error('"water" length must be 3n, with n from 1 to 20.')
  }
  const hCount = [...water].filter((c) => c === "H").length
  const oCount = water.length - hCount
  if (hCount !== 2 * (water.length / 3) || oCount !== water.length / 3) {
    throw new Error('"water" must contain exactly 2n H and n O.')
  }
  return { water }
}

// Threads arrive in string order. At most 2 H and 1 O hold permits; the barrier opens when 3 hold permits.
export function buildTrace(input) {
  const { water } = input
  const statuses = [...water].map(() => "pending")
  const frames = []
  const order = []
  const queue = []
  const barrier = []
  let hPermits = 2
  let oPermits = 1

  const snapshot = (phase, activeLine, message, current, extra = {}) => {
    frames.push({
      phase, activeLine, message, current, hPermits, oPermits,
      statuses: [...statuses], printedCount: order.length, result: null, ...extra,
    })
  }

  function releaseGroup() {
    const group = barrier.splice(0, 3).sort((a, b) => (a.type === b.type ? 0 : a.type === "H" ? -1 : 1))
    for (const member of group) {
      order.push(member.type)
      statuses[member.index] = "printed"
      if (member.type === "H") hPermits++
      else oPermits++
      snapshot("release", member.type === "H" ? H_PRINT_LINE : O_PRINT_LINE,
        `Thread ${member.index + 1} prints "${member.type}" and releases its permit.`, member.index)
    }
  }

  function tryAdmit() {
    const index = queue.findIndex((t) => (t.type === "H" ? hPermits : oPermits) > 0)
    if (index < 0) return
    const member = queue.splice(index, 1)[0]
    if (member.type === "H") hPermits--
    else oPermits--
    barrier.push(member)
    statuses[member.index] = "barrier"
    snapshot("barrier", member.type === "H" ? H_BARRIER_LINE : O_BARRIER_LINE,
      `Thread ${member.index + 1} holds a ${member.type} permit and waits at the barrier.`, member.index)
    if (barrier.length === 3) releaseGroup()
    tryAdmit()
  }

  [...water].forEach((type, index) => {
    statuses[index] = "arrived"
    snapshot("arrive", START_LINE, `Thread ${index + 1} calls ${type === "H" ? "hydrogen" : "oxygen"}().`, index)
    queue.push({ type, index })
    tryAdmit()
    if (statuses[index] !== "barrier" && statuses[index] !== "printed") {
      statuses[index] = "waiting"
      snapshot("wait", type === "H" ? H_WAIT_LINE : O_WAIT_LINE,
        `No ${type === "H" ? "hydrogen" : "oxygen"} permit is free; thread ${index + 1} waits.`, index)
    }
  })

  const result = order.join("")
  snapshot("done", RETURN_LINE, `Return "${result}".`, null, { result })
  return { input, result, frames, order }
}

export const python = `import threading


def build_h2o(water):
    out = []
    lock = threading.Lock()
    h_sem = threading.Semaphore(2)
    o_sem = threading.Semaphore(1)
    barrier = threading.Barrier(3)

    def hydrogen():
        h_sem.acquire()
        barrier.wait()
        with lock:
            out.append("H")
        h_sem.release()

    def oxygen():
        o_sem.acquire()
        barrier.wait()
        with lock:
            out.append("O")
        o_sem.release()

    threads = [threading.Thread(target=hydrogen if c == "H" else oxygen) for c in water]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    return "".join(out)`

export const code = [
  "SHARED hPermits = 2, oPermits = 1, barrier waits for 3 threads",
  "METHOD hydrogen()",
  "    WAIT UNTIL an H permit is free",
  "    WAIT AT the barrier until 3 threads have arrived",
  '    PRINT "H"',
  "    RELEASE the H permit",
  "METHOD oxygen()",
  "    WAIT UNTIL the O permit is free",
  "    WAIT AT the barrier until 3 threads have arrived",
  '    PRINT "O"',
  "    RELEASE the O permit",
  "START one thread per character of water, in order",
  "RETURN the printed text",
].map((text, index) => ({ line: index + 1, text }))

// Maps each pseudocode activeLine used by the frames to its Python line.
export const pythonLineMap = {
  1: 7,
  2: 11,
  3: 12,
  4: 13,
  5: 15,
  6: 16,
  7: 18,
  8: 19,
  9: 20,
  10: 22,
  11: 23,
  12: 25,
  13: 30,
}
