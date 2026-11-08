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
    { label: 'Six powers, target nineteen', input: '{"nums":[4,16,2,2,8,1],"target":19}' },
    { label: 'Equal large powers', input: '{"nums":[64,64,1],"target":128}' },
    { label: "Single power", input: "{\"nums\":[1],\"target\":1}" },
    { label: "Equal powers", input: "{\"nums\":[8,8,8],\"target\":16}" },
    { label: "Largest powers", input: "{\"nums\":[1024,512,1024],\"target\":1024}" },
    { label: "Long run: 12 seeded powers", input: "{\"nums\":[16,64,1024,1,8,128,32,2,4,16,1024,1],\"target\":1000}" },
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
