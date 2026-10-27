import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import HeapView from '../../components/shared/HeapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Seed heap', description: 'Push the first-row fraction of every column and heapify.' },
    { id: 'pop', label: 'Pop smallest', description: 'Remove the next smallest fraction.' },
    { id: 'push', label: 'Push successor', description: 'Add the next fraction from the same denominator column.' },
    { id: 'skip', label: 'Column done', description: 'No larger numerator is left for that denominator.' },
    { id: 'done', label: 'Complete', description: 'Heap top is the k-th smallest.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'arr and k (JSON)',
  url: 'https://leetcode.com/problems/k-th-smallest-prime-fraction/',
  complexity: 'O((n + k) log n) time, O(n) space. Visualization limited to 12 values.',
  examples: [
    { label: 'arr=[1,2,3,5], k=3', input: '{"arr":[1,2,3,5],"k":3}' },
    { label: 'arr=[1,7], k=1', input: '{"arr":[1,7],"k":1}' },
    { label: 'arr=[1,2,3,5,7,11], k=10', input: '{"arr":[1,2,3,5,7,11],"k":10}' },
  ],
}
export default function KthSmallestPrimeFraction() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="arr" length={run.input.arr.length} valueAt={i => run.input.arr[i]} roleAt={i => step.current ? (i === step.current[0] ? 'numerator' : i === step.current[1] ? 'denominator' : '') : ''} />
    {step.heapState && <HeapView {...step.heapState} />}
    <IndexedSequence label="Popped in order" length={Math.max(step.popped.length, 1)} valueAt={i => step.popped[i] ?? ' '} indexOffset={1} />
    <output aria-label="Answer">{step.phase === 'done' ? `Answer: [${run.result.join(', ')}]` : `Pops so far: ${step.round} of ${run.input.k - 1}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each denominator column is sorted ascending in the numerator, so the heap only needs each column's current smallest fraction. After popping, the same column's next fraction is the only new candidate.</p>
    <p>Fractions are compared by cross-multiplication, avoiding floating-point error.</p>
  </>} />
}
