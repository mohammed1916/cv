import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2120',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with n, startPos ([row, col]) and s',
  url: 'https://leetcode.com/problems/execution-of-all-suffix-instructions-staying-in-a-grid/',
  complexity: 'O(m^2) time for m instructions in this straightforward simulation (each start walks its own suffix); O(m) extra space.',
  examples: [
    { label: 'Stops at the edge', input: '{"n":3,"startPos":[2,0],"s":"UULRD"}' },
    { label: 'Stays inside', input: '{"n":2,"startPos":[1,0],"s":"RLRU"}' }, { label: "Single cell", input: "{\"n\":1,\"startPos\":[0,0],\"s\":\"L\"}" }, { label: "Return to start", input: "{\"n\":3,\"startPos\":[1,1],\"s\":\"LR\"}" }, { label: "Longest walk", input: "{\"n\":12,\"startPos\":[11,11],\"s\":\"RDRDRDRDRDRDRDRDRDRDRDRDRDRDRDRDRDRDRDRD\"}" }, { label: "Long run: 40 moves", input: "{\"n\":12,\"startPos\":[5,5],\"s\":\"ULRUUULDULDRUUURDRLULRRRURLLLRUDLDDRLUUR\"}" },
  ],
}

export default function Problem2120Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`Instructions on a ${run.input.n} x ${run.input.n} grid (l = start, r = current)`} length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.k} roleAt={i => (i === step.start ? 'l start' : i === step.k ? 'r now' : '')} />
          <RecordStateTable label="Robot position and answers" columns={['start', 'position', 'steps so far', 'answers'].slice(0, 4)} rows={[{ start: step.start >= 0 ? step.start : '–', position: `(${step.pos.join(', ')})`, 'steps so far': step.steps ?? '–', answers: step.answer.join(', ') }]} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
