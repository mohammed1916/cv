import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Every unit starts free.' },
    { id: 'scan', label: 'Scan', description: 'Grow the free run from l to r.' },
    { id: 'fill', label: 'Fill', description: 'Mark the first run long enough.' },
    { id: 'miss', label: 'No room', description: 'Return -1.' },
    { id: 'free', label: 'Free', description: 'Clear every unit of one owner.' },
    { id: 'done', label: 'Result', description: 'All operations processed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": 10, "ops": [["allocate", 1, 1], ["free", 1]]}',
  url: 'https://leetcode.com/problems/design-memory-allocator/',
  complexity: 'Each allocate scans the memory once and each free scans it once, so each operation is O(n). The visualization keeps the plain array form, so memory is O(n).',
  examples: [
    { label: 'Reuse a freed gap', input: '{"n":6,"ops":[["allocate",2,5],["allocate",2,6],["allocate",2,7],["free",6],["allocate",2,8]]}' },
    { label: 'Fragmented', input: '{"n":5,"ops":[["allocate",2,1],["allocate",2,2],["free",1],["allocate",3,3]]}' },
  ],
}

export default function DesignMemoryAllocator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Memory units" length={run.input.n} active={step.r ?? -1}
      valueAt={i => (step.memory[i] === 0 ? 'free' : `id ${step.memory[i]}`)}
      roleAt={i => (i === step.l ? 'l' : i === step.r ? 'r' : step.memory[i] !== 0 ? 'owned' : '')} />
    <output aria-label="Operation result">{step.result === null ? `${run.result.length} operations` : `Result ${step.result}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>An allocation needs a contiguous block, so the scan keeps a free run from l to r and stops at the first run long enough. Freeing needs no search of the blocks, only a sweep for the owner.</p>
  </>} />
}
