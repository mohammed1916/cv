import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'pickup', label: 'Pickups', description: 'Count the garbage in each house.' },
    { id: 'truck', label: 'Trucks', description: 'Add the drive to the last house that needs each truck.' },
    { id: 'done', label: 'Complete', description: 'Report the total minutes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with garbage (2 to 8 houses of M, P or G) and travel (one time per road)',
  url: 'https://leetcode.com/problems/minimum-amount-of-time-to-collect-garbage/',
  complexity: 'O(n * 3) time with prefix sums of travel times. The visualization caps input at 8 houses.',
  examples: [
    { label: 'Mixed houses', input: '{"garbage":["MP","G","PP","M"],"travel":[1,2,5]}' },
    { label: 'Only glass', input: '{"garbage":["GG","G","G"],"travel":[4,1]}' },
  ],
}

export default function MinimumGarbageTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="houses" length={run.input.garbage.length} valueAt={index => run.input.garbage[index] || '(empty)'} active={step.index}
      roleAt={index => (step.truck && index === step.index ? `${step.truck} stop` : '')} />
    <table aria-label="Truck stops">
      <thead><tr><th>Truck</th><th>Last house needing it</th><th>Drive minutes</th></tr></thead>
      <tbody>{['M', 'P', 'G'].map(type => {
        const last = run.input.garbage.reduce((acc, g, i) => (g.includes(type) ? i : acc), -1)
        const drive = last < 0 ? 0 : run.input.travel.slice(0, last).reduce((a, b) => a + b, 0)
        return <tr key={type} data-role={step.truck === type ? 'active' : ''}><td>{type}</td><td>{last < 0 ? 'stays home' : last}</td><td>{drive}</td></tr>
      })}</tbody>
    </table>
    <output aria-label="Running total">{`Minutes so far: ${step.total}${step.truck ? `, ${step.truck} truck` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Each truck must visit its last house that holds its garbage, and it passes every earlier house on the way.</p>
    <p>The drive to any house is a prefix sum of travel times, so each truck costs one lookup.</p>
  </>} />
}
