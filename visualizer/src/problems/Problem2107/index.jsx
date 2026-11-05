import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2107',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with candies (flavour numbers) and k',
  url: 'https://leetcode.com/problems/number-of-unique-flavors-after-sharing-k-candies/',
  complexity: 'O(n) time with a sliding window and a count per flavour; O(number of flavours) space.',
  examples: [
    { label: 'Give away a middle block', input: '{"candies":[1,2,2,3,1],"k":2}' },
    { label: 'Repeats on both sides', input: '{"candies":[4,4,5,4,4],"k":2}' },
    { label: 'Give everything but one', input: '{"candies":[1,2,3,1],"k":3}' },
  ],
}

export default function Problem2107Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Candies (given block shows as given)" length={run.input.candies.length} valueAt={i => run.input.candies[i]} active={step.r} roleAt={i => (i === step.l ? 'l' : i === step.r ? 'r' : (step.marks[i] ?? ''))} />
          <RecordStateTable label="Candies Alice keeps, by flavour" columns={['flavour', 'kept']} rows={Object.entries(step.remaining).map(([flavour, kept]) => ({ flavour, kept }))} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
