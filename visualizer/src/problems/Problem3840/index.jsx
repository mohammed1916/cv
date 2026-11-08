import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3840,
  phases: [
    { id: 'house', label: 'House', description: 'Decide the best totals with and without this house.' },
    { id: 'done', label: 'Result', description: 'The larger of the two final totals is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (amounts) and colors (same length)',
  url: 'https://leetcode.com/problems/house-robber-v/',
  complexity: 'O(n) time and O(n) space for the two-state table.',
  examples: [
    { label: 'Colour break', input: '{"nums":[3,7,5,2],"colors":[1,1,3,3]}' },
    { label: 'Run of one colour', input: '{"nums":[5,8,2,7],"colors":[3,3,3,4]}' },
    { label: 'One item', input: '{"nums":[0],"colors":[1]}' },
    { label: 'Equal colours', input: '{"nums":[3,3,3],"colors":[2,2,2]}' },
    { label: 'Largest amounts alternate colours', input: '{"nums":[30,0,30,0,30,0,30,0,30,0],"colors":[1,2,1,2,1,2,1,2,1,2]}' },
    { label: 'Long run: 10 items', input: '{"nums":[15,17,10,7,0,28,6,2,26,27],"colors":[4,4,4,1,1,1,3,2,1,4]}' },
  ],
}

export default function HouseRobberV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Houses (amount, with colour in the role line)" length={run.input.nums.length} active={step.at}
      valueAt={index => run.input.nums[index]}
      roleAt={index => `colour ${run.input.colors[index]}${index > 0 && run.input.colors[index] === run.input.colors[index - 1] ? ' (same as left)' : ''}`} />
    <table aria-label="Houses">
      <thead><tr><th>house</th><th>amount</th><th>colour</th><th>skip total</th><th>take total</th></tr></thead>
      <tbody>{run.input.nums.map((v, i) => <tr key={i} data-current={step.at === i ? 'yes' : undefined}>
        <td>{i}</td><td>{v}</td><td>{run.input.colors[i]}</td>
        <td>{step.skip[i] ?? ''}</td><td>{step.take[i] === null || step.take[i] === undefined ? '' : step.take[i]}</td></tr>)}</tbody>
    </table>
    <output aria-label="Current house">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only adjacent pairs with the same colour are restricted. Robbing a house is allowed after a skipped neighbour, or after a neighbour of a different colour.</p>
    <p>Two running totals capture everything needed: one for houses where the latest one was skipped, and one where it was robbed.</p>
  </>} />
}
