import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Cost 0 is reached by zero digits.' },
    { id: 'fill', label: 'Fill costs', description: 'Find the most digits that reach each total cost.' },
    { id: 'build', label: 'Build', description: 'Choose the largest digit that keeps the length on track.' },
    { id: 'done', label: 'Complete', description: 'Report the largest integer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: cost (nine integers for digits 1-9) and target',
  url: 'https://leetcode.com/problems/form-largest-integer-with-digits-that-add-up-to-target/',
  complexity: 'O(9 * target) time and O(target) space. The visualization caps target at 15.',
  examples: [
    { label: 'Example 1', input: '{"cost":[4,3,2,5,6,7,2,5,5],"target":9}' },
    { label: 'Impossible', input: '{"cost":[2,4,6,2,4,6,4,4,4],"target":5}' },
  ],
}

export default function LargestIntegerWithCost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Most digits for each total cost">
      <thead><tr><th>Total cost</th>{run.input.cost && Array.from({ length: run.input.target + 1 }, (_, t) => <th key={t}>{t}</th>)}</tr></thead>
      <tbody><tr><th>Most digits</th>{step.length.map((value, t) => <td key={t} data-role={step.total === t ? 'active' : undefined}>{value < 0 ? '-' : value}</td>)}</tr></tbody>
    </table>
    <output aria-label="Digits chosen">{`Answer so far: ${step.digits || '(none)'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The largest integer has the most digits, so the length table is computed first. Then digits are chosen from 9 down, taking the first digit that keeps the remaining cost on a path of the right length.</p>
  </>} />
}
