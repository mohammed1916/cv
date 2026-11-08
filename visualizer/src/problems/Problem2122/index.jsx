import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2122',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array of even length as JSON',
  url: 'https://leetcode.com/problems/recover-the-original-array/',
  complexity: 'O(n^2 log n) worst case with up to n candidates and a map pass each; O(n) extra space per attempt.',
  examples: [
    { label: 'Partner gap of 4', input: '[3,7,7,11]' },
    { label: 'Small pair', input: '[1,3,3,5]' }, { label: "Smallest pair", input: "[1,1]" }, { label: "Equal values", input: "[5,5,5,5]" }, { label: "Extreme values", input: "[1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1]" }, { label: "Long run: 20 values", input: "[562,955,328,391,978,541,720,430,283,479,237,211,799,574,761,850,981,451,338,136]" },
  ],
}

export default function Problem2122Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <IndexedSequence label="Sorted numbers (l = lowest unused)" length={step.sorted.length} valueAt={i => step.sorted[i]} active={step.l} roleAt={i => (i === step.candidate ? 'candidate' : i === step.l ? 'l' : '')} />
          <RecordStateTable label="Candidate k values" columns={['k', 'outcome']} rows={step.tries} />
          {step.result && <p>Original: {step.result.join(', ')}</p>}
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
