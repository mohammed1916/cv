import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = [
  'memory: n units, 0 means free, otherwise the owner id',
  'allocate(size, id): scan left to right for size free units in a row',
  '  if found, mark those units with id and return the first index',
  '  otherwise return -1',
  'free(id): clear every unit owned by id and return how many were cleared',
].map((text, index) => ({ line: index + 1, text }))

const python = `def run_ops(n, ops):
    memory, out = [0] * n, []
    for op in ops:
        if op[0] == "allocate":
            size, mid = op[1], op[2]
            start, run = -1, 0
            for i in range(n):
                run = run + 1 if memory[i] == 0 else 0
                if run == size:
                    start = i - size + 1
                    break
            if start >= 0:
                for i in range(start, start + size):
                    memory[i] = mid
            out.append(start)
        else:
            mid = op[1]
            freed = 0
            for i in range(n):
                if memory[i] == mid:
                    memory[i] = 0
                    freed += 1
            out.append(freed)
    return out
`

const PY = { alloc: 4, scan: 8, fill: 14, miss: 15, free: 23, done: 24 }

export function parse(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.n) || input.n < 1 || input.n > 16) throw new Error('n is an integer from 1 to 16.')
  if (!Array.isArray(input.ops) || input.ops.length > 20) throw new Error('ops is at most 20 operations.')
  input.ops.forEach(op => {
    if (op[0] === 'allocate' && !(Number.isInteger(op[1]) && op[1] >= 1 && Number.isInteger(op[2]) && op[2] >= 1)) throw new Error('allocate needs [allocate, size, id] with positive integers.')
    if (op[0] === 'free' && !(Number.isInteger(op[1]) && op[1] >= 1)) throw new Error('free needs [free, id] with a positive integer.')
    if (op[0] !== 'allocate' && op[0] !== 'free') throw new Error('Operations are allocate or free.')
  })
  return { n: input.n, ops: input.ops }
}

export function build({ n, ops }) {
  const memory = Array(n).fill(0)
  const frames = []
  const results = []
  const snap = () => [...memory]
  ops.forEach((op, index) => {
    if (op[0] === 'allocate') {
      const [, size, id] = op
      let start = -1, run = 0
      for (let i = 0; i < n; i++) {
        run = memory[i] === 0 ? run + 1 : 0
        frames.push({ phase: 'scan', activeLine: 2, pythonLine: PY.scan, message: `Operation ${index + 1}: free run ending at ${i} is ${run}; need ${size}.`, memory: snap(), focus: i, result: null })
        if (run === size) { start = i - size + 1; break }
      }
      if (start >= 0) {
        for (let i = start; i < start + size; i++) memory[i] = id
        frames.push({ phase: 'allocate', activeLine: 3, pythonLine: PY.fill, message: `Units ${start} to ${start + size - 1} now belong to ${id}.`, memory: snap(), focus: start, result: start })
      } else {
        frames.push({ phase: 'allocate', activeLine: 4, pythonLine: PY.miss, message: `No run of ${size} free units; return -1.`, memory: snap(), focus: -1, result: -1 })
      }
      results.push(start)
    } else {
      const id = op[1]
      let freed = 0
      for (let i = 0; i < n; i++) if (memory[i] === id) { memory[i] = 0; freed += 1 }
      results.push(freed)
      frames.push({ phase: 'free', activeLine: 5, pythonLine: PY.free, message: `Free ${id}: ${freed} units cleared.`, memory: snap(), focus: -1, result: freed })
    }
  })
  frames.push({ phase: 'done', activeLine: 5, pythonLine: PY.done, message: 'All operations processed.', memory: snap(), focus: -1, result: null })
  return { input: { n, ops }, result: results, frames }
}

const definition = {
  phases: [
    { id: 'alloc', label: 'Allocate', description: 'Scan for a free run.' },
    { id: 'scan', label: 'Scan', description: 'Extend the current free run.' },
    { id: 'fill', label: 'Fill', description: 'Mark the chosen units.' },
    { id: 'miss', label: 'No room', description: 'Return -1.' },
    { id: 'free', label: 'Free', description: 'Clear one owner.' },
    { id: 'done', label: 'Result', description: 'All operations processed.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with n (memory size) and ops: [\'allocate\', size, id] or [\'free\', id]',
  url: 'https://leetcode.com/problems/design-memory-allocator/',
  complexity: 'Each allocate scans the memory once and each free scans it once. The visualization keeps the plain array form, so memory is O(n).',
  examples: [
    { label: 'Example', input: '{"n":10,"ops":[["allocate",1,1],["allocate",2,2],["allocate",3,3],["free",2],["allocate",4,1],["allocate",5,2]]}' },
  ],
}

export default function DesignMemoryAllocator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Memory units" length={run.input.n} active={step.focus}
      valueAt={i => (step.memory[i] === 0 ? 'free' : `id ${step.memory[i]}`)}
      roleAt={i => (step.memory[i] !== 0 ? 'owned' : '')} />
    <output aria-label="Operation result">{step.result === null ? `${run.result.length} operations` : `Result ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>An allocation needs a contiguous block, so the scan keeps a running count of free units and stops at the first run long enough. Freeing needs no search of the blocks, only a sweep for the owner.</p>
  </>} />
}
