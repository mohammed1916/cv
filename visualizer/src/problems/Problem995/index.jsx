import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the left-to-right scan with no flips.' },
    { id: 'expire', label: 'Expire', description: 'A window that started k bits back stops covering this index.' },
    { id: 'scan', label: 'Keep', description: 'The bit is already 1 after the active flips, so nothing changes.' },
    { id: 'flip', label: 'Flip window', description: 'The bit is 0 with no pending flip, so flip the window starting here.' },
    { id: 'impossible', label: 'Impossible', description: 'The window would run past the end of the array.' },
    { id: 'done', label: 'Return', description: 'Every bit is 1; return the number of flips.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary array and k (JSON): {"nums": [...], "k": n}',
  url: 'https://leetcode.com/problems/minimum-number-of-k-consecutive-bit-flips/',
  complexity: 'O(n * k) time for the visualized window recomputation; the greedy itself is O(n) time and O(n) space. The visualization caps input at 12 bits.',
  examples: [
    { label: 'Example 1', input: '{"nums":[0,1,0],"k":1}' },
    { label: 'Example 2', input: '{"nums":[1,1,0],"k":2}' },
    { label: 'Example 3', input: '{"nums":[0,0,0,1,0,1,1,0],"k":3}' },
  ],
}

export default function MinKBitFlips() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.nums.length
    const k = run.input.k
    const inWindow = j => step.i >= 0 && j >= step.i && j < step.i + k
    return <>
      <IndexedSequence label="Original bits" length={n} valueAt={j => run.input.nums[j]} active={step.i} />
      <IndexedSequence label="Bits after flips so far" length={n} valueAt={j => step.bits[j]} active={step.i}
        roleAt={j => inWindow(j) ? 'in window' : ''} />
      <IndexedSequence label="Window starts flipped" length={n} valueAt={j => step.flipped[j]} active={step.i}
        roleAt={j => step.flipped[j] ? 'flip start' : ''} />
      <output aria-label="Flip state">{`Flips so far: ${step.count}. Flip parity at index ${step.i >= 0 ? step.i : '-'}: ${step.active}. Window size k = ${k}.`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only the leftmost 0 can be fixed in order, and the only window that can fix it is one starting at that index, so the flip is forced.</p>
    <p>Instead of flipping the array, track the parity of flips that still cover the current index; a flip started k bits back expires as the scan moves on.</p>
  </>} />
}
