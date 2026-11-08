import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import JobPairsView from './JobPairsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2323',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with jobs and workers (e.g. {"jobs":[5,7,9],"workers":[2,3,4]})',
  url: 'https://leetcode.com/problems/find-minimum-time-to-finish-all-jobs-ii/',
  complexity: 'O(n log n) time for sorting and O(n) pairing, O(n) space for the sorted copies. The visualization caps the input at 6 jobs with values from 1 to 100; the draft does not verify the official bounds.',
  examples: [
    { label: 'Three jobs', input: '{"jobs":[5,7,9],"workers":[2,3,4]}' },
    { label: 'Equal times', input: '{"jobs":[10,20,30],"workers":[1,2,3]}' },
    { label: 'One job', input: '{"jobs":[7],"workers":[2]}' },
    { label: 'Single job', input: '{"jobs":[4],"workers":[4]}' },
    { label: 'Equal job and worker times', input: '{"jobs":[3,3,3],"workers":[3,3,3]}' },
    { label: 'Largest values, six jobs', input: '{"jobs":[100,1,100,1,50,50],"workers":[1,100,1,100,50,50]}' },
    { label: 'Long run: six jobs', input: '{"jobs":[14,99,40,66,59,56],"workers":[65,87,26,4,81,56]}' },
  ],
}

export default function Problem2323Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <JobPairsView step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
