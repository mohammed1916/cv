import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count the copies of each power of two.' },
    { id: 'use', label: 'Use copy', description: 'A copy of the needed power is available.' },
    { id: 'split', label: 'Split', description: 'Split a larger power down to the needed one.' },
    { id: 'fail', label: 'Impossible', description: 'The target cannot be formed.' },
    { id: 'done', label: 'Complete', description: 'Report the operation count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (powers of two, 1 to 12 values) and target (1 to 1024), e.g. {"nums":[1,2,8],"target":7}',
  url: 'https://leetcode.com/problems/minimum-operations-to-form-subsequence-with-target-sum/',
  complexity: 'O(log target * log max) time after counting. The visualization caps values at 1024.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,8],"target":7}' },
    { label: 'Example 2', input: '{"nums":[1,32,1,2],"target":12}' },
  ],
}

export default function MinimumOperationsTargetSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Copies of 2^b (index b)" length={11} valueAt={i => step.cnt[i]} active={step.bit >= 0 && step.bit <= 10 ? step.bit : -1} />
    <output aria-label="Operations so far">{`Operations so far: ${step.ops}`}</output>
  </>} renderReasoning={() => <>
    <p>Each bit of the target is paid for from the lowest bit upward. A missing bit is produced by splitting the nearest larger power, and each split costs one operation.</p>
    <p>Taking the cheapest available power for each bit keeps the number of splits minimal.</p>
  </>} />
}
