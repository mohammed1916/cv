import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2135',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with startWords and targetWords',
  url: 'https://leetcode.com/problems/count-words-obtained-after-adding-a-letter/',
  complexity: 'O(total length) time with a set of start masks; O(number of start words) space.',
  examples: [
    { label: 'Two obtained', input: '{"startWords":["abc","de"],"targetWords":["abcd","dea","xyz","be"]}' },
    { label: 'Nothing matches', input: '{"startWords":["ab","cd"],"targetWords":["abe","xyz"]}' },
  ],
}

export default function Problem2135Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <RecordStateTable label="Target words: letter removed and outcome" columns={['target', 'removing', 'result']} rows={step.rows} activeRow={step.current} />
          <p>Obtained so far: {step.count}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
