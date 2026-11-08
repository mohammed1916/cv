import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No markers yet.' },
    { id: 'bad', label: 'Too big', description: 'A value above the right bound resets the window.' },
    { id: 'good', label: 'In range', description: 'A value in range is a valid end for subarrays.' },
    { id: 'small', label: 'Too small', description: 'A small value extends the last good window.' },
    { id: 'done', label: 'Complete', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums, left and right (JSON object)',
  url: 'https://leetcode.com/problems/number-of-subarrays-with-bounded-maximum/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Window', input: '{"nums":[2,5,1,3,6],"left":2,"right":4}' },
    { label: 'Narrow', input: '{"nums":[3,1,2,9,2],"left":2,"right":3}' }, { label: 'Single number in range', input: '{"nums":[5],"left":5,"right":5}' }, { label: 'All equal values', input: '{"nums":[3,3,3],"left":3,"right":3}' }, { label: 'Full range 0 to 100', input: '{"nums":[0,100,0],"left":0,"right":100}' }, { label: 'Long run: 200 values', input: '{"nums":[25,78,49,81,80,19,8,81,78,77,9,10,41,28,75,100,89,81,31,36,98,4,89,69,0,51,50,90,100,94,43,71,24,2,66,68,32,88,28,88,29,32,72,13,51,69,72,29,5,49,22,53,75,21,57,87,76,100,48,47,86,91,41,14,11,24,50,30,1,70,23,54,2,96,41,73,15,100,28,23,53,81,70,91,52,80,37,37,96,97,94,23,9,38,79,43,8,80,78,99,22,83,40,82,47,58,56,12,78,7,97,29,59,37,55,83,33,94,97,95,38,80,67,74,1,80,62,1,4,100,33,9,71,28,70,55,65,9,34,24,64,50,75,45,9,27,28,26,12,49,2,63,31,93,15,70,81,44,84,26,33,70,25,73,57,79,2,49,70,39,2,59,31,69,56,94,3,11,59,34,8,56,67,37,20,74,56,94,94,78,31,41,99,79,37,4,11,87,19,87],"left":20,"right":60}' },
  ],
}

export default function BoundedMaximum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`nums (window of valid ends: after bad marker ${step.lastBad}, good marker ${step.lastGood})`} length={run.input.nums.length} active={step.i}
      valueAt={i => run.input.nums[i]}
      roleAt={i => (i === step.lastBad ? 'bad' : i === step.lastGood ? 'good' : i === step.i ? 'r' : i > step.lastBad && i < step.i ? 'window' : '')} />
    <output aria-label="Total">{`Subarrays counted so far: ${step.count} (+${step.added} at this end)`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A subarray ending at position i has a maximum in range exactly when it contains no value above the bound and at least one value inside the range.</p>
    <p>The count of valid starts for a subarray ending at i is lastGood minus lastBad, which the scan updates in one pass.</p>
  </>} />
}
