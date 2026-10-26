import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the permutation.' },
    { id: 'scan', label: 'Prefix max', description: 'Update the running maximum and compare it to the index.' },
    { id: 'cut', label: 'Cut', description: 'Maximum equals index: close a chunk.' },
    { id: 'done', label: 'Complete', description: 'Return the number of chunks.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Permutation arr of 0..n-1 (JSON)',
  url: 'https://leetcode.com/problems/max-chunks-to-make-sorted/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: '[4,3,2,1,0]', input: '[4,3,2,1,0]' },
    { label: '[1,0,2,3,4]', input: '[1,0,2,3,4]' },
    { label: '[2,0,1,4,3]', input: '[2,0,1,4,3]' },
  ],
}
export default function MaxChunksToMakeSorted() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Permutation" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => (step.cuts.includes(i) ? 'cut' : '')} />
    <output aria-label="Prefix maximum">Prefix max: {step.prefixMax < 0 ? 'n/a' : step.prefixMax} | Chunks: {step.count}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why:</strong> the prefix [0..i] has i+1 distinct values from 0..n-1. Its maximum is at least i, and equals i only if it is exactly the set 0..i, which sorts in place.</p>
  </>} />
}
