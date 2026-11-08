import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2138',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with s, k and fill',
  url: 'https://leetcode.com/problems/divide-a-string-into-groups-of-size-k/',
  complexity: 'O(n) time and O(n) space for the output groups.',
  examples: [
    { label: 'Padded last group', input: '{"s":"abcdefghij","k":3,"fill":"x"}' },
    { label: 'Exact fit', input: '{"s":"nolog","k":5,"fill":"q"}' },
    { label: 'Single letter', input: '{"s":"a","k":1,"fill":"z"}' },
    { label: 'Group longer than the string', input: '{"s":"ab","k":5,"fill":"x"}' },
    { label: 'Repeated letters, exact fit', input: '{"s":"aaaa","k":2,"fill":"b"}' },
    { label: 'Largest string, one group', input: '{"s":"abcdefghijklmnopqrstuvwxyzabcdefghijklmn","k":40,"fill":"q"}' },
    { label: 'Long run: 40 letters', input: '{"s":"mjruusqgqtnphrmsyakuzqtyjahyyzsxcpidmmzm","k":7,"fill":"x"}' },
  ],
}

export default function Problem2138Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="String (l to r is the group being cut)" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.l >= 0 ? step.l : -1} roleAt={i => (step.l >= 0 && i >= step.l && i <= step.r ? 'group' : '')} />
          <RecordStateTable label="Groups so far" columns={['group', 'text']} rows={step.groups.map((text, group) => ({ group, text }))} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
