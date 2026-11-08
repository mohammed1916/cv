import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with every bit of the largest value set.' },
    { id: 'drop', label: 'Clear bit', description: 'A merge plan within k keeps every remaining value free of this bit.' },
    { id: 'keep', label: 'Keep bit', description: 'Clearing this bit is impossible within k merges.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum OR.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 8 values, 0 to 15) and k (0 to 7), e.g. {"nums":[3,5,3,2,7],"k":2}',
  url: 'https://leetcode.com/problems/minimize-or-of-remaining-elements-using-operations/',
  complexity: 'O(B * n^2) time for B bits, with an O(n^2) segment DP per bit. The visualization caps the input at 8 values.',
  examples: [
    { label: 'Five values, k of two', input: '{"nums":[3,9,5,6,12],"k":2}' },
    { label: 'Zero k, four values', input: '{"nums":[15,0,7,4],"k":0}' },
    { label: "Single zero", input: '{"nums":[0],"k":0}' },
    { label: "Equal values", input: '{"nums":[5,5,5],"k":0}' },
    { label: "Largest values", input: '{"nums":[15,15,15,15,15,15,15,15],"k":7}' },
    { label: "Long run: 8 values", input: '{"nums":[3,13,5,5,10,13,5,8],"k":5}' },
  ],
}

const bits = v => (v === null || v === undefined ? '-' : v.toString(2).padStart(4, '0'))

export default function MinimizeOrRemaining() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1} />
    <table aria-label="Bit decision">
      <tbody>
        <tr><th scope="row">Bit</th><td>{step.bit < 0 ? '-' : step.bit}</td></tr>
        <tr><th scope="row">Candidate</th><td>{bits(step.candidate)}</td></tr>
        <tr><th scope="row">Merges needed</th><td>{step.merges === null ? 'impossible' : step.merges ?? '-'}</td></tr>
        <tr><th scope="row">Answer</th><td>{bits(step.answer)}</td></tr>
      </tbody>
    </table>
    <output aria-label="Merge budget">{`Budget k: ${run.input.k}`}</output>
  </>} renderReasoning={() => <>
    <p>Merging neighbours replaces a segment with its AND, so the remaining elements are the segment ANDs and the cost is the number of elements merged away.</p>
    <p>Bits are decided from the top. A bit is cleared only when some split keeps every segment AND free of all chosen-cleared bits within k merges.</p>
  </>} />
}
