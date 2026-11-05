export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.n) || input.n < 1 || input.n > 16) throw new Error('n is an integer from 1 to 16.')
  if (!Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 20) throw new Error('ops has 1 to 20 operations.')
  input.ops.forEach(op => {
    if (!Array.isArray(op)) throw new Error('Each operation is an array.')
    if (op[0] === 'allocate' && !(Number.isInteger(op[1]) && op[1] >= 1 && Number.isInteger(op[2]) && op[2] >= 1)) throw new Error('allocate needs ["allocate", size, id] with positive integers.')
    if (op[0] === 'free' && !(Number.isInteger(op[1]) && op[1] >= 1)) throw new Error('free needs ["free", id] with a positive integer.')
    if (op[0] !== 'allocate' && op[0] !== 'free') throw new Error('Operations are "allocate" or "free".')
  })
  return { n: input.n, ops: input.ops }
}

export const code = `class Allocator(n)
  memory <- n units, all 0 (free)
function allocate(size, id)
  run <- 0
  FOR r from 0 to n-1
    IF memory[r] is free THEN run <- run + 1 ELSE run <- 0
    IF run equals size THEN
      l <- r - size + 1
      mark memory[l..r] with id
      RETURN l
  RETURN -1
function free(id)
  cleared <- 0
  FOR each unit with owner id
    clear the unit, cleared <- cleared + 1
  RETURN cleared`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `class Allocator:
    def __init__(self, n):
        self.m = [0] * n

    def allocate(self, size, mid):
        run = 0
        for r, v in enumerate(self.m):
            run = 0 if v else run + 1
            if run == size:
                l = r - size + 1
                for i in range(l, r + 1):
                    self.m[i] = mid
                return l
        return -1

    def free_memory(self, mid):
        cleared = 0
        for i, v in enumerate(self.m):
            if v == mid:
                self.m[i] = 0
                cleared += 1
        return cleared
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export function buildTrace({ n, ops }) {
  const memory = Array(n).fill(0)
  const frames = []
  const results = []
  const snap = () => [...memory]
  frames.push({ phase: 'setup', pythonLine: PL('self.m = [0]'), activeLine: CL('memory <-'), message: `${n} units, all free.`, memory: snap(), l: null, r: null, result: null })
  ops.forEach((op, index) => {
    const label = `Operation ${index + 1}`
    if (op[0] === 'allocate') {
      const [, size, id] = op
      let run = 0, start = -1
      for (let r = 0; r < n; r++) {
        run = memory[r] === 0 ? run + 1 : 0
        const l = run > 0 ? r - run + 1 : r
        frames.push({ phase: 'scan', pythonLine: PL('run = 0 if v'), activeLine: CL('IF memory[r]'), message: `${label}: free run from ${l} to ${r} has ${run} unit${run === 1 ? '' : 's'}; need ${size}.`, memory: snap(), l: run > 0 ? l : null, r, result: null })
        if (run === size) { start = r - size + 1; break }
      }
      if (start >= 0) {
        for (let i = start; i < start + size; i++) memory[i] = id
        frames.push({ phase: 'fill', pythonLine: PL('self.m[i] = mid'), activeLine: CL('mark memory'), message: `Units ${start} to ${start + size - 1} now belong to id ${id}; return ${start}.`, memory: snap(), l: start, r: start + size - 1, result: start })
      } else {
        frames.push({ phase: 'miss', pythonLine: PL('return -1'), activeLine: CL('RETURN -1'), message: `No run of ${size} free units; return -1.`, memory: snap(), l: null, r: null, result: -1 })
      }
      results.push(start)
    } else {
      const id = op[1]
      let cleared = 0
      for (let i = 0; i < n; i++) if (memory[i] === id) { memory[i] = 0; cleared += 1 }
      results.push(cleared)
      frames.push({ phase: 'free', pythonLine: PL('cleared += 1'), activeLine: CL('clear the unit'), message: `${label}: free id ${id}; ${cleared} units cleared.`, memory: snap(), l: null, r: null, result: cleared })
    }
  })
  frames.push({ phase: 'done', pythonLine: PL('return cleared'), activeLine: CL('RETURN cleared'), message: 'All operations processed.', memory: snap(), l: null, r: null, result: null })
  return { input: { n, ops }, result: results, frames }
}
