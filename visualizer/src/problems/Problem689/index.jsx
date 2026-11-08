import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Side tables', description: 'Find the best window to each side.' },
    { id: 'middle', label: 'Middle window', description: 'Combine the best left window, this middle window, and the best right window.' },
    { id: 'done', label: 'Complete', description: 'Return the lexicographically smallest best triple of starts.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Input (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/maximum-sum-of-3-non-overlapping-subarrays/',
  complexity: 'O(n) time after prefix sums, and O(n) space for the side tables.',
  examples: [
    { label: 'Classic', input: '{"nums":[1,2,1,2,6,7,5,1],"k":2}' },
    { label: 'Ties', input: '{"nums":[1,2,1,2,1,2,1,2,1],"k":2}' },
    { label: 'Three values, k one', input: '{"nums":[1,2,3],"k":1}' },
    { label: 'Equal values prefer left', input: '{"nums":[4,4,4,4,4,4],"k":2}' },
    { label: 'Largest values', input: '{"nums":[65535,0,65535,0,65535,0,65535],"k":2}' },
    { label: 'Long run: 60 values', input: '{"nums":[1014,38493,21754,20982,60390,45629,53630,14927,9328,18355,45771,7121,10240,51866,54528,37352,49,40190,23585,65223,46104,35980,49408,60039,10297,32526,31929,10045,53471,38274,4707,45227,34517,49886,29563,10586,53636,259,11052,33489,61269,54186,5863,10158,16463,32192,24579,12505,4318,44086,55929,61961,59258,1867,25280,28610,23798,56190,14724,45774],"k":15}' },
  ],
}

export default function MaxSumThreeSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const windows = step.starts ?? step.best ?? []
    const role = i => {
      const inWindow = windows.some(s => i >= s && i < s + run.input.k)
      if (step.phase === 'middle' && step.starts) {
        const [a, j, c] = step.starts
        if (i >= a && i < a + run.input.k && i === a) return 'left window'
        if (i >= j && i < j + run.input.k && i === j) return 'middle window'
        if (i >= c && i < c + run.input.k && i === c) return 'right window'
      }
      return inWindow ? 'in-window' : ''
    }
    return <>
      <IndexedSequence label={`Values (windows of ${run.input.k})`} length={run.input.nums.length} active={step.j ?? -1} valueAt={i => run.input.nums[i]} roleAt={role} />
      <output aria-label="Triple">{step.total !== null && step.total !== undefined ? `Total ${step.total}` : 'Scanning'}{step.best ? ` · best starts [${step.best.join(', ')}]` : ''}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Ties:</strong> the left and right tables prefer the earliest and the latest windows respectively, so the reported triple is the lexicographically smallest optimal one.</p>
  </>} />
}
